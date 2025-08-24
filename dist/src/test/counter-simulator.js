import { QueryContext, sampleContractAddress, constructorContext } from "@midnight-ntwrk/compact-runtime";
import { Contract, ledger } from "../managed/counter/contract/index.cjs";
import { witnesses } from "../witnesses.js";
import { createLogger } from '../logger-utils.js';
import { LogicTestingConfig } from '../config.js';
// This is over-kill for such a simple contract, but the same pattern can be used to test more
// complex contracts.
const config = new LogicTestingConfig();
export const logger = await createLogger(config.logDir);
export class CounterSimulator {
    contract;
    circuitContext;
    constructor() {
        this.contract = new Contract(witnesses);
        const { currentPrivateState, currentContractState, currentZswapLocalState } = this.contract.initialState(constructorContext({ privateCounter: 0 }, "0".repeat(64)));
        this.circuitContext = {
            currentPrivateState,
            currentZswapLocalState,
            originalState: currentContractState,
            transactionContext: new QueryContext(currentContractState.data, sampleContractAddress())
        };
    }
    getLedger() {
        return ledger(this.circuitContext.transactionContext.state);
    }
    getPrivateState() {
        return this.circuitContext.currentPrivateState;
    }
    increment() {
        // Update the current context to be the result of executing the circuit.
        const circuitResults = this.contract.impureCircuits.increment(this.circuitContext);
        logger.info({
            section: 'Circuit Context',
            currentPrivateState: circuitResults.context.currentPrivateState,
            currentZswapLocalState: circuitResults.context.currentZswapLocalState,
            originalState: circuitResults.context.originalState,
            transactionContext_address: circuitResults.context.transactionContext.address,
            transactionContext_block: circuitResults.context.transactionContext.block,
            transactionContext_comIndicies: circuitResults.context.transactionContext.comIndicies,
            transactionContext_effects: circuitResults.context.transactionContext.effects,
            transactionContext_state: circuitResults.context.transactionContext.state,
        });
        logger.info({
            section: 'Circuit Proof Data',
            input: circuitResults.proofData.input,
            output: circuitResults.proofData.output,
            privateTranscriptOutputs: circuitResults.proofData.privateTranscriptOutputs,
            publicTranscript: circuitResults.proofData.publicTranscript,
        });
        logger.info({
            section: 'Circuit result',
            result: circuitResults.result,
        });
        this.circuitContext = circuitResults.context;
        return ledger(this.circuitContext.transactionContext.state);
    }
}
//# sourceMappingURL=counter-simulator.js.map