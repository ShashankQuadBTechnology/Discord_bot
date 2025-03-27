import { agentKit } from "../utils/evmAgent";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ethers } from "ethers";

export const swapTool = tool(
  async ({ outputTokenAddress, inputAmount, inputTokenAddress, inputDecimal }) => {
    try {
      const inputAmountWithDecimals = ethers.parseUnits(
        inputAmount.toString(),
        inputDecimal
      );

      console.log(inputAmountWithDecimals, outputTokenAddress, inputTokenAddress);

      const txHash = await agentKit.trade(
        inputTokenAddress,
        outputTokenAddress,
        inputAmountWithDecimals,
        200 // slippage in bps
      );

      return txHash;
    } catch (error) {
      console.error(error);
      return "error";
    }
  },
  {
    name: "swap",
    description: "Call to swap/trade tokens from one ERC-20 token to another using 1inch exchange",
    schema: z.object({
      outputTokenAddress: z
        .string()
        .describe("The contract address of the destination ERC-20 token"),
      inputAmount: z
        .number()
        .describe("The input amount of the ERC-20 token to be swapped (human-readable, no decimals applied)"),
      inputTokenAddress: z
        .string()
        .describe("The contract address of the origin ERC-20 token"),
      inputDecimal: z
        .number()
        .describe("The decimal of the input token that is being traded"),
    }),
  }
);
