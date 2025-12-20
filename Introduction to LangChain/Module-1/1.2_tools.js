// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-1/1.2_tools.ipynb

// TOOL DEFINITION

import "dotenv/config.js";
import { createAgent, tool, HumanMessage } from "langchain";
import * as z from "zod";

const squareRoot = tool(
  ({ x }) => Math.sqrt(x),
  {
    name: "square_root",
    description: "Calculate the square root of a number",
    schema: z.object({
      x: z.number().describe("The number to calculate the square root from."),
    }),
  }
);

const result = await squareRoot.invoke({ x: 467 });
// console.log({ result });

// ADDING TO AGENTS

const systemPrompt = "You are an arithmetic wizard. Use your tools to calculate the square root and square of any number.";

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [squareRoot],
  systemPrompt,
});

const question = new HumanMessage("What is the square root of 467?");
const response = await agent.invoke({
  messages: [question]
});

console.log(response.messages[response.messages.length - 1].content);
console.log(response.messages);
console.log(response.messages[1].tool_calls);




