"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const messages_1 = require("@langchain/core/messages");
const langgraph_1 = require("@langchain/langgraph");
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
const openai_1 = require("@langchain/openai");
const ethers_1 = require("ethers");
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.MessageContent, discord_js_1.GatewayIntentBits.DirectMessages],
    partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel],
});
const chatHistory = new Map();
function initializeAgent() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const llm = new openai_1.ChatOpenAI({
                modelName: 'gpt-4o-mini',
                temperature: 0.3,
            });
            const provider = new ethers_1.ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
            const wallet = new ethers_1.ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
            const memory = new langgraph_1.MemorySaver();
            const config = { configurable: { thread_id: 'Ethereum Agent Kit!' } };
            const agent = (0, prebuilt_1.createReactAgent)({
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
        }
        catch (error) {
            console.error('Failed to initialize agent:', error);
            throw error;
        }
    });
}
client.on(discord_js_1.Events.ClientReady, () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    yield ((_a = client.application) === null || _a === void 0 ? void 0 : _a.fetch());
    console.info(`${((_b = client.user) === null || _b === void 0 ? void 0 : _b.username) || 'Bot'} is running. Send it a message in Discord DM to get started.`);
}));
client.on(discord_js_1.Events.MessageCreate, (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    try {
        if (message.channel.type !== discord_js_1.ChannelType.DM || message.author.bot) {
            return;
        }
        console.info(`Received message: ${message.content}`);
        yield message.channel.sendTyping();
        const { agent, config } = yield initializeAgent();
        const userId = message.author.id;
        if (!chatHistory.has(userId)) {
            chatHistory.set(userId, []);
        }
        const userChatHistory = chatHistory.get(userId);
        userChatHistory.push(new messages_1.HumanMessage(message.content));
        const stream = yield agent.stream({ messages: userChatHistory }, config);
        const replyIfNotEmpty = (content) => __awaiter(void 0, void 0, void 0, function* () { return content.trim() !== '' && message.reply(content); });
        try {
            for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
                _c = stream_1_1.value;
                _d = false;
                const chunk = _c;
                if ('agent' in chunk) {
                    const agentMessage = chunk.agent.messages[0].content;
                    yield replyIfNotEmpty(agentMessage);
                    userChatHistory.push(new messages_1.HumanMessage(agentMessage));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    catch (error) {
        console.error('Error handling message:', error);
    }
}));
client.login(process.env.DISCORD_BOT_TOKEN);
