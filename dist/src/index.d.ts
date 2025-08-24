export * as Counter from "./managed/counter/contract/index.cjs";
export * as Rebels from "./managed/rebels/contract/index.cjs";
export * from "./witnesses";
import CounterModule from './managed/counter/contract/index.cjs';
import RebelsModule from './managed/rebels/contract/index.cjs';
import type { Contract as CounterContractType, Witnesses as CounterWitnesses } from './managed/counter/contract/index.cjs';
import type { Contract as RebelsContractClass, Witnesses as RebelsWitnesses } from './managed/rebels/contract/index.cjs';
export declare const ledger: typeof CounterModule.ledger;
export declare const pureCircuits: CounterModule.PureCircuits;
export declare const Contract: typeof CounterModule.Contract;
export type Contract<T, W extends CounterWitnesses<T> = CounterWitnesses<T>> = CounterContractType<T, W>;
export type Ledger = CounterModule.Ledger;
export declare const rebelsLedger: typeof RebelsModule.ledger;
export declare const rebelsPureCircuits: RebelsModule.PureCircuits;
export declare const RebelsContract: typeof RebelsModule.Contract;
export type RebelsContractType<T, W extends RebelsWitnesses<T> = RebelsWitnesses<T>> = RebelsContractClass<T, W>;
export type RebelsLedger = RebelsModule.Ledger;
//# sourceMappingURL=index.d.ts.map