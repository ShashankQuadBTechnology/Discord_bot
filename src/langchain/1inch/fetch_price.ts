import { Tool } from "langchain/tools";
import { EvmAgentKit } from "../../agent";


/**
 * Tool to fetch the price of a token in USDC
 */
export class EthereumFetchPriceTool extends Tool {
  name = "ethereum_fetch_price";
  description = `Fetch the price of a given token in USDC.

  Inputs:
  - tokenAddress: string, the contract address of the token, e.g., "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"`;

  constructor(private evmKit: EvmAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const price = await this.evmKit.fetchTokenPrice(input.trim());
      return JSON.stringify({
        status: "success",
        tokenId: input.trim(),
        priceInUSDC: price,
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
