import { ChatOllama } from "@langchain/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import "dotenv/config";
import { RunnableSequence } from "@langchain/core/runnables";

// LCEL EXAMPLE: Generate code for a use case in a specified language
const chatModel = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama3.1:latest",
  temperature: 0
});

// Create a chat prompt
const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a professional software developer who knows about {language}. 
      Return just the code without any explanations, and always enclose the code in markdown code blocks.
      You can add inline comments if necessary.`,
  ],
  ["human", "Generate code for the following use case: {problem}"],
]);

// Example of composing Runnables with pipe
const chain = promptTemplate.pipe(chatModel).pipe(new StringOutputParser());

// Example of composing Runnables with RunnableSequence
const chain2 = RunnableSequence.from([
  promptTemplate,
  chatModel,
  new StringOutputParser(),
]);

// Try: replace chain.invoke() with chain2.invoke()
const response = await chain.invoke({
  language: "JavaScript",
  problem: "Get the average of a list of numbers"
});

console.log(response);
