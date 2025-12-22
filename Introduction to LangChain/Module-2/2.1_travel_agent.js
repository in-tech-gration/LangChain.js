// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-2/2.1_travel_agent.ipynb
import "dotenv/config.js";
import { createAgent, HumanMessage } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";  

const client = new MultiServerMCPClient({
    travelServer: {
        transport: "http",
        url: "https://mcp.kiwi.com",
    },
});

const tools = await client.getTools(); 
const checkpointer = new MemorySaver();

const agent = createAgent({
  model: "gpt-5-nano",
  tools,
  checkpointer,
  systemPrompt: "You are a travel agent. No follow up questions.",
});

const config = { configurable: { thread_id: "1" } }

const response = await agent.invoke({ 
  messages: [new HumanMessage("Get me a direct flight from San Francisco to Tokyo on December 25th")] 
}, config);
console.log(response.messages[response.messages.length - 1].content);
