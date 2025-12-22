// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-2/2.2_state.ipynb
import "dotenv/config.js";
import { tool, createAgent, ToolMessage, HumanMessage } from "langchain";
import { Command } from "@langchain/langgraph";
import * as z from "zod";
import { MemorySaver } from "@langchain/langgraph";
import { displayAgentMessages } from "../utils.js";

// WRITE TO STATE

const CustomState = z.object({
  favouriteColour: z.string(),
});

const updateFavouriteColour = tool(
  async ({ favouriteColour }, config) => {
    return new Command({
      update: {
        favouriteColour,
        messages: [
          new ToolMessage({
            content: "Successfully updated favourite colour",
            tool_call_id: config.toolCall?.id ?? "",
          }),
        ],
      },
    });
  },
  {
    name: "update_favourite_colour",
    description: "Update the favourite colour of the user in the state once they've revealed it.",
    schema: z.object({
      favouriteColour: z.string()
    }),
  }
);

const checkpointer = new MemorySaver();

let agent = createAgent({
  model: "openai:gpt-5-mini",
  tools: [updateFavouriteColour],
  stateSchema: CustomState,
  checkpointer,
});

const config = { configurable: { thread_id: "1" } }

let response = await agent.invoke({
  messages: [new HumanMessage("My favourite colour is green")],
}, config);

// console.log(response);
displayAgentMessages(response.messages)
console.log("response.favouriteColour", response.favouriteColour);

response = await agent.invoke({
  messages: [new HumanMessage("Hello, how are you?")],
  favouriteColour: "green",
}, { configurable: { thread_id: "10" } });

// console.log(response);
displayAgentMessages(response.messages);
console.log("response.favouriteColour", response.favouriteColour);

// READ STATE

const readFavouriteColour = tool(
  async (_, config) => {
    try {
      const favouriteColour = config.state.favouriteColour;
      return favouriteColour;
    } catch (error) {
      return "No favourite colour found in state"
    }
  },
  {
    name: "read_favourite_colour",
    description: "Read the favourite colour of the user from the state.",
    schema: z.object({}),
  }
);

agent = createAgent({
  model: "openai:gpt-5-mini",
  tools: [updateFavouriteColour, readFavouriteColour],
  stateSchema: CustomState,
  checkpointer,
});

response = await agent.invoke({
  messages: [new HumanMessage("My favourite colour is green")],
}, config);

displayAgentMessages(response.messages);
console.log("response.favouriteColour", response.favouriteColour);

response = await agent.invoke({
  messages: [new HumanMessage("What's my favourite colour?")],
}, config);

// console.log(response);
displayAgentMessages(response.messages);
console.log("response.favouriteColour", response.favouriteColour);
