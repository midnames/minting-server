import express from "express";
import cors from "cors";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import {
  type CoinInfo,
  nativeToken,
  Transaction,
  type TransactionId,
} from "@midnight-ntwrk/ledger";
import {
  type BalancedTransaction,
  createBalancedTx,
  type MidnightProvider,
  type UnbalancedTransaction,
  type WalletProvider,
} from "@midnight-ntwrk/midnight-js-types";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import {
  getLedgerNetworkId,
  getZswapNetworkId,
  NetworkId,
  setNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { type Resource, WalletBuilder } from "@midnight-ntwrk/wallet";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import {
  findDeployedContract,
  type ContractProviders,
  type FoundContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import {
  MidnightBech32m,
  ShieldedCoinPublicKey,
  ShieldedAddress,
} from "@midnight-ntwrk/wallet-sdk-address-format";

// Adjust these paths based on your actual project structure
import * as Token from "./src/index.js";
import { witnesses } from "./src/witnesses.js";

import * as Rx from "rxjs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { type Logger } from "pino";
import pinoPretty from "pino-pretty";
import pino from "pino";

/* =================================================================================
 * Error helpers (ensures error "type" / name, message, stack, code, etc. are shown)
 * ================================================================================= */
interface ErrorInfo {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
  cause?: unknown;
  // allow library-specific props
  [k: string]: unknown;
}

function toErrorPayload(err: unknown): { success: false; error: ErrorInfo } {
  const base: { success: false; error: ErrorInfo } = {
    success: false,
    error: { name: "UnknownError", message: "Unknown error occurred" },
  };

  if (err instanceof Error) {
    const anyErr = err as any;
    base.error.name = err.name || "Error";
    base.error.message = err.message || base.error.message;
    if (err.stack) base.error.stack = err.stack;
    if ("code" in anyErr) base.error.code = anyErr.code;
    if ("cause" in anyErr && anyErr.cause) {
      base.error.cause =
        anyErr.cause instanceof Error
          ? { name: anyErr.cause.name, message: anyErr.cause.message }
          : anyErr.cause;
    }
    for (const k of Object.keys(anyErr)) {
      if (!(k in base.error)) base.error[k] = anyErr[k];
    }
    return base;
  }

  if (typeof err === "object" && err !== null) {
    const anyObj = err as any;
    const name =
      anyObj.name ?? (anyObj.constructor && anyObj.constructor.name) ?? "NonErrorThrowable";
    base.error.name = name;
    base.error.message = anyObj.message ?? JSON.stringify(anyObj);
    Object.assign(base.error, anyObj);
    return base;
  }

  // primitive
  base.error.name = typeof err;
  base.error.message = String(err);
  return base;
}

/* ======================
 * Types & Configuration
 * ====================== */
interface Config {
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly proofServer: string;
}

interface MintRequest {
  address: string;
}

interface MintResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  address?: string;
  error?: ErrorInfo;
}

class TestnetConfig implements Config {
  indexer = "https://indexer.testnet-02.midnight.network/api/v1/graphql";
  indexerWS = "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws";
  node = "https://rpc.testnet-02.midnight.network";
  proofServer = "https://ps.midnames.com";
  constructor() {
    setNetworkId(NetworkId.TestNet);
  }
}

/* ==============
 * Constants
 * ============== */
const GENESIS_MINT_WALLET_SEED =
  "557beb4d4bd5c88948712fd375b20f44ed9f38ade5e6ee8c27ece84d26de1640";
const TOKEN_CONTRACT_ADDRESS =
  "02004f20274ec45d2ba4d80a27cfd13b745ece742c033e6c9247731a16a43a76d594";
const PORT = process.env.PORT || 3000;

// __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Contract configuration
const contractConfig = {
  zkConfigPath: path.resolve(__dirname, "src", "managed", "token"),
};

/* =============
 * Logger setup
 * ============= */
const logger: Logger = pino(
  {
    level: "info",
    depthLimit: 20,
    serializers: { err: pino.stdSerializers.err },
  },
  pinoPretty({
    colorize: true,
    sync: true,
    customColors: "debug:green",
  })
);

// Instantiate contract class (used for types; concrete found instance created later)
const tokenContractInstance = new Token.Contract(witnesses);

/* =================
 * Helper functions
 * ================= */
const createWalletAndMidnightProvider = async (
  wallet: Wallet
): Promise<WalletProvider & MidnightProvider> => {
  const state = await Rx.firstValueFrom(wallet.state());
  return {
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,
    balanceTx(
      tx: UnbalancedTransaction,
      newCoins: CoinInfo[]
    ): Promise<BalancedTransaction> {
      return wallet
        .balanceTransaction(
          ZswapTransaction.deserialize(
            tx.serialize(getLedgerNetworkId()),
            getZswapNetworkId()
          ),
          newCoins
        )
        .then((tx) => wallet.proveTransaction(tx))
        .then((zswapTx) =>
          Transaction.deserialize(
            zswapTx.serialize(getZswapNetworkId()),
            getLedgerNetworkId()
          )
        )
        .then(createBalancedTx);
    },
    submitTx(tx: BalancedTransaction): Promise<TransactionId> {
      return wallet.submitTransaction(tx);
    },
  };
};

const waitForFunds = (wallet: Wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.tap((state) => {
        const applyGap = state.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = state.syncProgress?.lag.sourceGap ?? 0n;
        logger.info(
          `Backend lag: ${sourceGap}, wallet lag: ${applyGap}, transactions=${state.transactionHistory.length}`
        );
      }),
      Rx.filter((state) => state.syncProgress?.synced === true),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.filter((balance) => balance > 0n)
    )
  );

