// https://js.langchain.com/docs/integrations/tools/webbrowser/
import { WebBrowser } from "langchain/tools/webbrowser";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";

// Using Ollama:
const model = new ChatOllama({ 
  model: "llama3.1:latest", 
  temperature: 0,
});
const embeddings = new OllamaEmbeddings({ model: "all-minilm:latest" });

// Using OpenAI:
// const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });
// const embeddings = new OpenAIEmbeddings();

const browser = new WebBrowser({ model, embeddings });

const result = await browser.invoke(
  "https://science.howstuffworks.com/why-ancient-roman-concrete-stronger-than-modern.htm"
);

console.log(result);

/*
**Summary**

Researchers at the University of Utah have discovered why ancient Roman concrete is stronger than modern concrete. The secret lies in a chemical reaction that occurs when seawater filters through the piers and breakwaters made of age-old Roman concrete, causing interlocking minerals to grow, making the structure stronger over time. However, the exact recipe for mixing the marine mortar has been lost to time, and scientists are working to recreate it.

**Relevant Links:**

* [Science](https://science.howstuffworks.com) - The science section of HowStuffWorks
* [Materials Science Channel](https://science.howstuffworks.com/materials-science-channel.htm) - A channel on HowStuffWorks dedicated to materials science
* [Engineering Channel](https://science.howstuffworks.com/engineering-channel.htm) - A channel on HowStuffWorks dedicated to engineering
* [10 Times Humanity Found the Answer and Then Forgot](https://history.howstuffworks.com/10-times-humanity-found-answer-and-then-forgot.htm) - An article on HowStuffWorks about lost knowledge throughout history
* [Roman Engineering Tricks](https://science.howstuffworks.com/engineering/structural/10-roman-engineering-tricks.htm) - An article on HowStuffWorks about the engineering feats of ancient Rome
*/

