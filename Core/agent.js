// Create an agent
// Ref: https://docs.langchain.com/oss/javascript/langchain/overview#create-an-agent
// `npm install langchain @langchain/core`
import "dotenv/config.js";
import * as z from "zod";
import { createAgent, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
// For use with Ollama: `npm i @langchain/ollama`
// Ref: https://docs.langchain.com/oss/javascript/integrations/chat/ollama
import { ChatOllama } from "@langchain/ollama"

const ollama = new ChatOllama({
  // baseUrl: "http://localhost:11434", // Default Ollama path
  model: "llama3-groq-tool-use:8b", // ✅ SUCCESS
  // model: "llama3.1:latest", // ❌ FAILURE
  temperature: 0,
  maxRetries: 2,
  // other params...
});

const model = new ChatOpenAI({
  model: "gpt-4.1",
  // apiKey: "your-api-key"
});

const getWeather = tool(
  ({ city }) => `It's always sunny in ${city}!`,
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({
      city: z.string(),
    }),
  },
);

const agent = createAgent({
  model: ollama,
  // model, // Use the OpenAI model instead. API key required.
  tools: [getWeather],
});

const response = await agent.invoke({
  messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
});

// console.log({ response }); // Too verbose!

for await (const message of response.messages) {
  console.log(message.toFormattedString());
}
// ================================ Human Message =================================
// What's the weather in Tokyo?
// ================================== Ai Message ==================================
// Tool Calls:
//   get_weather (20ceb2b1-2a44-44d6-84bc-d9843e8ee972)
//  Call ID: 20ceb2b1-2a44-44d6-84bc-d9843e8ee972
//   Args:
//     city: Tokyo
// ================================= Tool Message =================================
// Name: get_weather

// It's always sunny in Tokyo!
// ================================== Ai Message ==================================
// It's always sunny in Tokyo!