const buildWalletAndWaitForFunds = async (
  { indexer, indexerWS, node, proofServer }: Config,
  seed: string
): Promise<Wallet & Resource> => {
  logger.info("Building wallet from scratch");
  const wallet = await WalletBuilder.buildFromSeed(
    indexer,
    indexerWS,
    proofServer,
    node,
    seed,
    getZswapNetworkId(),
    "info"
  );
  wallet.start();

  const state = await Rx.firstValueFrom(wallet.state());
  logger.info(`Wallet seed: ${seed}`);
  logger.info(`Wallet address: ${state.address}`);
  let balance = state.balances[nativeToken()];
  if (balance === undefined || balance === 0n) {
    logger.info(`Wallet balance: 0 - waiting for tokens...`);
    balance = await waitForFunds(wallet);
  }
  logger.info(`Wallet balance: ${balance}`);
  return wallet;
};

const configureProviders = async (
  wallet: Wallet & Resource,
  config: Config
) => {
  const walletAndMidnightProvider = await createWalletAndMidnightProvider(wallet);
  const tokenContractInstance = new Token.Contract(witnesses);

  return {
    providers: {
      privateStateProvider: levelPrivateStateProvider<"tokenPrivateState">({
        privateStateStoreName: "token-private-state",
      }),
      publicDataProvider: indexerPublicDataProvider(
        config.indexer,
        config.indexerWS
      ),
      zkConfigProvider: new NodeZkConfigProvider<
        keyof typeof tokenContractInstance.impureCircuits
      >(contractConfig.zkConfigPath),
      proofProvider: httpClientProofProvider(config.proofServer),
      walletProvider: walletAndMidnightProvider,
      midnightProvider: walletAndMidnightProvider,
    } satisfies ContractProviders,
    tokenContractInstance,
  };
};

// Validation function
function validateAddress(address: string): boolean {
  try {
    const bech32Address = MidnightBech32m.parse(address);
    return (
      bech32Address.type === "shield-addr" ||
      bech32Address.type === "shield-cpk"
    );
  } catch {
    return false;
  }
}

// Mint function for server
async function mintTokensForAddress(
  contract: FoundContract<typeof tokenContractInstance>,
  targetAddress: string
): Promise<{ transactionId: string }> {
  logger.info(`Minting tokens for address: ${targetAddress}`);

  const bech32Address = MidnightBech32m.parse(targetAddress);
  let targetCoinPublicKey: { bytes: Uint8Array };

  if (bech32Address.type === "shield-addr") {
    const shieldedAddress = ShieldedAddress.codec.decode(
      getZswapNetworkId(),
      bech32Address
    );
    targetCoinPublicKey = {
      bytes: new Uint8Array(shieldedAddress.coinPublicKey.data),
    };
  } else if (bech32Address.type === "shield-cpk") {
    const coinPublicKey = ShieldedCoinPublicKey.codec.decode(
      getZswapNetworkId(),
      bech32Address
    );
    targetCoinPublicKey = {
      bytes: new Uint8Array(coinPublicKey.data),
    };
  } else {
    throw new TypeError(`Unsupported address type: ${bech32Address.type}`);
  }

  const result = await contract.callTx.mint_for(targetCoinPublicKey);
  logger.info(`Mint transaction completed. Tx: ${result.public.txId}`);

  return { transactionId: result.public.txId };
}

/* ================
 * Server class
 * ================ */
class TokenMintingServer {
  private app: express.Application;
  private wallet: (Wallet & Resource) | null = null;
  private contract: FoundContract<any> | null = null;
  private isInitialized = false;
  private config: Config;

