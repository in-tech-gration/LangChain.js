import "dotenv/config.js";
import { createAgent, HumanMessage } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { TavilySearch } from "@langchain/tavily";

const systemPrompt = `
You are a personal chef. The user will give you a list of ingredients they have left over in their house.

Using the web search tool, search the web for recipes that can be made with the ingredients they have.

Return recipe suggestions and eventually the recipe instructions to the user, if requested.
`
const checkpointer = new MemorySaver();

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [new TavilySearch({ maxResults: 1 })],
  systemPrompt,
  checkpointer,
});

const config = { configurable: { thread_id: "1" } }

const message = new HumanMessage("I have some leftover chicken and rice. What can I make?")

const response = await agent.invoke({
  messages: [message]
}, config);
console.log(response.messages[response.messages.length - 1].content);