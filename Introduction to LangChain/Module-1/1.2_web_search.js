//  WITHOUT WEB SEARCH

import "dotenv/config.js";
import { createAgent, tool, HumanMessage } from "langchain";
import * as z from "zod";
// npm install @langchain/community @langchain/core
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
// https://docs.langchain.com/oss/javascript/integrations/retrievers/tavily
import { TavilySearch } from "@langchain/tavily";
// npm install --legacy-peer-deps @langchain/tavily

const retriever = new TavilySearchAPIRetriever({
  k: 1,
});

let agent = createAgent({
  model: "gpt-5-nano",
});

let question = new HumanMessage("How up to date is your training knowledge?");
let response = await agent.invoke({
  messages: [question]
});
console.log(response.messages[response.messages.length - 1].content);

// ADD WEB SEARCH TOOL

const webSearch = tool(
  async ({ query }) => {
    const result = await retriever.invoke(query);
    return {
      content: result[0].pageContent,
      url: result[0].metadata.source,
      score: result[0].metadata.score,
      title: result[0].metadata.title,
      raw_content: null,
    };
  },
  {
    name: "web_search",
    description: "Search the web for information",
    schema: z.object({
      query: z.string().describe("The query to search the web."),
    }),
  }
);

const result = await webSearch.invoke({
  query: "Who is the current mayor of San Francisco?"
});
console.log({ result });

agent = createAgent({
  model: "gpt-5-nano",
  // tools: [webSearch],
  tools: [new TavilySearch({ maxResults: 1 })],
});

question = new HumanMessage("Who is the current mayor of San Francisco?");

response = await agent.invoke({
  messages: [question]
});

console.log(response.messages[response.messages.length - 1].content);

// trace: https://smith.langchain.com/public/59432173-0dd6-49e8-9964-b16be6048426/r