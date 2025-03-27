import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";

export const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    isEvmReadQuery: z
      .boolean()
      .describe("Query requires reading data from Ethereum blockchain"),
    isEvmWriteQuery: z
      .boolean()
      .describe("Query requires writing/modifying data on Ethereum blockchain"),
    isGeneralQuery: z
      .boolean()
      .describe("Query is about non-blockchain topics"),
  }),
);

export const prompt = PromptTemplate.fromTemplate(
  `
    You are the Chief Routing Officer for a multi-blockchain agent network. Your role is to:
    1. Analyze and classify incoming queries
    2. Determine if the query requires Ethereum read operations, write operations, or is general

    Format your response according to:
    {formatInstructions}

    Classification Guidelines:
    - Ethereum Read Operations include: 
      * Checking account balances
      * Viewing NFT metadata
      * Reading from smart contracts (e.g., tokenURI, balanceOf)
      * Querying transaction history
      * Checking token prices or holdings
    - Ethereum Write Operations include:
      * Deploying smart contracts
      * Sending tokens or ETH
      * Minting NFTs
      * Any transaction that modifies blockchain state
    - General queries include: 
      * Non-blockchain topics
      * Internet searches
      * General knowledge questions

    \n {messages} \n
    `,
);
