import { EvmAgentKit } from "../../index";
import { ethers } from "ethers";
import fetch from "node-fetch";

const ONE_INCH_API = "https://api.1inch.io/v5.0/1"; // 1 = Ethereum Mainnet

export async function trade(
  agent: EvmAgentKit,
  outputToken: string,
  inputAmount: number,
  inputToken: string,
  slippageBps: number = 200
): Promise<string> {
  try {
    // Step 1: Get decimals of input token
    const inputTokenContract = new ethers.Contract(
      inputToken,
      ["function decimals() view returns (uint8)"],
      agent.provider
    );

    const decimals: number = await inputTokenContract.decimals();
    const amountIn = ethers.parseUnits(inputAmount.toString(), decimals);

    // Step 2: Get swap quote from 1inch
    const slippagePercent = slippageBps / 100;
    const quoteUrl = `${ONE_INCH_API}/quote?fromTokenAddress=${inputToken}&toTokenAddress=${outputToken}&amount=${amountIn.toString()}`;
    const quoteResponse = await fetch(quoteUrl);
    const quote = (await quoteResponse.json()) as { toTokenAmount: string };

    if (!quote || !quote.toTokenAmount) {
      throw new Error("Failed to fetch quote from 1inch");
    }

    // Step 3: Get swap transaction
    const swapUrl = `${ONE_INCH_API}/swap?fromTokenAddress=${inputToken}&toTokenAddress=${outputToken}&amount=${amountIn.toString()}&fromAddress=${agent.wallet.address}&slippage=${slippagePercent}&disableEstimate=true`;
    const swapResponse = await fetch(swapUrl);
    const swapData = (await swapResponse.json()) as {
        tx: {
          to: string;
          data: string;
          value: string;
          gas?: string;
        };
      };

    if (!swapData || !swapData.tx) {
      throw new Error("Failed to fetch swap transaction from 1inch");
    }

    // Step 4: Send transaction
    const tx = await agent.wallet.sendTransaction({
        to: swapData.tx.to,
        data: swapData.tx.data,
        value: swapData.tx.value ? BigInt(swapData.tx.value) : null,
        gasLimit: swapData.tx.gas ? BigInt(swapData.tx.gas) : null,
      });

    return tx.hash;
  } catch (error: any) {
    throw new Error(`Swap failed: ${error.message}`);
  }
}