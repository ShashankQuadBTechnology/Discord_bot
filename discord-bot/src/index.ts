import 'dotenv/config';
import { Client, GatewayIntentBits, Events, ChannelType, Partials } from 'discord.js';
import { HumanMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { ethers } from 'ethers';

const client = new Client({
  intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
  partials: [Partials.Message, Partials.Channel],
});

const chatHistory: Map<string, HumanMessage[]> = new Map();

async function initializeAgent() {
  try {
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.3,
    });

    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL!);
    const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY!, provider);

    const memory = new MemorySaver();
    const config = { configurable: { thread_id: 'Ethereum Agent Kit!' } };

    const agent = createReactAgent({
      llm,
      tools: [], // Add Ethereum-related tools if needed
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using Ethereum. You can send transactions,
        check balances, and interact with smart contracts. If someone asks you to perform an Ethereum
        transaction, ensure they provide the required details. If there is a 5XX (internal) HTTP error code,
        ask the user to try again later. Encourage users to explore Ethereum development and provide guidance
        where possible.
      `,
    });

    return { agent, config, wallet };
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    throw error;
  }
}

client.on(Events.ClientReady, async () => {
  await client.application?.fetch();
  console.info(`${client.user?.username || 'Bot'} is running. Send it a message in Discord DM to get started.`);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    if (message.channel.type !== ChannelType.DM || message.author.bot) {
      return;
    }

    console.info(`Received message: ${message.content}`);
    await message.channel.sendTyping();

    const { agent, config } = await initializeAgent();

    const userId = message.author.id;
    if (!chatHistory.has(userId)) {
      chatHistory.set(userId, []);
    }
    const userChatHistory = chatHistory.get(userId)!;
    userChatHistory.push(new HumanMessage(message.content));

    const stream = await agent.stream({ messages: userChatHistory }, config);

    const replyIfNotEmpty = async (content: string) => content.trim() !== '' && message.reply(content);

    for await (const chunk of stream) {
      if ('agent' in chunk) {
        const agentMessage = chunk.agent.messages[0].content;
        await replyIfNotEmpty(agentMessage);
        userChatHistory.push(new HumanMessage(agentMessage));
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN!);
