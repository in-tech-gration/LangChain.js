// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-1/1.1_foundational_models.ipynb

import "dotenv/config.js";

// INITIALIZING AND INVOKING A MODEL

import { initChatModel } from "langchain";
let model = await initChatModel("gpt-5-nano");

let response = await model.invoke("Hello, world!");
console.log(response.content);
console.log(response.response_metadata);

// CUSTOMIZING YOUR MODEL

model = await initChatModel(
  "gpt-5-nano",
  { temperature: 1.0 }
);

response = await model.invoke("What's the capital of the Moon?");
console.log(response.content);

// MODEL PROVIDERS
// https://docs.langchain.com/oss/javascript/integrations/chat

// npm install @langchain/anthropic
model = await initChatModel({
  model: "claude-sonnet-4-5"
});

response = await model.invoke("What's the capital of Moon?");
console.log(response.content);

// npm install @langchain/google-genai
model = await initChatModel("gemini-3-pro-preview");

response = await model.invoke("What's the capital of Moon?");
console.log(response.content);

// INITIALIZING AND INVOKING AN AGENT

import { createAgent } from "langchain";

const agent = createAgent({
  model: "gpt-5-nano",
});

import { HumanMessage } from "langchain";

response = await agent.invoke({
  messages: [
    new HumanMessage("What's the capital of the Moon?")
  ]
})

console.log(response);
console.log(response.messages[response.messages.length - 1].content);

import { AIMessage } from "langchain";

response = await agent.invoke({
  messages: [
    new HumanMessage("What's the capital of the Moon?"),
    new AIMessage("The capital of the Moon is Luna City."),
    new HumanMessage("Interesting, tell me more about Luna City"),
  ]
})
console.log(response);

// STREAMING OUTPUT

const stream = await agent.stream({
  messages: ["Why do parrots have colorful feathers?"]
}, {
  streamMode: "messages"
  // Supported stream modes: https://docs.langchain.com/oss/javascript/langgraph/streaming#supported-stream-modes
});

// token is a message chunk with token content
// metadata contains which node produced the token
for await (const [token, metadata] of stream) {
  if (token.content) {
    process.stdout.write(token.content);
  }
}
process.stdout.write('\n'); // Fixing the trailing %
