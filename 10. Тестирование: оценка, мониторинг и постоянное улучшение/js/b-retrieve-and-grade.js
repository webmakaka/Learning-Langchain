import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { InMemoryVectorStore } from '@langchain/community/vectorstores/in_memory';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import 'dotenv/config';
import { z } from 'zod';

const embeddings = new OpenAIEmbeddings({
  model: 'liquid/lfm-2.5-embedding-350m:free',
  temperature: 0,
  batchSize: 128,
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
  apiKey: process.env.OPENROUTER_API_KEY,
});

const llm = new ChatOpenAI({
  model: 'auto',
  temperature: 0,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const urls = [
  'https://blog.langchain.dev/top-5-langgraph-agents-in-production-2024/',
  'https://blog.langchain.dev/langchain-state-of-ai-2024/',
  'https://blog.langchain.dev/introducing-ambient-agents/',
];

// Load documents from URLs
const loadDocs = async (urls) => {
  const docs = [];
  for (const url of urls) {
    const loader = new CheerioWebBaseLoader(url);
    const loadedDocs = await loader.load();
    docs.push(...loadedDocs);
  }
  return docs;
};

const docsList = await loadDocs(urls);

// Initialize the text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 250,
  chunkOverlap: 0,
});

// Split the documents into smaller chunks
const docSplits = textSplitter.splitDocuments(docsList);

// Add to vector database
const vectorstore = await InMemoryVectorStore.fromDocuments(
  docSplits,
  embeddings
);

const retriever = vectorstore.asRetriever(); // The `retriever` object can now be used for querying

const question =
  'Назовите 2 агента на базе LangGraph, использовавшихся в продакшене в 2024 году?';

const docs = retriever.invoke(question);

console.log('Retrieved documents: \n', docs[0].page_content);

// Define the schema using Zod
const GradeDocumentsSchema = z.object({
  binary_score: z
    .string()
    .describe(`Документы релевантны вопросу: «да» или «нет»`),
});

// Initialize LLM with structured output using Zod schema

const structuredLLMGrader = llm.withStructuredOutput(GradeDocumentsSchema);

// System and prompt template
const systemMessage = `Вы — оценщик, проверяющий релевантность извлеченного документа вопросу пользователя. Если документ содержит ключевые слова или семантический смысл, связанный с вопросом, оцените его как релевантный. Дайте бинарную оценку «да» или «нет», чтобы указать, является ли документ релевантным вопросу.`;
const gradePrompt = ChatPromptTemplate.fromMessages([
  { role: 'system', content: systemMessage },
  {
    role: 'human',
    content:
      'Retrieved document: \n\n {document} \n\n User question: {question}',
  },
]);

// Combine prompt with the structured output
const retrievalGrader = gradePrompt.pipe(structuredLLMGrader);

// Grade retrieved documents
const results = await retrievalGrader.invoke({
  question,
  document: docs[0].page_content,
});

console.log('\n\nGrading results: \n', results);
