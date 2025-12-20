// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-1/1.3_memory.ipynb
import "dotenv/config.js";
import { createAgent, HumanMessage } from "langchain";
import { MemorySaver } from "@langchain/langgraph";

// NO MEMORY

let agent = createAgent({
  model: "gpt-5-nano",
});

let question = new HumanMessage("Hello my name is Seán and my favourite colour is green")

let response = await agent.invoke({
  messages: [question]
}) 
console.log(response.messages[1].content);
// Hi Seán! Nice to meet you. Green is a great color—calming and full of life.

question = new HumanMessage("What's my favourite colour?")

response = await agent.invoke({
  messages: [question]
}) 
console.log(response.messages[1].content);
// I don’t know your favourite colour—I don’t have access to your personal preferences.

// MEMORY

const checkpointer = new MemorySaver();

agent = createAgent({
  model: "gpt-5-nano",
  checkpointer,
});

question = new HumanMessage("Hello my name is Seán and my favourite colour is green")
const config = { configurable: { thread_id: "1" } }

response = await agent.invoke({ messages: [question] }, config);
console.log(response.messages[response.messages.length - 1].content);
// Nice to meet you, Seán! Green is a great color—vibrant and calming.

question = new HumanMessage("What's my favourite colour?");

response = await agent.invoke({ messages: [question] }, config);
console.log(response.messages[response.messages.length - 1].content);
// Your favourite colour is green. Want to chat about green topics (nature, sustainability) or something else?