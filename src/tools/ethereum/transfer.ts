import { ethers } from "ethers";
import { EvmAgentKit } from "../../index";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

/**
 * Transfer ETH or ERC-20 tokens to a recipient
 * @param agent EvmAgentKit instance
 * @param to Recipient's address
 * @param amount Amount to transfer (in human-readable format)
 * @param tokenAddress Optional ERC-20 token contract address
 * @returns Transaction hash
 */
export async function transfer(
  agent: EvmAgentKit,
  to: string,
  amount: number,
  tokenAddress?: string
): Promise<string> {
  try {
    if (!tokenAddress) {
      // Transfer ETH
      const tx = await agent.wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount.toString())
      });
      return tx.hash;
    } else {
      // Transfer ERC-20 Token
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, agent.wallet);
      const decimals: number = await contract.decimals();
      const adjustedAmount = ethers.parseUnits(amount.toString(), decimals);
      const tx = await contract.transfer(to, adjustedAmount);
      return tx.hash;
    }
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error.message}`);
  }
}
