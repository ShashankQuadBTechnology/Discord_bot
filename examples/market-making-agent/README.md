# AI Guided Market Making Agent (EVM)

This agent demonstrates an AI-guided market maker for the EVM-compatible chain using the 0x protocol. It assists the user in setting up basic two-sided quotes for any ERC20 trading pair supported by 0x.

## Key Features

- **Automated Quoting**: Automatically places buy and sell orders based on user-configured depth and frequency.
- **Simplified Setup**: Abstracts away the complexities of gas management, slippage, and liquidity splitting.
- **Front-Running Protection**: Uses randomized quoting within a range to make quotes less predictable.

## Example
=== Market Maker Configuration ===

Enter the maker token address (e.g., USDC): 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48  
Enter the taker token address (e.g., WETH): 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2  

=== Quote Parameters (applies to both buy and sell sides) ===  
Enter number of quotes to place on each side: 4  
Enter minimum quote depth (% distance from mid price): 0.1  
Enter maximum quote depth (% distance from mid price): 2  

=== Token Allowances ===  
Enter total USDC allowance: 100  
Enter total WETH allowance: 0.2  

Enter update interval in seconds: 30

=== Configuration Summary ===
{
  "makerToken": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "takerToken": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "quoteParams": {
    "number": 4,
    "minDepth": 0.1,
    "maxDepth": 2
  },
  "allowance": {
    "maker": 100,
    "taker": 0.2
  },
  "intervalSeconds": 30
}

Is this configuration correct? (yes/no): yes

Starting market maker mode for USDC/WETH...
