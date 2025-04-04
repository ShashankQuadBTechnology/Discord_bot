import { gpt4o } from "../utils/model";
import { agentKit } from "../utils/evmAgent";
import { evmAgentState } from "../utils/state";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { EthereumTransferTool } from "solana-agent-kit/dist/langchain";
import { transferSwapPrompt } from "../prompts/transferSwap";
import { swapTool } from "../tools/swap";

const transferOrSwapAgent = createReactAgent({
  stateModifier: transferSwapPrompt,
  llm: gpt4o,
  tools: [new EthereumTransferTool(agentKit), swapTool],
});

export const transferSwapNode = async (
  state: typeof evmAgentState.State,
) => {
  const { messages } = state;

  const result = await transferOrSwapAgent.invoke({
    messages,
  });

  return result;
};

