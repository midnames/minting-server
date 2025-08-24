declare class RebelsServer {
    private app;
    private wallet;
    private rebelsContract;
    private isInitialized;
    private config;
    constructor();
    private setupMiddleware;
    private setupRoutes;
    initialize(): Promise<void>;
    start(): Promise<void>;
    shutdown(): Promise<void>;
}
declare const server: RebelsServer;
export default server;
//# sourceMappingURL=server.d.ts.map