// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-2/bonus_rag.ipynb
import "dotenv/config.js";
import { tool, createAgent, HumanMessage } from "langchain";
// npm install pdf-parse => ❌ FAIL
// npm install pdf-parse@^1 => ✅ SUCCESS
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
const __dirname = import.meta.dirname;
import path from "node:path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import * as z from "zod";

// SEMANTIC SEARCH

const filepath = path.join(__dirname, "acmecorp-employee-handbook.pdf");
const loader = new PDFLoader(filepath);
const data = await loader.load();
// console.log({ data });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
})
const allSplits = await splitter.splitDocuments(data);
// console.log({ allSplits });

// EMBEDDING MODELS: HTTPS://DOCS.LANGCHAIN.COM/OSS/PYTHON/INTEGRATIONS/TEXT_EMBEDDING

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large"
});

const vectorStore = new MemoryVectorStore(embeddings);

const ids = await vectorStore.addDocuments(allSplits);

// const results = await vectorStore.similaritySearch("How many days of vacation does an employee get in their first year?");

// console.log(results[0]);

// RAG AGENT

const searchHandbook = tool(
  async ({ query }) => {

    const results = await vectorStore.similaritySearch("How many days of vacation does an employee get in their first year?");
    const result = results[0].pageContent;
    // console.log({ result });
    return result;
  },
  {
    name: "search_handbook",
    description: "Search the employee handbook for information",
    schema: z.object({
      query: z.string(),
    })
  }
)
const agent = createAgent({
  model: "gpt-5-nano",
  tools: [searchHandbook],
  systemPrompt: "You are a helpful agent that can search the employee handbook for information.",
})

const response = await agent.invoke({
  messages: [
    new HumanMessage("How many days of vacation does an employee get in their first year?"),
  ]
});

// console.log(response);
console.log(response.messages[response.messages.length-1].content);