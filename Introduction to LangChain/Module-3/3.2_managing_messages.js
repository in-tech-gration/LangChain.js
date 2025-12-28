// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-3/3.2_managing_messages.ipynb
import "dotenv/config.js";
import { createAgent, ToolMessage, HumanMessage, AIMessage, summarizationMiddleware, createMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { RemoveMessage } from "@langchain/core/messages";

// SUMMARIZE MESSAGES

const checkpointer = new MemorySaver();

let agent = createAgent({
  model: "gpt-5-nano",
  checkpointer,
  middleware: [
    // https://docs.langchain.com/oss/javascript/langchain/context-engineering#example:-summarization
    summarizationMiddleware({
      model: "gpt-4o-mini",
      trigger: { tokens: 100 },
      keep: { messages: 1 },
    }),
  ]

});

const config = { configurable: { thread_id: "1" } }

let response = await agent.invoke({
  "messages": [
      new HumanMessage("What is the capital of the moon?"),
      new AIMessage("The capital of the moon is Lunapolis."),
      new HumanMessage("What is the weather in Lunapolis?"),
      new AIMessage("Skies are clear, with a high of 120C and a low of -100C."),
      new HumanMessage("How many cheese miners live in Lunapolis?"),
      new AIMessage("There are 100,000 cheese miners living in Lunapolis."),
      new HumanMessage("Do you think the cheese miners' union will strike?"),
      new AIMessage("Yes, because they are unhappy with the new president."),
      new HumanMessage("If you were Lunapolis' new president how would you respond to the cheese miners' union?"),
    ]
}, config);

console.log(response);
console.log(response.messages[response.messages.length-1].content);

// TRIM/DELETE MESSAGES

// Remove all the tool messages from the state (along with preceding AI messages)
const trimMessages = createMiddleware({
  name: "TrimMessageMiddleware",
  beforeAgent: (state, config) => {
    const messages = state.messages;
    return {
      messages: messages.filter(m => {
        if ( m.constructor.name === "AIMessage" ){
          if ( m.tool_calls.length > 0 ){
            return true;
          }
        }
        return m.constructor.name === "ToolMessage";
      })
        .map(m => {
          // https://docs.langchain.com/oss/javascript/langgraph/add-memory#delete-messages
          // Message responsible for deleting other messages.
          return new RemoveMessage({ id: m.id });
        })
    }
  },
});

agent = createAgent({
  model: "gpt-5-nano",
  checkpointer: new MemorySaver(),
  middleware: [trimMessages],
});

response = await agent.invoke({
  "messages": [
    new HumanMessage("My device won't turn on. What should I do?"),
    new AIMessage({
      content: "",
      tool_calls: [{ id: "1", name: "init_diagnostic_ping", args: {} }]
    }),
    new ToolMessage({
      content: "blorp-x7 initiating diagnostic ping…",
      tool_call_id: "1"
    }),
    new AIMessage("Is the device plugged in and turned on?"),
    new HumanMessage("Yes, it's plugged in and turned on."),
    new AIMessage({
      content: "",
      tool_calls: [{ id: "2", name: "check_stats", args: {} }]
    }),
    new ToolMessage({
      content: "temp=42C voltage=2.9v … greeble complete.",
      tool_call_id: "2"
    }),
    new AIMessage("Is the device showing any lights or indicators?"),
    new HumanMessage("What's the temperature of the device?")
  ]
},
  { "configurable": { "thread_id": "2" } }
)

console.log(response);
console.log(response.messages[response.messages.length - 1].content);




