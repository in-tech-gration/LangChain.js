import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

const llm = new ChatOllama({
  model: "llama3.1:latest", 
  baseUrl: "http://localhost:11434",
  temperature: 0 
});

// (1) Key Concepts: Define our functions and create our tools. 
const add      = async ({ a, b }) => a + b;
const multiply = async ({ a, b }) => a * b;

const addInputSchema = z.object({
  a: z.number(),
  b: z.number(),
});
const multiplyInputSchema = z.object({
  a: z.number(),
  b: z.number(),
});

const addTool = tool(
  add,
  {
    name: "add",
    schema: addInputSchema,
    description: "Adds a and b.", 
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

const tools = [
  addTool, 
  multiplyTool, 
];

// (2) 🔗 [Key Concepts: Tool Binding]: The tool needs to be connected to a model that supports tool calling. This gives the model awareness of the tool and the associated input schema required by the tool.
const llmWithTools = llm.bindTools(tools); // bindTools only exist in Chat Models (ChatOllama)

// Define simple chat interaction with a single message:
const messages = [ 
  // new HumanMessage("How are you today?") // Will result in 0 tool_calls
  // new HumanMessage("What is 11 + 49?") // Will result in 1 tool_calls (add)
  // new HumanMessage("What is 3 * 12?") // Will result in 1 tool_calls (multiply)
  new HumanMessage("What is 3 * 12? Also, what is 11 + 49?") // Will result in 2 tool_calls (add and multiply)
];

// "Now, let’s get the model to call a tool."
// (3) [Key Concepts: Tool Calling]: When appropriate, the model can decide to call a tool and ensure its response conforms to the tool's input schema. 
const aiMessage = await llmWithTools.invoke(messages);

console.log(aiMessage.tool_calls.length);
console.log(aiMessage);

// "We’ll add it to a list of messages that we’ll treat as conversation history:"
messages.push(aiMessage);

// "Remember, while the name “tool calling” implies that the model is directly performing some action, this is actually not the case! The model only generates the arguments to a tool, and actually running the tool (or not) is up to the user."