import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver, StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "auto",
  temperature: 0,
  configuration: {
    baseURL: "https://vireonix.ai/v1",
  },
  apiKey: "not-needed",
});

// Узел вызова модели
const callModel = async (state, config) => {
  const response = await llm.invoke(state.messages, config);
  return { messages: [response] };
};

// Сборка и компиляция графа
const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addEdge("agent", END)
  .compile({ checkpointer: new MemorySaver() });

const input = {
  messages: [
    new HumanMessage(
      "Какой временной промежуток разделяет открытие иероглифов майя и их успешную расшифровку Юрием Кнорозовым?",
    ),
  ],
};

const config = { configurable: { thread_id: "1" } };

const controller = new AbortController();

const timeoutId = setTimeout(() => {
  controller.abort();
}, 2000);

try {
  const output = await graph.stream(input, {
    ...config,
    signal: controller.signal,
    streamMode: "messages", // Потоковый вывод токенов в реальном времени
  });

  for await (const [messageChunk] of output) {
    if (messageChunk.content) {
      process.stdout.write(messageChunk.content);
    }
  }
  console.log("\n[Генерация завершена]");
} catch (e) {
  if (controller.signal.aborted) {
    console.log("\n[Остановлено: превышен лимит времени]");
  } else {
    console.error("\n[Ошибка выполнения]:", e.message);
  }
} finally {
  clearTimeout(timeoutId);
}
