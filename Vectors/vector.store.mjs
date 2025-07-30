// v0.3
// https://js.langchain.com/docs/integrations/vectorstores/memory/
// npm i langchain @langchain/core
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
import { OllamaEmbeddings } from "@langchain/ollama";

// A) Using OllamaEmbeddings:
const embeddings = new OllamaEmbeddings({ model: "all-minilm:latest" });

// B) Using OpenAI Embeddings:
// import { OpenAIEmbeddings } from "@langchain/openai";
// const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });

const vectorStore = new MemoryVectorStore(embeddings);

// Prepare Documents:
const document1 = {
  pageContent: "The powerhouse of the cell is the mitochondria",
  metadata: { source: "https://example.com" },
};
const document2 = {
  pageContent: "Buildings are made out of brick",
  metadata: { source: "https://example.com" },
};
const document3 = {
  pageContent: "Mitochondria are made out of lipids",
  metadata: { source: "https://example.com" },
};
const documents = [document1, document2, document3];

await vectorStore.addDocuments(documents);

// Optional filter:
const filter = (doc) => doc.metadata.source === "https://example.com";

// ✅ Query directly
similaritySearch: {

  break similaritySearch;

  const similaritySearchResults = await vectorStore.similaritySearch(
    "biology",
    2,
    filter
  );

  console.log("\n");
  console.log("==================");
  console.log("Similarity Search:");

  for (const doc of similaritySearchResults) {
    console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
  }

}

// ✅
similaritySearchWithScore: {

  break similaritySearchWithScore;

  // With Score:
  const similaritySearchWithScoreResults = await vectorStore.similaritySearchWithScore("biology", 2, filter);

  console.log("\n");
  console.log("=============================");
  console.log("Similarity Search with Score:");

  for (const [doc, score] of similaritySearchWithScoreResults) {
    console.log(
      `* [SIM=${score.toFixed(3)}] ${doc.pageContent} [${JSON.stringify(
        doc.metadata
      )}]`
    );
  }

}

// ✅
mmrRetriever: {

  break mmrRetriever;

  // Query by turning into retriever
  const retriever = vectorStore.asRetriever({
    // Optional filter
    filter,
    k: 2,
    // Optional MMR:
    searchType: "mmr", // "similarity"
    searchKwargs: {
      fetchK: 10,
    },
  });

  const results = await retriever.invoke("biology");

  console.log("\n");
  console.log("=================");
  console.log("Search using MMR:");

  for (const doc of results) {
    console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
  }

}

// ✅
scoreThresholdRetriever: {

  break scoreThresholdRetriever;

  // Retriever with threshold
  const scoreRetriever = ScoreThresholdRetriever.fromVectorStore(
    vectorStore,
    {
      minSimilarityScore: 0.3, // 0.01 === Essentially no threshold
      maxK: 3, // 1 === Only return the top result
    }
  );

  console.log(await scoreRetriever.invoke("biology"));

}

// ✅
vectorizeFromText: {

  break vectorizeFromText;

  const texts = [

    `Fine-tuning is like transfer learning, where the model uses its expertise to perform better on a related job. Fine-tuning a pre-trained model yields better outcomes with less computing resources and training time than starting from scratch. It is vital to contemporary machine learning workflows since it is utilized in natural language processing and computer vision to adjust models to new tasks or datasets.`,

    `Retrieval-Augmented Generation (RAG) uses a pre-trained retriever to effectively extract important information from big corpora or databases to improve language model creation. This strategy lets the model access more knowledge than pre-training data, resulting in more accurate and informative outputs. RAG dynamically combines external knowledge sources and improves question-answering summarization and content development. RAG might help natural language processing systems provide more contextually rich and accurate outputs by smoothly merging retrieval and production.`,

    `A machine learning model is an intelligent file that has been conditioned with an algorithm to learn specific patterns in datasets and give insights and predictions from those patterns. When creating an ML model, you define the answer that you would like to capture and set parameters for the model to work within and learn from. Once an ML model begins working with new data, you can gain actionable insights. They are also used for broad ranges of data with no known target—with the ability to utilize a pattern, they can address randomized data and still pull insights from it.`,

    `AI inference in machine learning uses a trained model to predict or decide on incoming input data. Inference is the process by which the model generates output by applying its training data knowledge to previously unseen data.`
  ];

  const vectorStore = await MemoryVectorStore.fromTexts(texts,
    [{ id: "FT-1" }, { id: "RAG-2" }, { id: "ML-3" }, { id: "AI-INF-4" }],
    embeddings,
  );

  const resultOne = await vectorStore.similaritySearch(
    "What exactly is a model?",
    // "Waht is fine-tuning?",
    // "What is a RAG?",
    // "How to improve a model and make it more precise?", 
    1
  );
  // console.log(resultOne[0]); // typeof Document {}
  console.log(resultOne[0].pageContent); // typeof Document {}

}