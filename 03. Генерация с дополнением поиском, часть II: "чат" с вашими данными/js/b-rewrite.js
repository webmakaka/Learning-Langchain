import 'dotenv/config';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { RunnableLambda } from '@langchain/core/runnables';

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
 * Query starts with irrelevant information before asking the relevant question
 */
const query =
  'Сегодня я проснулся и почистил зубы, затем сел читать новости. Но потом я забыл про еду на плите. Напомни, о каких городах речь в данной статье??';
/**
 * Provide retrieved docs as context to the LLM to answer a user's question
 */
const prompt = ChatPromptTemplate.fromTemplate(
  'Отвечайте на вопрос, основываясь исключительно на следующем контексте:\n {context}\n\nQuestion: {question}'
);

const qa = RunnableLambda.from(async (input) => {
  // fetch relevant documents
  const docs = await retriever.invoke(input);
  // format prompt
  const formatted = await prompt.invoke({ context: docs, question: input });
  // generate answer
  const answer = await llm.invoke(formatted);
  return { answer, docs };
});

const result = await qa.invoke(query);
console.log(result);
console.log('\n\nВызовите модель снова с переписанным запросом.\n\n');

const rewritePrompt = ChatPromptTemplate.fromTemplate(
  `Предоставьте более подходящий поисковый запрос для веб-поисковика, чтобы ответить на заданный вопрос, завершите запросы словом '**'. Вопрос: {question} Ответ:`
);
const rewriter = rewritePrompt.pipe(llm).pipe((message) => {
  return message.content.replaceAll('"', '').replaceAll('**');
});
const rewriterQA = RunnableLambda.from(async (input) => {
  const newQuery = await rewriter.invoke({ question: input }); // fetch relevant documents  console.log('New query: ', newQuery);
  const docs = await retriever.invoke(newQuery); // format prompt
  const formatted = await prompt.invoke({ context: docs, question: input }); // generate answer
  const answer = await llm.invoke(formatted);
  return answer;
});

const finalResult = await rewriterQA.invoke(query);
console.log(finalResult);

await db.end();
