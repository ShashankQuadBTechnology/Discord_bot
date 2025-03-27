import { prompt, parser } from "../prompts/manager";
import { RunnableSequence } from "@langchain/core/runnables";
import { evmAgentState } from "../utils/state";
import { gpt4o } from "../utils/model";

const chain = RunnableSequence.from([prompt, gpt4o, parser]);

export const managerNode = async (state: typeof evmAgentState.State) => {
  const { messages } = state;

  const result = await chain.invoke({
    formatInstructions: parser.getFormatInstructions(),
    messages: messages,
  });

  const { isEvmReadQuery, isEvmWriteQuery, isGeneralQuery } = result;

  return {
    isEvmReadQuery,
    isEvmWriteQuery,
    isGeneralQuery,
  };
};
