# Ethereum Discord Bot

This is a **Discord bot** that interacts with the **Ethereum blockchain**, built using TypeScript and `discord.js`. It can process user messages and execute Ethereum-based operations.

---

## 🚀 Features
- Listens for user messages on Discord.
- Connects to the **Ethereum blockchain**.
- Executes Ethereum-related commands.

---

## 🛠 Prerequisites

Before you start, make sure you have the following installed:

1. **Node.js** (v18 or later)
2. **npm** (or `yarn`)
3. **A Discord Bot Token** ([Get it from Discord Developer Portal](https://discord.com/developers/applications))
4. **Ethereum RPC URL** (e.g., from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/))
5. **Private Key** of a test Ethereum account

---

## 📦 Installation

1. **Clone the repository**:
```sh
git clone https://github.com/yourusername/eth-discord-bot.git
cd eth-discord-bot
```

2. **Install dependencies**:
```sh
npm install
```

3. **Create a `.env` file** and add:
```
DISCORD_BOT_TOKEN=your_discord_bot_token
ETH_RPC_URL=your_ethereum_rpc_url
PRIVATE_KEY=your_private_key
```

4. **Enable bot permissions** in the Discord Developer Portal:
   - Enable `MESSAGE CONTENT INTENT`
   - Enable `DIRECT MESSAGES INTENT`

---

## ▶️ Running the Bot

To start the bot, use:
```sh
npm run start
```
If using TypeScript directly:
```sh
npx ts-node src/index.ts
```

---

## 📜 Usage
- Send a **DM** to the bot in Discord.
- The bot should reply based on Ethereum blockchain interactions.
- Example command:
  ```
  check balance
  ```
  The bot will check the Ethereum balance of a predefined address.

---

## ❓ Troubleshooting

1. **Bot is not responding?**
   - Ensure the bot is **online** in Discord.
   - Check **bot permissions** in the server.
   - Verify your **Discord Bot Token** in `.env`.
   - Restart the bot: `npm run start`

2. **Getting import errors?**
   - Ensure you are using **ES Modules**:
     ```json
     {
       "type": "module"
     }
     ```
   - Run with `node --loader ts-node/esm src/index.ts`

3. **Ethereum errors?**
   - Check your **RPC URL** and **Private Key**.
   - Ensure your account has **test ETH** for transactions.

---

## 📜 License
This project is open-source and available under the **MIT License**.

---

## 📞 Support
If you need help, open an issue on **GitHub** or ask in Discord!

