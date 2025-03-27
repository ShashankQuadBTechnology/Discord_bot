import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { gpt4o } from "../utils/model";
import { evmAgentState } from "../utils/state";
import { agentKit } from "../utils/evmAgent";
import {
  EthereumBalanceTool,
  EthereumFetchPriceTool,
} from "evm-agent-kit/dist/langchain";
import { readOperationsPrompt } from "../prompts/read";

const readAgent = createReactAgent({
  stateModifier: readOperationsPrompt,
  llm: gpt4o,
  tools: [new EthereumBalanceTool(agentKit), new EthereumFetchPriceTool(agentKit)],
});

export const readNode = async (state: typeof evmAgentState.State) => {
  const { messages } = state;

  const result = await readAgent.invoke({ messages });

  return { messages: [...result.messages] };
};
