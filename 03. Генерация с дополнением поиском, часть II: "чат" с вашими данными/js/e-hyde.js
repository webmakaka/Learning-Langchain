import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda } from '@langchain/core/runnables';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import 'dotenv/config';
import { TextLoader } from 'langchain/document_loaders/fs/text';

const model = new OpenAIEmbeddings({
  model: 'liquid/lfm-2.5-embedding-350m:free',
  batchSize: 128,
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
  apiKey: process.env.OPENROUTER_API_KEY,
});

const llm =new ChatOpenAI({
  model: 'auto',
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const connectionString =
  'postgresql://langchain:langchain@localhost:6024/langchain';
// Load the document, split it into chunks
const loader = new TextLoader('./test.rus.txt');
const raw_docs = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const splitDocs = await splitter.splitDocuments(raw_docs);

// embed each chunk and insert it into the vector store

const db = await PGVectorStore.fromDocuments(splitDocs, model, {
  postgresConnectionOptions: {
    connectionString,
  },
});

// retrieve 2 relevant documents from the vector store
const retriever = db.asRetriever({ k: 2 });
/**
 * Provide retrieved docs as context to the LLM to answer a user's question
 */

const hydePrompt = ChatPromptTemplate.fromTemplate(
  `Пoжaлyйcтa, напиши отрывок, чтобы ответить на вопрос.\n Вопрос: {question} \n Отрывок:`
);

const generatedDoc = hydePrompt.pipe(llm).pipe((msg) => msg.content);

/**
 * This chain retrieves and combines the documents from the vector store for each query
 */
const retrievalChain = generatedDoc.pipe(retriever);

const prompt = ChatPromptTemplate.fromTemplate(
  'Oтвeть на следующий вопрос, основываясь на следующем контексте:\n {context}\n\nВопрос: {question}'
);

console.log('Running hyde\n');
const hydeQa = RunnableLambda.from(async (input) => {
  // fetch relevant documents
  const docs = await retrievalChain.invoke({ question: input });
  // format prompt
  const formatted = await prompt.invoke({ context: docs, question: input });
  // generate answer
  const answer = await llm.invoke(formatted);
  return answer;
});

const result = await hydeQa.invoke(
  'Подскажи, о каких городах речь в данной статье?'
);

console.log(result);

await db.end();
