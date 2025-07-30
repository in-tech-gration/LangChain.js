// https://js.langchain.com/docs/integrations/document_loaders/web_loaders/youtube/
// npm install @langchain/community @langchain/core youtubei.js
// NOTE: youtubei.js is no longer needed to be installed
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// YouTube Loader:
youTubeLoader: {

  break youTubeLoader;

  const loader = YoutubeLoader.createFromUrl("https://www.youtube.com/watch?v=qAF1NjEVHhY", {
    // language: "en",
    addVideoInfo: true,
  });

  // FAILED:
  // throw new Error(`Failed to get YouTube video transcription: ${e.message}`);
  // Error: Failed to get YouTube video transcription: [YoutubeTranscript] 🚨 No transcripts are available in en this video (qAF1NjEVHhY). Available languages: en-US
  // SOLUTION: Comment `language: "en"`

  const docs = await loader.load();

  // console.log(docs);
  console.log(docs[0].pageContent);
  console.log(docs[0].metadata.description);
  console.log(docs[0].metadata.title);
  console.log(docs[0].metadata.author);
  console.log(docs[0].metadata.view_count);

}

// ✅ PDF Loader: 
pdfLoader: {

  break pdfLoader;
  const loader = new PDFLoader("../assets/compact-guide-to-large-language-models.pdf");
  const docs = await loader.load();
  console.log({ docs });

}