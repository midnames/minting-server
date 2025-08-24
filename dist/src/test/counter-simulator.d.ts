import { type CircuitContext } from "@midnight-ntwrk/compact-runtime";
import { Contract, type Ledger } from "../managed/counter/contract/index.cjs";
import { type CounterPrivateState } from "../witnesses.js";
export declare const logger: import("pino").default.Logger<never>;
export declare class CounterSimulator {
    readonly contract: Contract<CounterPrivateState>;
    circuitContext: CircuitContext<CounterPrivateState>;
    constructor();
    getLedger(): Ledger;
    getPrivateState(): CounterPrivateState;
    increment(): Ledger;
}
//# sourceMappingURL=counter-simulator.d.ts.map