  constructor() {
    this.app = express();
    this.config = new TestnetConfig();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get("/health", (_req, res) => {
      res.json({
        status: "healthy",
        initialized: this.isInitialized,
        timestamp: new Date().toISOString(),
      });
    });

    // Mint endpoint
    this.app.post("/mint", async (req, res) => {
      try {
        if (!this.isInitialized) {
          const payload: MintResponse = {
            success: false,
            message: "Server is still initializing. Please try again later.",
          };
          return res.status(503).json(payload);
        }

        const { address } = req.body as MintRequest;

        if (!address) {
          const payload: MintResponse = {
            success: false,
            message: "Address is required in request body",
          };
          return res.status(400).json(payload);
        }

        if (!validateAddress(address)) {
          const payload: MintResponse = {
            success: false,
            message:
              "Invalid address format. Expected shield-addr or shield-cpk address.",
            address,
          };
          return res.status(400).json(payload);
        }

        if (!this.contract) {
          const payload: MintResponse = {
            success: false,
            message: "Contract not initialized",
          };
          return res.status(500).json(payload);
        }

        const result = await mintTokensForAddress(this.contract, address);

        const payload: MintResponse = {
          success: true,
          transactionId: result.transactionId,
          message: "Tokens minted successfully",
          address,
        };
        res.json(payload);
      } catch (error) {
        logger.error({ err: error }, "Mint operation failed");
        const payload = toErrorPayload(error);
        res.status(500).json(payload);
      }
    });

    // Status endpoint
    this.app.get("/status", async (_req, res) => {
      try {
        if (!this.wallet || !this.isInitialized) {
          return res.json({ initialized: false, wallet: null });
        }
        const state = await Rx.firstValueFrom(this.wallet.state());
        res.json({
          initialized: this.isInitialized,
          wallet: {
            address: state.address,
            balance: state.balances[nativeToken()]?.toString() || "0",
            synced: state.syncProgress?.synced || false,
            transactionCount: state.transactionHistory.length,
          },
        });
      } catch (error) {
        logger.error({ err: error }, "Status check failed");
        res.status(500).json(toErrorPayload(error));
      }
    });

    // Test echo endpoint
    this.app.all("/test", (req, res) => {
      logger.info("Test endpoint called", {
        method: req.method,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params,
      });

      console.log(req.body.content.payload);
      res.json(req.body.content.payload);
    });
  }

  async initialize() {
    try {
      logger.info("Initializing token minting server...");

      // Build wallet
      this.wallet = await buildWalletAndWaitForFunds(
        this.config,
        GENESIS_MINT_WALLET_SEED
      );

      // Configure providers
      const { providers, tokenContractInstance } = await configureProviders(
        this.wallet,
        this.config
      );

      // Connect to contract
      logger.info(`Connecting to token contract at: ${TOKEN_CONTRACT_ADDRESS}`);
      this.contract = await findDeployedContract(providers, {
        contractAddress: TOKEN_CONTRACT_ADDRESS,
        contract: tokenContractInstance,
        privateStateId: "tokenPrivateState",
        initialPrivateState: {},
      });

      this.isInitialized = true;
      logger.info("Server initialization completed successfully");
    } catch (error) {
      logger.error({ err: error }, "Initialization failure");
      throw error;
    }
  }

  async start() {
    await this.initialize();

    return new Promise<void>((resolve) => {
      this.app.listen(PORT, () => {
        logger.info(`🪙 Token Minting Server running on port ${PORT}`);
        logger.info(`📊 Health check: http://localhost:${PORT}/health`);
        logger.info(`📈 Status: http://localhost:${PORT}/status`);
        logger.info(`🚀 Mint endpoint: POST http://localhost:${PORT}/mint`);
        logger.info(`🧪 Test: POST/GET http://localhost:${PORT}/test`);
        resolve();
      });
    });
  }

  async shutdown() {
    logger.info("Shutting down server...");
    if (this.wallet) {
      await this.wallet.close();
      logger.info("Wallet closed");
    }
  }
}

/* =========================
 * Graceful shutdown + boot
 * ========================= */
const server = new TokenMintingServer();

process.on("SIGINT", async () => {
  logger.info("Received SIGINT, shutting down gracefully");
  await server.shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, shutting down gracefully");
  await server.shutdown();
  process.exit(0);
});

// Start server when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  server.start().catch((error) => {
    logger.error({ err: error }, "Failed to start server");
    // Optional: print a structured payload too
    logger.error(toErrorPayload(error), "Startup error payload");
    process.exit(1);
  });
}

export default server;
