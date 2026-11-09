import 'dotenv/config';
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {
  StateGraph,
  Annotation,
  messagesStateReducer,
  START,
  END,
} from "@langchain/langgraph";

const embeddings = new OpenAIEmbeddings({
  model: 'liquid/lfm-2.5-embedding-350m:free',
  temperature: 0,
  batchSize: 128,
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
  apiKey: process.env.OPENROUTER_API_KEY,
});

// useful to generate SQL query
const modelLowTemp = new ChatOpenAI({
  model: 'auto',
  temperature: 0.1,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

// useful to generate natural language outputs
const modelHighTemp = new ChatOpenAI({
  model: 'auto',
  temperature: 0.7,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const annotation = Annotation.Root({
  messages: Annotation({ reducer: messagesStateReducer, default: () => [] }),
  user_query: Annotation(),
  domain: Annotation(),
  documents: Annotation(),
  answer: Annotation(),
});

// Sample documents for testing
const sampleDocs = [
  { pageContent: "Patient medical record...", metadata: { domain: "records" } },
  {
    pageContent: "Insurance policy details...",
    metadata: { domain: "insurance" },
  },
];

// Initialize vector stores
const medicalRecordsStore = await MemoryVectorStore.fromDocuments(
  sampleDocs,
  embeddings,
);
const medicalRecordsRetriever = medicalRecordsStore.asRetriever();

const insuranceFaqsStore = await MemoryVectorStore.fromDocuments(
  sampleDocs,
  embeddings,
);
const insuranceFaqsRetriever = insuranceFaqsStore.asRetriever();

const routerPrompt = new SystemMessage(
  `Тебе нужно решить, на какой домен направить запрос пользователя.
Есть два домена на выбор:
- records: содержит медицинские записи пациента, такие как диагноз, лечение и рецепты.
- insurance: содержит часто задаваемые вопросы о страховых полисах, претензиях и покрытии.
Выведи только имя домена.`,
);

async function routerNode(state) {
  const userMessage = new HumanMessage(state.user_query);
  const messages = [routerPrompt, ...state.messages, userMessage];
  const res = await modelLowTemp.invoke(messages);
  return {
    domain: res.content,
    // update conversation history
    messages: [userMessage, res],
  };
}

function pickRetriever(state) {
  if (state.domain === "records") {
    return "retrieve_medical_records";
  } else {
    return "retrieve_insurance_faqs";
  }
}

async function retrieveMedicalRecords(state) {
  const documents = await medicalRecordsRetriever.invoke(state.user_query);
  return {
    documents,
  };
}

async function retrieveInsuranceFaqs(state) {
  const documents = await insuranceFaqsRetriever.invoke(state.user_query);
  return {
    documents,
  };
}

const medicalRecordsPrompt = new SystemMessage(
  "Ты - полезный медицинский чат-бот, отвечающий на вопросы, основанные на медицинских записях пациента, таких как диагноз, лечение и рецепты.",
);

const insuranceFaqsPrompt = new SystemMessage(
  "Ты - полезный чат-бот по медицинскому страхованию, отвечающий на  часто задаваемые вопросы о страховых полисах, претензиях и покрытии.",
);

async function generateAnswer(state) {
  const prompt =
    state.domain === "records" ? medicalRecordsPrompt : insuranceFaqsPrompt;
  const messages = [
    prompt,
    ...state.messages,
    new HumanMessage(`Documents: ${state.documents}`),
  ];
  const res = await modelHighTemp.invoke(messages);
  return {
    answer: res.content,
    // update conversation history
    messages: res,
  };
}

const builder = new StateGraph(annotation)
  .addNode("router", routerNode)
  .addNode("retrieve_medical_records", retrieveMedicalRecords)
  .addNode("retrieve_insurance_faqs", retrieveInsuranceFaqs)
  .addNode("generate_answer", generateAnswer)
  .addEdge(START, "router")
  .addConditionalEdges("router", pickRetriever)
  .addEdge("retrieve_medical_records", "generate_answer")
  .addEdge("retrieve_insurance_faqs", "generate_answer")
  .addEdge("generate_answer", END);

const graph = builder.compile();

// Example usage
const input = {
  user_query: "Покрывается ли мое лечение от COVID-19 страховкой?",
};

for await (const chunk of await graph.stream(input)) {
  console.log(chunk);
}
