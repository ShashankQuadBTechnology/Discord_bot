import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { gpt4o } from "../utils/model";
import { evmAgentState } from "../utils/state";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// Initialize tools array
const searchTools = [];

// Only add Tavily search if API key is available
if (process.env.TAVILY_API_KEY) {
  searchTools.push(new TavilySearchResults());
}

//sets up the core loop of Reasoning acting observe and repeat between LLm and the tools
const generalAgent = createReactAgent({
  llm: gpt4o,
  tools: searchTools,
});

export const generalistNode = async (state: typeof evmAgentState.State) => {
  const { messages } = state;

  const result = await generalAgent.invoke({ messages });

  return { messages: [...result.messages] };
};