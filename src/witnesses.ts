// Counter private state
export type CounterPrivateState = {
  privateCounter: number;
};

export const createPrivateState = (value: number): CounterPrivateState => {
  return {
    privateCounter: value,
  };
};

export const witnesses = {};

// Rebels private state
export type RebelsPrivateState = {
  secretKey: Uint8Array;
};

export const createRebelsPrivateState = (secretKey: Uint8Array): RebelsPrivateState => {
  return {
    secretKey,
  };
};

export const rebelsWitnesses = {
  localSecretKey: (context: any): [RebelsPrivateState, Uint8Array] => {
    // This will be called by the contract to get the user's secret key
    const privateState = context.privateState as RebelsPrivateState;
    return [privateState, privateState.secretKey];
  },
};
