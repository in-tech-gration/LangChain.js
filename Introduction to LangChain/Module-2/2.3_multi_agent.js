// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-2/2.3_multi_agent.ipynb
import "dotenv/config.js";
import { tool, createAgent, HumanMessage } from "langchain";
import * as z from "zod";
import { displayAgentMessages } from "../utils.js";

// CREATING SUBAGENTS

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
// console.log( await squareRoot.invoke({ x: 16 }) );

const square = tool(
  ({ x }) => x * x,
  {
    name: "square",
    description: "Calculate the square of a number",
    schema: z.object({
      x: z.number().describe("The number to calculate the square from."),
    }),
  }
);
// console.log( await square.invoke({ x: 4 }) );

// CREATE SUBAGENTS

const subAgent1 = createAgent({
  model: "gpt-5-nano",
  tools: [squareRoot],
});

const subAgent2 = createAgent({
  model: "gpt-5-nano",
  tools: [square],
});

// CALLING SUBAGENTS

const callSubAgent1 = tool(
  async ({ x }) => {
    const response = await subAgent1.invoke({
      messages: [
        new HumanMessage(`Calculate the square root of ${x}`)
      ]
    });
    return response.messages[response.messages.length - 1].content;
  },
  {
    name: "call_subagent_1",
    description: "Call subagent 1 in order to calculate the square root of a number",
    schema: z.object({
      x: z.number(),
    }),
  }
);

const callSubAgent2 = tool(
  async ({ x }) => {
    const response = await subAgent2.invoke({
      messages: [
        new HumanMessage(`Calculate the square of ${x}`)
      ]
    });
    return response.messages[response.messages.length - 1].content;
  },
  {
    name: "call_subagent_2",
    description: "Call subagent 2 in order to calculate the square of a number",
    schema: z.object({
      x: z.number(),
    }),
  }
);

// CREATING THE MAIN AGENT

const mainAgent = createAgent({
  model: "gpt-5-nano",
  tools: [callSubAgent1, callSubAgent2],
  systemPrompt: "You are a helpful assistant who can call subagents to calculate the square root or square of a number."
});


// TEST

const question = "What is the square root of 456?"

const response = await mainAgent.invoke({
  messages: [new HumanMessage(question)]
});

// console.log(response);
displayAgentMessages(response.messages);

const question2 = "What is the square of 4?"

const response2 = await mainAgent.invoke({
  messages: [new HumanMessage(question2)]
});

// console.log(response);
displayAgentMessages(response2.messages);
