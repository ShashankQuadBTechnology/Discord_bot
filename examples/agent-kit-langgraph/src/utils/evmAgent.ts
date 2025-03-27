import { EvmAgentKit,createEvmTools } from "evm-agent-kit";

export const agentKit = new EvmAgentKit(
  process.env.ETHEREUM_PRIVATE_KEY!,
  process.env.RPC_URL!,
  { OPENAI_API_KEY: process.env.OPENAI_API_KEY! },
);

export const evmTools = createEvmTools(agentKit);
