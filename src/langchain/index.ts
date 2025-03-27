export * from "./1inch";
export * from "./ethereum";

import type { EvmAgentKit } from "../agent";


import {
    EthereumBalanceTool,
    EthereumFetchPriceTool,
    EthereumTransferTool
} from "./index";

export function createEvmTools(evmKit: EvmAgentKit) {
    return [
      new EthereumBalanceTool( evmKit ) ,
      new EthereumFetchPriceTool( evmKit ) ,
      new EthereumTransferTool( evmKit )
    ];
}
