# 🪙 Midnight Token Minting Server

> An Express.js server for minting tokens on the Midnight Network blockchain.

![Midnight Network](https://img.shields.io/badge/Midnight-Network-purple)
![Express.js](https://img.shields.io/badge/Express.js-4.18-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)

## 🚀 What is this?

The following repository contains a **token minting server** built for the Midnight Network - a privacy-focused blockchain. It is used as a private oracle for our PoH (Proof of History) journalist validation.

### ✨ Key Features

- 🎯 **One-click token minting** via REST API
- 🔐 **Privacy-first** using Midnight Network's zero-knowledge technology
- ⚡ **Fast setup** - get running in minutes
- 📊 **Health monitoring** with status endpoints (testing & health endpoints)
- 🌐 **CORS enabled** for web integration

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Docker
- Access to Midnight Network testnet

### Installation & Setup
**With docker**
```bash
# Build the docker image to later deploy instances
docker build -t <your-mint-server-name> .

docker run -p 3000:3000 --name <your-container-name> -d <your-mint-server-name>


```

Server runs on `http://localhost:3000` by default.

## 🔧 API Reference

### Core Endpoints

#### `POST /mint` - Mint tokens to any address
```bash
curl -X POST http://localhost:3000/mint \
  -H "Content-Type: application/json" \
  -d '{"address": "taddr1..."}'
```

**Response:**
```json
{
  "success": true,
  "transactionId": "abc123...",
  "message": "Tokens minted successfully",
  "address": "taddr1..."
}
```

#### `GET /status` - Check server and wallet status
```bash
curl http://localhost:3000/status
```

#### `GET /health` - Health check
```bash
curl http://localhost:3000/health
```

### Smart Contract (`token.compact`)

The heart of the system - a Compact smart contract with two key functions:

- **`mint()`** - Mint tokens to contract owner
- **`mint_for(addr)`** - Mint tokens to any specified address

Each mint creates **1 token** with the identifier `"midnames"`.

### Network Configuration
Currently configured for **Midnight Testnet**:
- Indexer: `https://indexer.testnet-02.midnight.network`
- RPC Node: `https://rpc.testnet-02.midnight.network`
- Proof Server: `https://ps.midnames.com`

## 📊 Monitoring

The server includes comprehensive monitoring:

- **Health checks** - Server status and initialization state
- **Wallet monitoring** - Balance, sync status, transaction history
- **Transaction logging** - All mint operations are logged
- **Error tracking** - Structured error reporting

## 🐛 Development

### Available Scripts

```bash
npm run dev        # Start with hot reload
npm run build      # Build TypeScript
npm run start      # Run production build
npm run lint       # Lint code
npm run compact    # Compile smart contract
```

### Project Structure

```
minting-server/
├── server.ts              # Main Express server
├── src/
│   ├── index.ts          # Contract exports
│   ├── witnesses.ts      # ZK proof witnesses
│   ├── token.compact     # Smart contract source
│   └── managed/          # Compiled contract artifacts
│       └── token/
│           ├── contract/ # Generated TypeScript bindings
│           ├── keys/     # Proof/verification keys
│           └── zkir/     # Zero-knowledge intermediate representation
├── midnight-level-db/    # Local blockchain state
└── package.json
```

## 🎪 Demo & Testing

Test the server instantly:

```bash
# Start server
npm run dev

# Test mint (replace with real address)
curl -X POST http://localhost:3000/mint \
  -H "Content-Type: application/json" \
  -d '{"address":"your-midnight-address-here"}'

# Check status
curl http://localhost:3000/status
```

## 🌟 On our dApp lifecycle
- **Privacy by design** - Zero-knowledge proofs protect user data
- **Programmable privacy** - Smart contracts with built-in privacy features
- **Developer friendly** - Compact language for easy smart contract development
- **Scalable** - High throughput with privacy guarantees
