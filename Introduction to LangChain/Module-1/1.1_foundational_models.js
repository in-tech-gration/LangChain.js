// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-1/1.1_foundational_models.ipynb

import "dotenv/config.js";

// INITIALIZING AND INVOKING A MODEL
// from langchain.chat_models import init_chat_model
// 

// model = init_chat_model(model="gpt-5-nano")
import { initChatModel } from "langchain";
// const model = "llama3-groq-tool-use:8b";
// const model = await initChatModel("gpt-4.1");
let model = await initChatModel("gpt-5-nano");

// response = model.invoke("What's the capital of the Moon?")
// let response = await model.invoke("Hello, world!");
// print(response.content)
// console.log( response.content );

// from pprint import pprint

// pprint(response.response_metadata)
// console.log( response.response_metadata );

// CUSTOMISING YOUR MODEL

// model = init_chat_model(
//     model="gpt-5-nano",
//     # Kwargs passed to the model:
//     temperature=1.0
// )
// model = await initChatModel(
//   "gpt-5-nano",
//   { temperature: 1.0 }
// );

// response = model.invoke("What's the capital of the Moon?")
// response = await model.invoke("What's the capital of the Moon?");
// print(response.content)
// console.log(response.content);


// MODEL PROVIDERS
// # https://docs.langchain.com/oss/python/integrations/chat
// https://docs.langchain.com/oss/javascript/integrations/chat

// model = init_chat_model(model="claude-sonnet-4-5")
// npm install @langchain/anthropic
// model = await initChatModel({
//   model: "claude-sonnet-4-5"
// }) 

// response = model.invoke("What's the capital of the Moon?")
// response = await model.invoke("What's the capital of Egypt?");
// print(response.content)
// console.log(response.content);

// from langchain_google_genai import ChatGoogleGenerativeAI
// npm install @langchain/google-genai

// model = ChatGoogleGenerativeAI(model="gemini-3-pro-preview")
// model = await initChatModel("gemini-3-pro-preview");

// response = model.invoke("What's the capital of the Moon?")
// response = await model.invoke("What's the capital of Moon?");
// print(response.content)
// console.log(response.content);

// INITIALIZING AND INVOKING AN AGENT

// from langchain.agents import create_agent
import { createAgent } from "langchain";

// agent = create_agent(model=model)
// agent = create_agent("gpt-5-nano")
const agent = createAgent({
  model: "gpt-5-nano",
});

// from langchain.messages import HumanMessage
import { HumanMessage } from "langchain";

// response = agent.invoke(
//     {"messages": [HumanMessage(content="What's the capital of the Moon?")]}
// )
// let response = await agent.invoke({
//   messages: [
//     new HumanMessage("What's the capital of the Moon?")
//   ]
// })

// from pprint import pprint
// pprint(response)
// console.log(response);

// print(response['messages'][-1].content)
// console.log(response.messages[response.messages.length - 1].content);

// from langchain.messages import AIMessage
import { AIMessage } from "langchain";

// response = agent.invoke(
//     {"messages": [HumanMessage(content="What's the capital of the Moon?"),
//     AIMessage(content="The capital of the Moon is Luna City."),
//     HumanMessage(content="Interesting, tell me more about Luna City")]}
// )
// let response = await agent.invoke({
//   messages: [
//     new HumanMessage("What's the capital of the Moon?"),
//     new AIMessage("The capital of the Moon is Luna City."),
//     new HumanMessage("Interesting, tell me more about Luna City"),
//   ]
// })
// [Python] pprint(response)
// console.log(response);

// STREAMING OUTPUT

// [Python]
// for token, metadata in agent.stream(
//     {"messages": [HumanMessage(content="Tell me all about Luna City, the capital of the Moon")]},
//     stream_mode="messages"
// ):
//     # token is a message chunk with token content
//     # metadata contains which node produced the token

//     if token.content:  # Check if there's actual content
//         print(token.content, end="", flush=True)  # Print token

const stream = await agent.stream({
  messages: ["Why do parrots have colorful feathers?"]
}, {
  streamMode: "messages" // Supported stream modes: https://docs.langchain.com/oss/javascript/langgraph/streaming#supported-stream-modes
});
for await (const [token, metadata] of stream) {
  // console.log(token);
  if (token.content) {
    // console.log(token.content);
    process.stdout.write(token.content);
  }
}
process.stdout.write('\n'); // Fixing the trailing %
