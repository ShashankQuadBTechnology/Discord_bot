import { Tool } from "langchain/tools";
import { EvmAgentKit } from "../../agent";

/**
 * Tool to get the balance of an Ethereum wallet or ERC-20 token account.
 *
 * If you want to get the balance of your wallet, you don't need to provide the tokenAddress.
 * If no tokenAddress is provided, the balance will be in ETH.
 *
 * Inputs (input is a JSON string):
 * - tokenAddress: string (optional), the contract address of the ERC-20 token
 */
export class EthereumBalanceTool extends Tool {
  name = "ethereum_balance";
  description = `Get the balance of an Ethereum wallet or ERC-20 token account.

  If you want to get the balance of your wallet, you don't need to provide the tokenAddress.
  If no tokenAddress is provided, the balance will be in ETH.

  Inputs (input is a JSON string):
  - tokenAddress: string (optional), e.g. "0xdAC17F958D2ee523a2206206994597C13D831ec7"`;

  constructor(private evmKit: EvmAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsed = input ? JSON.parse(input) : {};
      const tokenAddress = parsed.tokenAddress;
      const balance = await this.evmKit.getBalance(tokenAddress);

      return JSON.stringify({
        status: "success",
        balance,
        token: tokenAddress || "ETH",
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
