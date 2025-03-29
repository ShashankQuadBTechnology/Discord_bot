export * from "./1inch";
export * from "./ethereum";
export * from "./0x";

import type { EvmAgentKit } from "../agent";


import {
    EthereumBalanceTool,
    EthereumFetchPriceTool,
    EthereumTransferTool,
    EvmTradeTool,
    EthereumBatchOrderTool
} from "./index";

export function createEvmTools(evmKit: EvmAgentKit) {
    return [
      new EthereumBalanceTool( evmKit ) ,
      new EthereumFetchPriceTool( evmKit ) ,
      new EthereumTransferTool( evmKit ),
      new EvmTradeTool( evmKit ),
      new EthereumBatchOrderTool( evmKit )
    ];
}
