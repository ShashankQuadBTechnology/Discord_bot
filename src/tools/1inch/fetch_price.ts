/**
 * Fetch the price of a given token quoted in USDC using the 1inch API
 * @param tokenAddress The  token contract address
 * @returns The price of the token quoted in USDC
 */
export async function fetchPrice(tokenAddress: string): Promise<string> {
  const chainId = 1; // Ethereum mainnet
  const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC token address
  const amountIn = "1000000000000000000"; // 1 token in wei

  try {
    const response = await fetch(
      `https://api.1inch.dev/swap/v5.2/${chainId}/quote?fromTokenAddress=${tokenAddress}&toTokenAddress=${usdcAddress}&amount=${amountIn}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONE_INCH_API_KEY || ""}`,
          //@comeback to add this in env
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }

    const data = await response.json();
    const price = parseFloat(data.toTokenAmount) / 10 ** data.toToken.decimals;

    if (!price) {
      throw new Error("Price data not available for the given token.");
    }

    return price.toString();
  } catch (error: any) {
    throw new Error(`Price fetch failed: ${error.message}`);
  }
}
