import { MemorySaver } from "@langchain/langgraph"
import { HumanMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
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
const callModel = async (state) => {
  const response = await llm.invoke(state.messages);
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

// Assuming graph is already created and configured
const output = await graph.stream(input, config);

for await (const chunk of output) {
  console.log(chunk);
}
