import { Contract, formatEther } from "ethers";
import { EvmAgentKit } from "../../agent";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

/**
 * Get the balance of ETH or an ERC-20 token for the agent's wallet
 * @param agent - EvmAgentKit instance
 * @param tokenAddress - Optional ERC-20 token contract address. If not provided, returns ETH balance
 * @returns Promise resolving to the balance as a number (in human-readable format)
 */
export async function get_balance(
  agent: EvmAgentKit,
  tokenAddress?: string,
): Promise<number> {
  if (!tokenAddress) {
    const balance = await agent.provider.getBalance(agent.address);
    return parseFloat(formatEther(balance));
  }

  const contract = new Contract(tokenAddress, ERC20_ABI, agent.provider);
  const [rawBalance, decimals] = await Promise.all([
    contract.balanceOf(agent.address),
    contract.decimals(),
  ]);
  return Number(rawBalance) / Math.pow(10, decimals);
}
