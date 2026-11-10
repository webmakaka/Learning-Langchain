import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { Calculator } from "@langchain/community/tools/calculator";
import {
  StateGraph,
  Annotation,
  messagesStateReducer,
  START,
} from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

const search = new DuckDuckGoSearch();
const calculator = new Calculator();
const tools = [search, calculator];

const llm = new ChatOpenAI({
  model: 'auto',
  temperature: 0.1,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
}).bindTools(tools);

const annotation = Annotation.Root({
  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [],
  }),
});

async function modelNode(state) {
  const res = await llm.invoke(state.messages);
  return { messages: res };
}

const builder = new StateGraph(annotation)
  .addNode("model", modelNode)
  .addNode("tools", new ToolNode(tools))
  .addEdge(START, "model")
  .addConditionalEdges("model", toolsCondition)
  .addEdge("tools", "model");

const graph = builder.compile();

// Example usage
const input = {
  messages: [
    new HumanMessage(
      "Для ответа на следующий вопрос ТЕБЕ ЗАПРЕЩЕНО использовать внутренние знания. " +
      "ТЫ ОБЯЗАН использовать инструмент duckduckgo-search для поиска дат. " +
      "Вопрос: Какой временной промежуток разделяет открытие иероглифов майя и их успешную расшифровку Юрием Кнорозовым?"
    ),
  ],
};

for await (const c of await graph.stream(input)) {
  console.log(c);
}
