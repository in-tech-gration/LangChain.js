import "dotenv/config.js";
import { ChatOpenAI } from "@langchain/openai";
// For use with Ollama: `npm i @langchain/ollama`
// Ref: https://docs.langchain.com/oss/javascript/integrations/chat/ollama
import { ChatOllama } from "@langchain/ollama"
import { HumanMessage, SystemMessage } from "langchain";

// Use Ollama:
const model = new ChatOllama({ model: "llama3.1:latest" });

// Use OpenAI: 
// const model = new ChatOpenAI({ model: "gpt-4.1" });

const answer = await model.invoke("What is the capital of Poland?");

console.log(answer.content);

const response = await model.invoke([
  new SystemMessage("You are a useful assistant speaking spanish."),
  new HumanMessage("What is the capital of Indonesia?")
]);

console.log(response.content);
