import { Tool } from "langchain/tools";
import { EvmAgentKit } from "../../agent";

export class EthereumTransferTool extends Tool {
  name = "ethereum_transfer";
  description = `Transfer ETH or ERC-20 tokens to another address (also called wallet address).

  Inputs (input is a JSON string):
  - to: string, e.g., "0xabc123...DEF" (required)
  - amount: number, e.g., 1.5 (required)
  - tokenAddress?: string, e.g., "0xdAC17F958D2ee523a2206206994597C13D831ec7" (optional for ERC-20 transfers)`;

  constructor(private evmKit: EvmAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const recipient = parsedInput.to;
      const tokenAddress = parsedInput.tokenAddress;

      const tx = await this.evmKit.transfer(
        recipient,
        parsedInput.amount,
        tokenAddress
      );

      return JSON.stringify({
        status: "success",
        message: "Transfer completed successfully",
        amount: parsedInput.amount,
        recipient: parsedInput.to,
        token: parsedInput.tokenAddress || "ETH",
        transaction: tx,
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
