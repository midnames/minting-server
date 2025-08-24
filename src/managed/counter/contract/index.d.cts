import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum State { VACANT = 0, OCCUPIED = 1 }

export type Witnesses<T> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
}

export type ImpureCircuits<T> = {
  increment(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
  post(context: __compactRuntime.CircuitContext<T>, newMessage_0: string): __compactRuntime.CircuitResults<T, []>;
  takeDown(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, string>;
}

export type PureCircuits = {
  publicKey(sk_0: Uint8Array, sequence_0: Uint8Array): Uint8Array;
}

export type Circuits<T> = {
  increment(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
  post(context: __compactRuntime.CircuitContext<T>, newMessage_0: string): __compactRuntime.CircuitResults<T, []>;
  takeDown(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, string>;
  publicKey(context: __compactRuntime.CircuitContext<T>,
            sk_0: Uint8Array,
            sequence_0: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
}

export type Ledger = {
  readonly round: bigint;
  readonly state: State;
  readonly message: { is_some: boolean, value: string };
  readonly sequence: bigint;
  readonly owner: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
