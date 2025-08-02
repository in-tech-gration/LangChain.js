// Based on: https://js.langchain.com/v0.1/docs/get_started/quickstart/
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const chatModel = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama3.1:latest",
});

// 1) Simple:
Simple: /* DISABLED: true */ {

  break Simple;

  console.log(await chatModel.invoke("What is RGB?"));

}

// 2) Prompt Template:
PromptTemplate: /* DISABLED: true */ {

  break PromptTemplate;

  const template1 = "You are a comedian. Tell a joke based on the following word {input}"
  const template2 = "Provide 5 synonyms, separated by commas, for the following word {word}"
  const template3 = "I want to open a restaurant for {cuisine} food. Suggest a fancy name for this."
  // const prompt = ChatPromptTemplate.fromTemplate(template1);

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a world class technical documentation writer."],
    ["user", "{input}"],
  ]);

  // console.log( await prompt.format({ input: "What is an LLM?"}) );
  const chain = prompt.pipe(chatModel);
  console.log(await chain.invoke({ input: "What is an LLM?" }));

}

// https://js.langchain.com/docs/how_to/prompts_partial/
Partials: /* DISABLED: true */ {

  break Partials;

  // Partials with Strings
  const prompt = ChatPromptTemplate.fromTemplate("Tell me a joke about {topic} in {language}");

  const partialPrompt = await prompt.partial({
    language: "greek",
  });

  const formattedPrompt = await partialPrompt.format({
    topic: "Athens",
  });

  console.log(formattedPrompt);

  // Partials with Functions: 
  // A) https://js.langchain.com/docs/how_to/prompts_partial/#partial-with-functions
  // B) https://js.langchain.com/docs/how_to/few_shot/#few-shotting-with-functions

  /*
    """
    You can also partial with a function. The use case for this is when you have a variable you know that you always want to fetch in a common way. A prime example of this is with date or time. Imagine you have a prompt which you always want to have the current date. You can't hard code it in the prompt, and passing it along with the other input variables can be tedious. In this case, it's very handy to be able to partial the prompt with a function that always returns the current date.
    """
  */


}

// Validation (SQL): https://js.langchain.com/docs/how_to/sql_query_checking/

// ✅ 
MultiplePromptVariables: {

  break MultiplePromptVariables;

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful assistant that translates {input_language} to {output_language}.",
    ],
    ["human", "{input}"],
  ]);

  const chain = prompt.pipe(chatModel);
  
  const response = await chain.invoke({
    input_language: "English",
    output_language: "German",
    input: "I love programming.",
  });

  console.log(response);

}