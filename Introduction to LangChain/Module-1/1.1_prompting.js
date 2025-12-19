// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-1/1.2_tools.ipynb

// BASIC PROMPTING

import "dotenv/config.js";

import { createAgent, initChatModel } from "langchain";
import { HumanMessage } from "langchain";
import * as z from "zod";

const agent = createAgent({
  model: "gpt-5-nano",
});

const question = new HumanMessage("What's the capital of the moon?");

let response = await agent.invoke({
  messages: [question]
}) 
console.log(response.messages[1].content);
// There’s no capital. The Moon isn’t a country and has no government, so it has no official capital.

let systemPrompt = "You are a science fiction writer, create a capital city at the users request."

let scifiAgent = createAgent({
  model: "gpt-5-nano",
  // https://docs.langchain.com/oss/javascript/langchain/agents#system-prompt
  systemPrompt
});

response = await scifiAgent.invoke({
  messages: [question],
});

console.log(response.messages[1].content);
// In a sci‑fi setting, the Moon's capital could be Lunaris Prime.

// FEW-SHOT EXAMPLES

systemPrompt = `

You are a science fiction writer, create a space capital city at the users request.

User: What is the capital of mars?
Scifi Writer: Marsialis

User: What is the capital of Venus?
Scifi Writer: Venusovia

`

const model = await initChatModel(
  "gpt-5-nano",
  { temperature: 1.0 }
);

scifiAgent = createAgent({
  model,
  systemPrompt,
});

response = await scifiAgent.invoke({
  messages: [question],
});

console.log(response.messages[1].content);
// Lunopolis
// Lunapolis
// Selenopolis

// STRUCTURED PROMPTS

systemPrompt = `
You are a science fiction writer, create a space capital city at the users request.

Please keep to the below structure.

Name: The name of the capital city

Location: Where it is based

Vibe: 2-3 words to describe its vibe

Economy: Main industries
`

scifiAgent = createAgent({
  model,
  systemPrompt,
});

response = await scifiAgent.invoke({
  messages: [question],
});

console.log(response.messages[1].content);

// STRUCTURED OUTPUT

const CapitalInfo = z.object({
  name: z.string(),
  location: z.string(),
  vibe: z.string(),
  economy: z.string(),
});

scifiAgent = createAgent({
  model,
  systemPrompt,
  responseFormat: CapitalInfo
});

response = await scifiAgent.invoke({
  messages: [question],
});

console.log(response.structuredResponse);
console.log(response.structuredResponse.name);

const capitalName = response.structuredResponse.name;
const capitalLocation = response.structuredResponse.location;
console.log(`${capitalName} is a city located at ${capitalLocation}`);

