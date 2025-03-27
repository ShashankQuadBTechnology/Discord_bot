import { evmAgentState } from "./state";
import { END } from "@langchain/langgraph";

export const managerRouter = (state: typeof evmAgentState.State) => {
  const { isEvmReadQuery, isEvmWriteQuery, isGeneralQuery } = state;

  if (isGeneralQuery) {
    return "generalist";
  } else if (isEvmWriteQuery) {
    return "transferSwap";
  } else if (isEvmReadQuery) {
    return "read";
  } else {
    return END;
  }
};
