// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-2/2.2_runtime_context.ipynb

import "dotenv/config.js";
import { createAgent, HumanMessage } from "langchain";
import * as z from "zod";
import { tool } from "@langchain/core/tools";

const ColorContext = z.object({
  favouriteColour: z.literal("blue"),
  leastFavouriteColour: z.literal("yellow"),
});

let agent = createAgent({
  model: "gpt-5-nano",
  contextSchema: ColorContext
});

let response = await agent.invoke(
  {
    messages: [new HumanMessage("What is my favourite and least favourite colour?")]
  },
  { context: { favouriteColour: "blue", leastFavouriteColour: "yellow" } }
);

console.log(response.messages[response.messages.length - 1].content);

// ACCESSING CONTEXT

const getFavouriteColour = tool(
  async (_, runtime) => {
    return runtime.context.favouriteColour;
  },
  {
    name: "get_favourite_color",
    description: "Get the favourite colour of the user",
  }
);

const getLeastFavouriteColour = tool(
  async (_, runtime) => {
    return runtime.context.leastFavouriteColour;
  },
  {
    name: "get_least_favourite_color",
    description: "Get the least favourite colour of the user",
  }
);

agent = createAgent({
  model: "gpt-5-nano",
  tools: [getFavouriteColour, getLeastFavouriteColour],
  contextSchema: ColorContext
});

response = await agent.invoke(
  {
    messages: [new HumanMessage("What is my favourite and least colours?")]
  },
  { context: { favouriteColour: "blue", leastFavouriteColour: "yellow" } }
);

console.log(response.messages[response.messages.length - 1].content);