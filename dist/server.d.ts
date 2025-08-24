declare class TokenMintingServer {
    private app;
    private wallet;
    private contract;
    private isInitialized;
    private config;
    constructor();
    private setupMiddleware;
    private setupRoutes;
    initialize(): Promise<void>;
    start(): Promise<void>;
    shutdown(): Promise<void>;
}
declare const server: TokenMintingServer;
export default server;
//# sourceMappingURL=server.d.ts.map