import "dotenv/config.js";
import { ChatOpenAI } from "@langchain/openai";
// For use with Ollama: `npm i @langchain/ollama`
// Ref: https://docs.langchain.com/oss/javascript/integrations/chat/ollama
import { ChatOllama } from "@langchain/ollama"
import { HumanMessage, SystemMessage, AIMessage } from "langchain";

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

const dialogResponse = await model.invoke([
  new AIMessage("So you said you were researching ocean mammals?"),
  new HumanMessage("Yes, that's right."),
  new AIMessage("Great, what would you like to learn about."),
  new HumanMessage("I want to learn about the best place to see Orcas in the US."),
]);
console.log(dialogResponse.content);

