import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

const llm = new ChatOllama({
  model: "llama3.1:latest", 
  baseUrl: "http://localhost:11434",
  temperature: 0 
});

// (1) Key Concepts: Define our functions and  use the `tool` helpers function to create a tool. A tool is an association between a function and its schema.
const add      = async ({ a, b }) => a + b;
const multiply = async ({ a, b }) => a * b;

// Define the Schema for our function inputs
const addInputSchema = z.object({
  a: z.number(),
  b: z.number(),
});
const multiplyInputSchema = z.object({
  a: z.number(),
  b: z.number(),
});

// "The recommended way to create a tool is using the tool function."
// "https://js.langchain.com/docs/concepts/tool_calling#tool-creation"
// Syntax: tool( FUNCTION, METADATA )
const addTool = tool(
  add,
  {
    name: "add",
    schema: addInputSchema,
    description: "Adds a and b.", // <= Descriptions are important for our LLMs
  }
);
const multiplyTool = tool(
  multiply,
  {
    name: "multiply",
    schema: multiplyInputSchema,
    description: "Multiplies a and b.",
  }
);

// Pack our tools 🛠️
const tools = [
  addTool, 
  multiplyTool, 
];

// Testing our tools (manually):
console.log( add({ a: 40, b: 2}) );
console.log( multiply({ a: 21, b: 2}) );