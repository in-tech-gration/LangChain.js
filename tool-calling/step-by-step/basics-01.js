// "Zod is a schema declaration and validation library. It allows you to work around uncertainty by checking types at the runtime level as well at the type level."
import { z } from "zod";
// The `tool` helper function, will allow us to dynamically create a tool from a function.
import { tool } from "@langchain/core/tools";
// ChatOllama will allow us to use an open-source Chat LLM through Ollama in our app.
import { ChatOllama } from "@langchain/ollama";
// "Messages are the unit of communication in chat models. They are used to represent the input and output of a chat model, as well as any additional context or metadata that may be associated with a conversation. A HumanMessage represents input from a user interacting with the model."
import { HumanMessage } from "@langchain/core/messages";

// Configure the Model:
const llm = new ChatOllama({
  model: "llama3.1:latest", 
  baseUrl: "http://localhost:11434",
  // Temperature: "Controls the randomness of the model's output. A higher value (e.g., 1.0) makes responses more creative, while a lower value (e.g., 0.1) makes them more deterministic and focused."
  temperature: 0 
});

const response = await llm.invoke("What is a petri dish?");

console.log( response.content );