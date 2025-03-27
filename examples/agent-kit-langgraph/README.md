# Agent Kit LangGraph Example – EVM

This example demonstrates how to build an advanced Ethereum agent using LangGraph and the EVM Agent Kit. It showcases a multi-agent system capable of performing various Ethereum-related tasks through a directed LangGraph workflow.



## Features

- Multi-agent architecture using LangGraph's `StateGraph`
- Specialized agents for different Ethereum tasks:
  - General-purpose agent for basic queries (LLM + optional internet search)
  - Transfer/Swap agent for ERC20/ETH token operations (uses 1inch API)
  - Read agent for fetching balances and token prices
  - Manager agent for routing and orchestration logic
- Environment-based configuration
- TypeScript implementation with full type safety

## Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- Ethereum RPC provider (e.g., Infura, Alchemy)

## Installation

1. Clone the repository and navigate to the example directory:

```bash
cd examples/agent-kit-langgraph
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

- Add your OpenAI API key
- Add your Ethereum RPC URL
- Set any other required config keys

## Project Structure

```
src/
├── agents/         # Individual agent implementations
├── helper/         # Helper utilities like token list
├── prompts/        # Prompt templates for agents
├── tools/          # Token price fetch, balance, trade, transfer logic
└── utils/          # Shared logic (routing, model setup, state)
```

## Usage

To run the example:

```bash
pnpm dev src/index.ts
```

Workflow:

1. The manager agent receives a query
2. It routes the query to the appropriate agent:
   - General queries → General Agent
   - Transfers/Swaps → TransferSwap Agent
   - Balance/Price reads → Read Agent

## Dependencies

- `@langchain/community`: LangChain community tools
- `@langchain/core`: Core LangChain utilities
- `@langchain/langgraph`: LangGraph-based multi-agent coordination
- `ethers`: Ethereum blockchain interaction library
- `zod`: Runtime schema validation
- `node-fetch`: Fetch API for Node (used for 1inch)

## Contributing

Open to contributions! Feel free to fork and submit a PR.

## License


