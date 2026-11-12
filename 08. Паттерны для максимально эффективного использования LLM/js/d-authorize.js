import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { MemorySaver, StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const subtractYears = tool(
  async ({ a, b }) => String(Math.abs(a - b)),
  {
    name: "subtract_years",
    description: "Вычисляет разницу между двумя годами.",
    schema: z.object({
      a: z.number().describe("Первый год"),
      b: z.number().describe("Второй год"),
    }),
  }
);

const tools = [subtractYears];

const llm = new ChatOpenAI({
  model: "auto",
  temperature: 0,
  configuration: {
    baseURL: "https://vireonix.ai/v1",
  },
  apiKey: "not-needed",
}).bindTools(tools);

const callModel = async (state, config) => {
  const response = await llm.invoke(state.messages, config);
  return { messages: [response] };
};

// Assuming graph is already created and configured
const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", new ToolNode(tools))
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition)
  .addEdge("tools", "agent")
  .compile({ checkpointer: new MemorySaver() });

const input = {
  messages: [
    new HumanMessage(
      "Какой временной промежуток разделяет открытие иероглифов майя и их успешную расшифровку Юрием Кнорозовым?",
    ),
  ],
};

const config = { configurable: { thread_id: "1" } };

const output = await graph.stream(input, {
  ...config,
  interruptBefore: ["tools"],
});

for await (const chunk of output) {
  console.log(chunk); // do something with the output
}
