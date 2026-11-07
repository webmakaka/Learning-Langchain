import 'dotenv/config';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { RunnableLambda } from '@langchain/core/runnables';

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
const model = new OpenAIEmbeddings({
  model: 'liquid/lfm-2.5-embedding-350m:free',
  batchSize: 128,
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
  apiKey: process.env.OPENROUTER_API_KEY,
});

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
const llm =new ChatOpenAI({
  model: 'auto',
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const perspectivesPrompt = ChatPromptTemplate.fromTemplate(
  `Ты ассистент на базе языковой модели ИИ. Твоя задача — сгенерировать пять различных вариантов исходного вопроса пользователя для извлечения релевантных документов из векторной базы данных. Путем создания нескольких формулировок вопроса пользователя твоя цель — помочь преодолеть некоторые ограничения поиска по сходству на основе расстояния. Предоставь эти альтернативные вопросы, разделяя их символом новой строки. Оригинальный вопрос: {question}`
);

const queryGen = perspectivesPrompt.pipe(llm).pipe((message) => {
  return message.content
    .split('\n')
    .map((q) => q.trim())
    .filter((q) => q.length > 0);
});

/**
 * This chain retrieves and combines the documents from the vector store for each query
 */
const retrievalChain = queryGen
  .pipe(retriever.batch.bind(retriever))
  .pipe((documentLists) => {
    const dedupedDocs = {};
    documentLists.flat().forEach((doc) => {
      dedupedDocs[doc.pageContent] = doc;
    });
    return Object.values(dedupedDocs);
  });

const prompt = ChatPromptTemplate.fromTemplate(
  'Отвечай на вопрос, основываясь исключительно на следующем контексте::\n {context}\n\nВопрос: {question}'
);

console.log('Выполнение QA на основе множественных запросов\n');
const multiQueryQa = RunnableLambda.from(async (input) => {
  // fetch relevant documents
  const docs = await retrievalChain.invoke({ question: input });
  // format prompt
  const formatted = await prompt.invoke({ context: docs, question: input });
  // generate answer
  const answer = await llm.invoke(formatted);
  return answer;
});

const result = await multiQueryQa.invoke(
  'Подскажи, о каких городах речь в данной статье?'
);

console.log(result);

await db.end();
