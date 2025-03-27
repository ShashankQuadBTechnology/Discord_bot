import { JsonRpcProvider, Wallet } from "ethers";
 
import { DEFAULT_OPTIONS } from "../constants";

import {
  fetchPrice,
  get_balance,
  transfer,
  trade
} from "../tools";

import {
    Config
  } from "../types";

/**
 * Main class for interacting with Ethereum blockchain
 * Provides a unified interface for token operations, NFT management, trading and more
 *
 * @class EvmAgentKit
 * @property {JsonRpcProvider} provider - EVM-compatible RPC connection
 * @property {Wallet} wallet - Wallet for signing transactions
 * @property {string} address - Wallet address
 * @property {Config} config - Configuration object
 */

export class EvmAgentKit {
  public provider: JsonRpcProvider;
  public wallet: Wallet;
  public address: string;
  public config: Config;

  constructor(
    privateKey: string,
    rpcUrl: string,
    config: Config
  ) {
    this.provider = new JsonRpcProvider(rpcUrl || "https://mainnet.infura.io/v3/");
    this.wallet = new Wallet(privateKey, this.provider);
    this.address = this.wallet.address;
    this.config = config;
  }
  
  async fetchTokenPrice(tokenAddress: string) {
    return fetchPrice(tokenAddress);
  }

  async getBalance(token_address?: string): Promise<number> {
    return get_balance(this, token_address);
  }

  async transfer(
    to: string,
    amount: number,
    tokenAddress?: string,
  ): Promise<string> {
    return transfer(this, to, amount, tokenAddress);
  }

  async trade(
    outputToken: string,
    inputAmount: number,
    inputToken: string,
    slippageBps: number = DEFAULT_OPTIONS.SLIPPAGE_BPS
  ): Promise<string> {
    return trade(this, outputToken, inputAmount, inputToken, slippageBps);
  }

}