export * as Counter from "./managed/counter/contract/index.cjs";
export * as Rebels from "./managed/rebels/contract/index.cjs";
export * from "./witnesses";

import CounterModule from './managed/counter/contract/index.cjs';
import RebelsModule from './managed/rebels/contract/index.cjs';
import type { Contract as CounterContractType, Witnesses as CounterWitnesses } from './managed/counter/contract/index.cjs';
import type { Contract as RebelsContractClass, Witnesses as RebelsWitnesses } from './managed/rebels/contract/index.cjs';

// Counter exports
export const ledger = CounterModule.ledger;
export const pureCircuits = CounterModule.pureCircuits;
export const { Contract } = CounterModule;
export type Contract<T, W extends CounterWitnesses<T> = CounterWitnesses<T>> = CounterContractType<T, W>;
export type Ledger = CounterModule.Ledger;

// Rebels exports
export const rebelsLedger = RebelsModule.ledger;
export const rebelsPureCircuits = RebelsModule.pureCircuits;
export const RebelsContract = RebelsModule.Contract;
export type RebelsContractType<T, W extends RebelsWitnesses<T> = RebelsWitnesses<T>> = RebelsContractClass<T, W>;
export type RebelsLedger = RebelsModule.Ledger;
