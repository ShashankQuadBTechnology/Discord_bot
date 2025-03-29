import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";
import { createEvmTools, EvmAgentKit } from "../../src";

dotenv.config();

function validateEnvironment(): void {
  const missingVars: string[] = [];
  const requiredVars = ["OPENAI_API_KEY", "RPC_URL", "ETHEREUM_PRIVATE_KEY"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

validateEnvironment();

const WALLET_DATA_FILE = "wallet_data.txt";

async function initializeAgent() {
  try {
    const llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.3,
    });

    let walletDataStr: string | null = null;

    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
      } catch (error) {
        console.error("Error reading wallet data:", error);
      }
    }

    const evmAgent = new EvmAgentKit(
      process.env.ETHEREUM_PRIVATE_KEY!,
      process.env.RPC_URL!,
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      },
    );

    const tools = createEvmTools(evmAgent);

    const memory = new MemorySaver();
    const config = { configurable: { thread_id: "Ethereum Agent Kit!" } };

    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the EVM Agent Kit. You are
        empowered to interact with Ethereum using your available tools. If you ever need funds, 
        you can request them from the faucet. Otherwise, provide your wallet address and ask the 
        user to fund it. If you encounter a 5XX (internal) HTTP error, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the EVM Agent Kit, recommend they go to <place the wensite address here once made> for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
      `,
    });
    //@comeback after the website is made
    //@comeback the tools thing isnt implemented as in solana agent kit , find out why

    if (walletDataStr) {
      fs.writeFileSync(WALLET_DATA_FILE, walletDataStr);
    }

    return { agent, config };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

async function runAutonomousMode(agent: any, config: any, interval = 10) {
  console.log("Starting autonomous mode...");

  while (true) {
    try {
      const thought =
        "Be creative and do something interesting on the blockchain. " +
        "Choose an action or set of actions and execute it that highlights your abilities.";

      const stream = await agent.stream(
        { messages: [new HumanMessage(thought)] },
        config,
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }

      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
}

async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      const stream = await agent.stream(
        { messages: [new HumanMessage(userInput)] },
        config,
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}


interface MarketMakerConfig {
  makerToken: string; // Token you are selling
  takerToken: string; // Token you are receiving
  quoteParams: {
    number: number;     // Number of buy/sell orders
    minDepth: number;   // Minimum % away from mid price
    maxDepth: number;   // Maximum % away from mid price
  };
  allowance: {
    maker: number;      // How much of makerToken you are willing to use
    taker: number;      // How much of takerToken you're willing to accept
  };
  intervalSeconds: number; // How often to refresh the quotes
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function askQuestion(
  rl: readline.Interface,
  question: string,
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function configureMarketMaker(): Promise<MarketMakerConfig> {
  const rl = createReadlineInterface();

  try {
    console.log("\n=== EVM Market Maker Configuration (0x Protocol) ===\n");

    // 0x Protocol configuration
    const makerToken = await askQuestion(
      rl,
      "Enter the maker token address (token you are selling): "
    );
    const takerToken = await askQuestion(
      rl,
      "Enter the taker token address (token you want to receive): "
    );

    // Quote parameters
    console.log("\n=== Quote Parameters (for pricing spread simulation) ===");
    const quoteNumber = parseInt(
      await askQuestion(rl, "Enter number of quotes to simulate on each side: ")
    );
    const minDepth = parseFloat(
      await askQuestion(
        rl,
        "Enter minimum quote depth (% distance from current price): "
      )
    );
    const maxDepth = parseFloat(
      await askQuestion(
        rl,
        "Enter maximum quote depth (% distance from current price): "
      )
    );

    // Token allowances
    console.log("\n=== Token Allowances ===");
    const makerAllowance = parseFloat(
      await askQuestion(rl, `Enter total ${makerToken} allowance: `)
    );
    const takerAllowance = parseFloat(
      await askQuestion(rl, `Enter total ${takerToken} allowance: `)
    );

    // Update interval
    const interval = parseInt(
      await askQuestion(rl, "\nEnter update interval in seconds: ")
    );

    const config: MarketMakerConfig = {
      makerToken,
      takerToken,
      quoteParams: {
        number: quoteNumber,
        minDepth,
        maxDepth,
      },
      allowance: {
        maker: makerAllowance,
        taker: takerAllowance,
      },
      intervalSeconds: interval,
    };

    // Display summary
    console.log("\n=== Configuration Summary ===");
    console.log(JSON.stringify(config, null, 2));

    const confirm = await askQuestion(
      rl,
      "\nIs this configuration correct? (yes/no): "
    );
    if (confirm.toLowerCase() !== "yes") {
      throw new Error("Configuration cancelled by user");
    }

    return config;
  } finally {
    rl.close();
  }
}

async function runMarketMakerMode(agent: any, config: any) {
  try {
    const marketMakerConfig = await configureMarketMaker();
    console.log(
      `\nStarting market maker mode for ${marketMakerConfig.makerToken}/${marketMakerConfig.takerToken}...`
    );

    while (true) {
      try {
        const thought = `You are an on-chain Ethereum market maker for the ${marketMakerConfig.makerToken}/${marketMakerConfig.takerToken} pair using the 0x Protocol. 
                        Find the ${marketMakerConfig.makerToken}/${marketMakerConfig.takerToken} live price by checking the 1inch API. 
                        Use evm_batch_order to provide ${marketMakerConfig.quoteParams.number} buys at different prices between -${marketMakerConfig.quoteParams.minDepth}% to -${marketMakerConfig.quoteParams.maxDepth}% and ${marketMakerConfig.quoteParams.number} sells at different prices between +${marketMakerConfig.quoteParams.minDepth}% to +${marketMakerConfig.quoteParams.maxDepth}% with increasing quantities further from the live price. 
                        You have an allowance of ${marketMakerConfig.allowance.maker} ${marketMakerConfig.makerToken} and ${marketMakerConfig.allowance.taker} ${marketMakerConfig.takerToken}.
                        Important! Only send 1 transaction, buy and sells must be combined into a single evm_batch_order.`;

        const stream = await agent.stream(
          { messages: [new HumanMessage(thought)] },
          config
        );

        for await (const chunk of stream) {
          if ("agent" in chunk) {
            console.log(chunk.agent.messages[0].content);
          } else if ("tools" in chunk) {
            console.log(chunk.tools.messages[0].content);
          }
          console.log("-------------------");
        }

        await new Promise((resolve) =>
          setTimeout(resolve, marketMakerConfig.intervalSeconds * 1000)
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error:", error.message);
        }
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("Configuration error:", error);
    process.exit(1);
  }
}


async function chooseMode(): Promise<"chat" | "auto" | "mm"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat    - Interactive chat mode");
    console.log("2. auto    - Autonomous action mode");
    console.log("3. mm      - AI guided market making");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    rl.close();

    if (choice === "1" || choice === "chat") {
      return "chat";
    } else if (choice === "2" || choice === "auto") {
      return "auto";
    } else if (choice === "3" || choice === "mm") {
      return "mm";
    }
    console.log("Invalid choice. Please try again.");
  }
}

async function main() {
  try {
    console.log("Starting Agent...");
    const { agent, config } = await initializeAgent();
    const mode = await chooseMode();

    if (mode === "chat") {
      await runChatMode(agent, config);
    } else if (mode === "auto") {
      await runAutonomousMode(agent, config);
    } else {
      await runMarketMakerMode(agent, config);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
