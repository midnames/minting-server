export const createPrivateState = (value) => {
    return {
        privateCounter: value,
    };
};
export const witnesses = {};
export const createRebelsPrivateState = (secretKey) => {
    return {
        secretKey,
    };
};
export const rebelsWitnesses = {
    localSecretKey: (context) => {
        // This will be called by the contract to get the user's secret key
        const privateState = context.privateState;
        return [privateState, privateState.secretKey];
    },
};
//# sourceMappingURL=witnesses.js.map