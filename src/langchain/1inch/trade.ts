import { Tool } from "langchain/tools";
import { EvmAgentKit } from "../../agent";

export class EvmTradeTool extends Tool {
  name = "evm_trade";
  description = `This tool can be used to swap tokens to another token ( It uses 1inch DEX aggregator ).

  Inputs ( input is a JSON string ):
  outputToken: string, eg "0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2" (required)
  inputAmount: number, eg 1 or 0.01 (required)
  inputToken?: string, eg "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" (optional)
  slippageBps?: number, eg 100 (optional)`;

  constructor(private evmKit: EvmAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const tx = await this.evmKit.trade(
        parsedInput.outputToken,
        parsedInput.inputAmount,
        parsedInput.inputToken || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native ETH
        parsedInput.slippageBps,
      );

      return JSON.stringify({
        status: "success",
        message: "Trade executed successfully",
        transaction: tx,
        inputAmount: parsedInput.inputAmount,
        inputToken: parsedInput.inputToken || "ETH",
        outputToken: parsedInput.outputToken,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
