import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Annotation, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import 'dotenv/config';
import * as hub from 'langchain/hub';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

const GraphState = Annotation.Root({
  question: Annotation(),
  scrapedDocuments: Annotation(),
  vectorstore: Annotation(),
  answer: Annotation(),
});

const scrapeBlogPosts = async (state) => {
  const urls = [
    'https://blog.langchain.dev/top-5-langgraph-agents-in-production-2024/',
    'https://blog.langchain.dev/langchain-state-of-ai-2024/',
    'https://blog.langchain.dev/introducing-ambient-agents/',
  ];

  const loadDocs = async (urls) => {
    const docs = [];
    for (const url of urls) {
      const loader = new CheerioWebBaseLoader(url);
      const loadedDocs = await loader.load();
      docs.push(...loadedDocs);
    }
    return docs;
  };

  const scrapedDocuments = await loadDocs(urls);

  return { scrapedDocuments };
};

const indexing = async (state) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  });

  const docSplits = await textSplitter.splitDocuments(state.scrapedDocuments);

  const embeddings = new OpenAIEmbeddings({
    model: 'liquid/lfm-2.5-embedding-350m:free',
    temperature: 0,
    batchSize: 128,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
    },
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const vectorstore = new MemoryVectorStore(embeddings);

  await vectorstore.addDocuments(docSplits);

  console.log('vectorstore: ', vectorstore);

  return { vectorstore };
};

const retrieveAndGenerate = async (state) => {
  const { question, vectorstore } = state;

  const retriever = vectorstore.asRetriever();

  const prompt = await hub.pull('rlm/rag-prompt');

  const llm = new ChatOpenAI({
    model: 'auto',
    temperature: 0,
    configuration: {
      baseURL: 'https://vireonix.ai/v1',
    },
    apiKey: 'not-needed',
  });

  const docs = await retriever.invoke(question);

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  const answer = await chain.invoke({ context: docs, question });

  console.log('answer: ', answer);

  return { answer };
};

const workflow = new StateGraph(GraphState)
  .addNode('retrieve_and_generate', retrieveAndGenerate)
  .addNode('scrape_blog_posts', scrapeBlogPosts)
  .addNode('indexing', indexing)
  .addEdge('__start__', 'scrape_blog_posts')
  .addEdge('scrape_blog_posts', 'indexing')
  .addEdge('indexing', 'retrieve_and_generate')
  .addEdge('retrieve_and_generate', '__end__');

const graph = workflow.compile();

await graph.invoke({ question: 'Что такое фоновые агенты?' });
