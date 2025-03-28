🚀 EVM Agent Kit with Persistent Memory
This project demonstrates a persistent agent that retains memory across sessions using a PostgreSQL database, ensuring the agent remembers previous conversations even after being restarted.

🎯 Key Features
✅ Persistent Memory: Retains conversation history in a PostgreSQL database.

✅ Seamless Integration: Easily integrates with EVM-based applications.

✅ Scalable Solution: Suitable for applications requiring long-term context.

⚡️ Prerequisites
PostgreSQL Database URL:
Format:

bash
Copy
Edit
postgresql://user:password@localhost:5432/db
Environment Variables: Create a .env file with the following content:

ini
Copy
Edit
OPENAI_API_KEY=your_openai_api_key_here
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETH_PRIVATE_KEY=your_private_key_here
POSTGRES_DB_URL=postgresql://username:password@localhost:5432/your_database_name
📚 Usage
Start the Agent
bash
Copy
Edit
npx ts-node index.ts
💬 Without Persistence
vbnet
Copy
Edit
Available modes:
1. chat - Interactive chat mode
2. auto - Autonomous action mode
Choose a mode (enter number or name): 1
Starting chat mode... Type 'exit' to end.
Prompt: I am Arpit
Hello Arpit! How can I assist you today?
After restart:

vbnet
Copy
Edit
Prompt: Do you know my name?
I don't know your name yet. If you'd like, you can share it.
🧠 With Persistence
mathematica
Copy
Edit
Prompt: I am Arpit
Hello Arpit! How can I assist you today?
After restart:

pgsql
Copy
Edit
Prompt: Do you know my name?
Yes, you mentioned that your name is Arpit. How can I help you today?