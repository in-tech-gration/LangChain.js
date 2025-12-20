// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-1/1.5_personal_chef.ipynb
import "dotenv/config.js";
import { createAgent, HumanMessage } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { TavilySearch } from "@langchain/tavily";
import fs from "node:fs";
import path from "node:path";
const __dirname = import.meta.dirname;

const systemPrompt = `
You are a personal chef. The user will give you a list of ingredients they have left over in their house.

Using the web search tool, search the web for recipes that can be made with the ingredients they have.

Return recipe suggestions and eventually the recipe instructions to the user, if requested.
`
const checkpointer = new MemorySaver();

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [new TavilySearch({ maxResults: 1 })],
  systemPrompt,
  checkpointer,
});

const config = { configurable: { thread_id: "1" } }

let message = new HumanMessage("I have some leftover chicken and rice. What can I make?")

let response = await agent.invoke({
  messages: [message]
}, config);
console.log(response.messages[response.messages.length - 1].content);

// USE INGREDIENTS FROM PHOTO

const imageBuffer = fs.readFileSync(path.join(__dirname, './fridge.sora.generated.png'));
const base64Image = imageBuffer.toString("base64");  // Raw base64 data

// From base64 data
message = new HumanMessage({
  content: [
    {
      type: "text",
      // Version 1:
      // text: "Generate a simple list of all the ingredients and food found in the attached image that contains the contents of a fridge."
      // Version 2:
      text: "Generate a simple list of all the ingredients and food found in the attached image that contains the contents of a fridge. ONLY list clearly identifiable contents and disregard what is not clear. Also, just generate the list of ingredients. Do NOT supply any complementary text, comment or description."
    },
    {
      type: "image",
      mime_type: "image/png",
      source_type: "base64",
      data: base64Image,
    },
  ],
});

let imageResponse = await agent.invoke({
  messages: [message],
}, config);
const ingredients = imageResponse.messages[response.messages.length - 1].content;
console.log(ingredients);

// Prompt Version 1:
// Here are the identifiable items I can see in the fridge image:
// - Fried chicken pieces (container with blue lid)
// - Cooked white rice (container with white lid)
// - Fresh tomatoes (in two bowls)
// - Cherry tomatoes (the red round ones in the bowls)
// - Dill pickles (jar with green lid, center)
// - Dill pickles or cucumber pickles (another jar with green lid, right)
// - Hellmann’s Real Mayonnaise (jar, front center)
// - French’s Classic Yellow Mustard (yellow bottle)
// - Red jarred condiment (small jar with red contents, top shelf)
// - Gold-lidded jar (contents not clear)
// If you’d like, I can suggest simple recipes using these leftovers.

// Prompt Version 2:
// - Chicken pieces
// - Rice
// - Tomatoes
// - Mayonnaise
// - Mustard
// - Pickles

message = new HumanMessage(
  `I have the following leftovers on my fridge. What can I make?

  ${ingredients}
  `
)

response = await agent.invoke({
  messages: [message]
}, config);
console.log(response.messages[response.messages.length - 1].content);
