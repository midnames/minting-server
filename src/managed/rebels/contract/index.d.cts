import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Post = { author: Uint8Array;
                     content: string;
                     plusVotes: bigint;
                     minusVotes: bigint
                   };

export type Witnesses<T> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
}

export type ImpureCircuits<T> = {
  addNewHuman(context: __compactRuntime.CircuitContext<T>, pk_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  suggestNewUser(context: __compactRuntime.CircuitContext<T>, pk_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  publishPost(context: __compactRuntime.CircuitContext<T>, content_0: string): __compactRuntime.CircuitResults<T, bigint>;
  votePlus(context: __compactRuntime.CircuitContext<T>, postId_0: bigint): __compactRuntime.CircuitResults<T, []>;
  voteMinus(context: __compactRuntime.CircuitContext<T>, postId_0: bigint): __compactRuntime.CircuitResults<T, []>;
  flagPost(context: __compactRuntime.CircuitContext<T>, postId_0: bigint): __compactRuntime.CircuitResults<T, []>;
  removeIllegalContent(context: __compactRuntime.CircuitContext<T>,
                       postId_0: bigint): __compactRuntime.CircuitResults<T, []>;
  getPost(context: __compactRuntime.CircuitContext<T>, postId_0: bigint): __compactRuntime.CircuitResults<T, { is_some: boolean,
                                                                                                               value: Post
                                                                                                             }>;
  getReputation(context: __compactRuntime.CircuitContext<T>,
                userKey_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
  getUserAlias(context: __compactRuntime.CircuitContext<T>,
               userKey_0: Uint8Array): __compactRuntime.CircuitResults<T, { is_some: boolean,
                                                                            value: string
                                                                          }>;
}

export type PureCircuits = {
  publicKey(sk_0: Uint8Array): Uint8Array;
}

export type Circuits<T> = {
  addNewHuman(context: __compactRuntime.CircuitContext<T>, pk_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  suggestNewUser(context: __compactRuntime.CircuitContext<T>, pk_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  publicKey(context: __compactRuntime.CircuitContext<T>, sk_0: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  publishPost(context: __compactRuntime.CircuitContext<T>, content_0: string): __compactRuntime.CircuitResults<T, bigint>;
  votePlus(context: __compactRuntime.CircuitContext<T>, postId_0: bigint): __compactRuntime.CircuitResults<T, []>;
  voteMinus(context: __compactRuntime.CircuitContext<T>, postId_0: bigint): __compactRuntime.CircuitResults<T, []>;
  flagPost(context: __compactRuntime.CircuitContext<T>, postId_0: bigint): __compactRuntime.CircuitResults<T, []>;
  removeIllegalContent(context: __compactRuntime.CircuitContext<T>,
                       postId_0: bigint): __compactRuntime.CircuitResults<T, []>;
  getPost(context: __compactRuntime.CircuitContext<T>, postId_0: bigint): __compactRuntime.CircuitResults<T, { is_some: boolean,
                                                                                                               value: Post
                                                                                                             }>;
  getReputation(context: __compactRuntime.CircuitContext<T>,
                userKey_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
  getUserAlias(context: __compactRuntime.CircuitContext<T>,
               userKey_0: Uint8Array): __compactRuntime.CircuitResults<T, { is_some: boolean,
                                                                            value: string
                                                                          }>;
}

export type Ledger = {
  authorizedUsers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  userAliases: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): string;
    [Symbol.iterator](): Iterator<[Uint8Array, string]>
  };
  userReputation: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly postCounter: bigint;
  posts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Post;
    [Symbol.iterator](): Iterator<[bigint, Post]>
  };
  plusVoters: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): {
      isEmpty(): boolean;
      size(): bigint;
      member(elem_0: Uint8Array): boolean;
      [Symbol.iterator](): Iterator<Uint8Array>
    }
  };
  minusVoters: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): {
      isEmpty(): boolean;
      size(): bigint;
      member(elem_0: Uint8Array): boolean;
      [Symbol.iterator](): Iterator<Uint8Array>
    }
  };
  flaggedPosts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): {
      isEmpty(): boolean;
      size(): bigint;
      member(elem_0: Uint8Array): boolean;
      [Symbol.iterator](): Iterator<Uint8Array>
    }
  };
  readonly prohibitedMaterialAuthority: Uint8Array;
  readonly removalVoteThreshold: bigint;
  journalists: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  humans: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  referrals: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly HUMAN_AUTHORITY: { bytes: Uint8Array };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>,
               initialSecretKeys_0: Uint8Array[],
               aliases_0: string[],
               authoritySecretKey_0: Uint8Array,
               threshold_0: bigint): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
