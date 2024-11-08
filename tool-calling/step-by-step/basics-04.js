import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

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

// (2) Key Concepts: Tool Binding
const llmWithTools = llm.bindTools(tools);

const messages = [ 
  // new HumanMessage("How are you today?") // Will result in 0 tool_calls
  // new HumanMessage("What is 11 + 49?") // Will result in 1 tool_calls (add)
  // new HumanMessage("What is 3 * 12?") // Will result in 1 tool_calls (multiply)

  // Enable this SystemMessage to avoid irrelevant details in the responses, e.g. python code, etc.
  // new SystemMessage("You are a helpful assistant. Try to answer the questions provided by the user using your knowledge or use a tool to provide a response otherwise. Try to be specific with your response and not give details that were not requested by the user."),
  new HumanMessage("What is 3 * 12? Also, what is 11 + 49?") // Will result in 2 tool_calls (add and multiply)
];

// (3) Key Concepts: Tool Calling 
const aiMessage = await llmWithTools.invoke(messages);
// console.log(aiMessage);
messages.push(aiMessage);

// (4) Key Concepts: Tool Execution: The tool can be executed using the arguments provided by the model.
const toolsByName = {
  add: addTool,
  multiply: multiplyTool,
};

for (const toolCall of aiMessage.tool_calls) {
  const selectedTool = toolsByName[toolCall.name];
  const toolMessage = await selectedTool.invoke(toolCall);
  // console.log({ toolMessage });
  messages.push(toolMessage);
}

// "And finally, we’ll invoke the model with the tool results. The model will use this information to generate a final answer to our original query:"
const response = await llmWithTools.invoke(messages);
console.log( response.content );