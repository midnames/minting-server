export type CounterPrivateState = {
    privateCounter: number;
};
export declare const createPrivateState: (value: number) => CounterPrivateState;
export declare const witnesses: {};
export type RebelsPrivateState = {
    secretKey: Uint8Array;
};
export declare const createRebelsPrivateState: (secretKey: Uint8Array) => RebelsPrivateState;
export declare const rebelsWitnesses: {
    localSecretKey: (context: any) => [RebelsPrivateState, Uint8Array];
};
//# sourceMappingURL=witnesses.d.ts.map