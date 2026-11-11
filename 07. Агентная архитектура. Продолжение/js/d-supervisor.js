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
const systemPromptPart1 = `Вы — супервизор, чья задача — управлять беседой между следующими исполнителями (workers): ${agents.join(
  ", ",
)}. Учитывая следующий запрос пользователя, укажите исполнителя (worker), который должен действовать дальше. Каждый исполнитель выполнит задачу и предоставит свои результаты и статус. По окончании работы ответьте ГОТОВО!.`;

const systemPromptPart2 = `Учитывая приведенную выше беседу, кто должен действовать дальше? Или мы должны завершить работу (ГОТОВО!)? Выберите один из вариантов: ${agents.join(
  ", ",
)}, ГОТОВО!`;

// Define supervisor
const supervisor = async (state) => {
  const messages = [
    { role: "system", content: systemPromptPart1 },
    ...state.messages,
    { role: "system", content: systemPromptPart2 },
  ];

  // return await modelWithStructuredOutput.invoke(messages);

    const response = await modelWithStructuredOutput.invoke(messages);
  
  // Возвращаем объект для обновления ключа 'next' в состоянии графа
  return { next: response.next };
};

// Define state type
const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  // next: Annotation("researcher" | "coder" | "ГОТОВО!"),
  next: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "supervisor",
  }),
});

// Define agent functions
const researcher = async (state) => {
  const response = await llm1.invoke([
    {
      role: "system",
      content:
        "Вы — ассистент-исследователь. Проанализируйте запрос, предоставьте релевантную информацию. После предоставления информации обязательно напишите в самом конце текста слово 'ГОТОВО', чтобы супервизор знал, что вы завершили этап.",
    },
    ...state.messages,
  ]);
  return { messages: [response] };
};

const coder = async (state) => {
  const response = await llm2.invoke([
    {
      role: "system",
      content:
        "Вы — ассистент по программированию. Реализуйте запрошенную функциональность.",
    },
    ...state.messages,
  ]);
  return { messages: [response] };
};

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

// for await (const output of stream) {
//   console.log(`\nStep decision: ${output.next || "N/A"}`);
//   if (output.messages) {
//     console.log(
//       `Response: ${output.messages[output.messages.length - 1].content.slice(
//         0,
//         100,
//       )}...`,
//     );
//   }
// }

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
