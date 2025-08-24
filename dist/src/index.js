export * as Counter from "./managed/counter/contract/index.cjs";
export * as Rebels from "./managed/rebels/contract/index.cjs";
export * from "./witnesses";
import CounterModule from './managed/counter/contract/index.cjs';
import RebelsModule from './managed/rebels/contract/index.cjs';
// Counter exports
export const ledger = CounterModule.ledger;
export const pureCircuits = CounterModule.pureCircuits;
export const { Contract } = CounterModule;
// Rebels exports
export const rebelsLedger = RebelsModule.ledger;
export const rebelsPureCircuits = RebelsModule.pureCircuits;
export const RebelsContract = RebelsModule.Contract;
//# sourceMappingURL=index.js.map