// Based on: https://github.com/langchain-ai/lca-lc-foundations/blob/main/notebooks/module-1/1.4_multimodal_messages.ipynb
// TEXT INPUT
// https://platform.openai.com/docs/models
import "dotenv/config.js";
import fs from "node:fs";
import path from "node:path";
import { createAgent, HumanMessage } from "langchain";
const __dirname = import.meta.dirname;

let systemPrompt = "You are a science fiction writer, create a capital city at the users request.";

let agent = createAgent({
  model: "gpt-5-nano",
  systemPrompt,
});

// Provider-native format (e.g., OpenAI)
const question = new HumanMessage(
  {
    content: [
      { "type": "text", "text": "What is the capital of The Moon?" }
    ]
  }
);

let response = await agent.invoke({
  messages: [question]
})
console.log(response.messages[1].content);

// IMAGE INPUT

// From URL
let message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this image." },
    {
      type: "image",
      source_type: "url",
      url: "https://images.pexels.com/photos/1850619/pexels-photo-1850619.jpeg"
    },
  ],
});

response = await agent.invoke({
  messages: [message]
})
console.log(response.messages[1].content);
// This image shows a quiet Parisian street framed by classic Haussmann-era buildings. The cream stone façades have ornate wrought-iron balconies, tall arched windows, and mansard roofs. In the distance, the Eiffel Tower rises between the surrounding rooftops, with another clock-tower building and more slate-roofed structures nearby. The street is tree-lined and the sky is overcast, giving the scene a calm, nostalgic mood.

const imageBuffer = fs.readFileSync(path.join(__dirname, './pexels-elina-sazonova-1850619.jpg'));
const base64Image = imageBuffer.toString("base64");  // Raw base64 data

// From base64 data
message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this image." },
    {
      type: "image",
      mime_type: "image/jpg",
      source_type: "base64",
      data: base64Image,
    },
  ],
});

response = await agent.invoke({
  messages: [message]
})
console.log(response.messages[1].content);