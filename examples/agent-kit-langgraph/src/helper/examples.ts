import { HumanMessage } from "@langchain/core/messages";

export const generalQuestion = [
  new HumanMessage("Who is the president of Ecuador?"),
];

export const evmReadQuery = [new HumanMessage("what is the price of ETH")];

export const evmWriteQuery = [new HumanMessage("swap 0.1 usdc to eth")];
