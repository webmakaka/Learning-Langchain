import { AIMessage } from "@langchain/core/messages";
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import {
  StateGraph,
  Annotation,
  MessagesAnnotation,
  START,
  END,
} from "@langchain/langgraph";
import { z } from "zod";

// Define decision schema
const SupervisorDecision = z.object({
  next: z.enum(["researcher", "coder", "ГОТОВО!"]),
});

// Initialize model

const llm1 = new ChatOpenAI({
  model: 'openai/gpt-oss-120b',
  temperature: 0,
  configuration: {
    baseURL: 'https://api.groq.com/openai/v1',
  },
  apiKey: process.env.GROQ_API_KEY,
});

const llm2 = new ChatOpenAI({
  model: 'openai/gpt-oss-120b',
  temperature: 0,
  configuration: {
    baseURL: 'https://api.groq.com/openai/v1',
  },
  apiKey: process.env.GROQ_API_KEY,
});

const llm3 = new ChatOpenAI({
  model: 'openai/gpt-oss-120b',
  temperature: 0,
  configuration: {
    baseURL: 'https://api.groq.com/openai/v1',
  },
  apiKey: process.env.GROQ_API_KEY,
});

const modelWithStructuredOutput =
  llm3.withStructuredOutput(SupervisorDecision);

// Define available agents
const agents = ["researcher", "coder"];

// Define system prompts
const systemPromptPart1 = `Вы — супервизор, координирующий работу агентов: ${agents.join(", ")}.
Ваша задача — проанализировать историю беседы и определить следующего исполнителя (next) или завершить работу.

Правила принятия решений:
1. Если поле researcher_done равно true, а coder_done равно false, вызовите "coder".
2. Если поле coder_done равно true, завершите работу, вернув "ГОТОВО!".

Текущий запрос пользователя:`;

const systemPromptPart2 = `На основе истории сообщений выше определите следующий шаг. Выберите строго один из вариантов: ${agents.join(", ")}, ГОТОВО!`;

// ----------------------------------
// Supervisor

const supervisor = async (state) => {
  // Передаем оба флага в текстовый контекст модели
  const stateContext = `\nТекущий статус состояния графа: researcher_done = ${state.researcher_done}, coder_done = ${state.coder_done}`;
  
  const messages = [
    { role: "system", content: systemPromptPart1 + stateContext },
    ...state.messages,
    { role: "system", content: systemPromptPart2 },
  ];

  const response = await modelWithStructuredOutput.invoke(messages);
  return { next: response.next };
};

// Supervisor
// ----------------------------------

// Define state type
const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  next: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "supervisor",
  }),
  researcher_done: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
  // Добавлен новый флаг
  coder_done: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
});

// ------------------------------------
// Researcher

const ResearcherResponseSchema = z.object({
  analysis_text: z.string().describe("Результаты текстового анализа данных"),
  is_complete: z.boolean().describe("Флаг завершения работы. Всегда true, если анализ готов"),
});

const researcherModel = llm1.withStructuredOutput(ResearcherResponseSchema);

const researcher = async (state) => {
  const response = await researcherModel.invoke([
    {
      role: "system",
      content: "Вы — ассистент-исследователь. Проанализируйте запрос пользователя, извлеките ключевые метрики и предоставьте текстовый анализ. Заполните поле is_complete значением true.",
    },
    ...state.messages,
  ]);

  // Явно создаем объект сообщения для редьюсера истории
  const aiMessage = new AIMessage({ content: response.analysis_text });

  return { 
    messages: [aiMessage],
    researcher_done: response.is_complete
  };
};

// Researcher
// ------------------------------------


// ------------------------------------
// Coder

// 1. Добавьте схему ответа кодера
const CoderResponseSchema = z.object({
  code_text: z.string().describe("Готовый программный код для визуализации данных"),
  is_complete: z.boolean().describe("Флаг завершения работы над кодом. Всегда true"),
});

const coderModel = llm2.withStructuredOutput(CoderResponseSchema);

// 2. Исправленная функция coder
const coder = async (state) => {
  const response = await coderModel.invoke([
    {
      role: "system",
      content: "Вы — ассистент по программированию. Реализуйте запрошенную функциональность визуализации. Напишите готовый код на основе анализа researcher. Не задавайте вопросов пользователю. Установите флаг is_complete в значение true.",
    },
    ...state.messages,
  ]);

  return { 
    messages: [new AIMessage({ content: response.code_text })],
    coder_done: response.is_complete
  };
};

// Coder
// ------------------------------------

// Build the graph
const graph = new StateGraph(StateAnnotation)
  .addNode("supervisor", supervisor)
  .addNode("researcher", researcher)
  .addNode("coder", coder)
  .addEdge(START, "supervisor")
  // Route to one of the agents or exit based on the supervisor's decision
  .addConditionalEdges("supervisor", async (state) =>
    state.next === "ГОТОВО!" ? END : state.next,
  )
  .addEdge("researcher", "supervisor")
  .addEdge("coder", "supervisor")
  .compile();

// Example usage

const initialState = {
  messages: [
    {
      role: "user",
      content: "Мне нужна помощь в анализе некоторых данных и создании визуализации.",
    },
  ],
  next: "supervisor",
};

const stream = await graph.stream(initialState);

for await (const chunk of stream) {
  // Получаем имя узла (например, "supervisor") и возвращенные им данные
  const [nodeName, nodeOutput] = Object.entries(chunk)[0];
  
  console.log(`\n[Узел: ${nodeName}]`);
  
  if (nodeOutput.next) {
    console.log(`Решение супервизора (next): ${nodeOutput.next}`);
  }
  
  if (nodeOutput.messages && nodeOutput.messages.length > 0) {
    const lastMsg = nodeOutput.messages[nodeOutput.messages.length - 1];
    console.log(`Ответ: ${lastMsg.content.slice(0, 100)}...`);
  }
}
