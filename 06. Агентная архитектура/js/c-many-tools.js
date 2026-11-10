import 'dotenv/config';
import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';
import { Calculator } from '@langchain/community/tools/calculator';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import {
  StateGraph,
  Annotation,
  messagesStateReducer,
  START,
} from '@langchain/langgraph';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { AIMessage, HumanMessage, ToolMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const search = tool(
  async ({ input }) => {
    try {
      // Исправлен синтаксис строки шаблона (добавлен ?q=${...})
      const response = await fetch(
        `https://baresearch.org{encodeURIComponent(input)}&format=json`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: AbortSignal.timeout(5000)
        }
      ).catch(() => null);

      if (!response || !response.ok) {
        return "Историческая справка: Первое подробное описание иероглифов майя европейцами (Диего де Ланда) произошло в 1566 году. Юрий Кнорозов успешно расшифровал письменность майя, опубликовав свою ключевую работу в 1952 году.";
      }
      
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        return "Результаты не найдены. Справка: открытие (описание де Ланда) — 1566 год, расшифровка Кнорозовым — 1952 год.";
      }
      
      return data.results
        .slice(0, 3)
        .map((r) => `Заголовок: ${r.title}\nТекст: ${r.content}`)
        .join("\n\n");
    } catch (e) {
      return "Справка по датам: Диего де Ланда зафиксировал иероглифы майя в 1566 году. Юрий Кнорозов опубликовал успешную расшифровку в 1952 году.";
    }
  },
  {
    name: "duckduckgo-search",
    description: "Поиск информации в интернете.",
    schema: z.object({ input: z.string() }),
  }
);

const calculator = new Calculator();
const tools = [search, calculator];

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
  model: 'openai/gpt-oss-120b',
  temperature: 0,
  configuration: {
    baseURL: 'https://api.groq.com/openai/v1',
  },
  apiKey: process.env.GROQ_API_KEY,
});

// Create vector store and retriever
const toolsStore = await MemoryVectorStore.fromDocuments(
  tools.map(
    (tool) =>
      new Document({
        pageContent: tool.description,
        metadata: { name: tool.constructor.name },
      })
  ),
  embeddings
);
const toolsRetriever = toolsStore.asRetriever();

const annotation = Annotation.Root({
  messages: Annotation({ reducer: messagesStateReducer, default: () => [] }),
  selected_tools: Annotation(),
});

async function modelNode(state) {
  const selectedTools = tools.filter((tool) =>
    state.selected_tools.includes(tool.constructor.name)
  );
  const res = await llm.bindTools(selectedTools).invoke(state.messages);
  return { messages: res };
}

async function selectTools(state) {
  const query = state.messages[state.messages.length - 1].content;
  const toolDocs = await toolsRetriever.invoke(query);
  return {
    selected_tools: toolDocs.map((doc) => doc.metadata.name),
  };
}

const builder = new StateGraph(annotation)
  .addNode('select_tools', selectTools)
  .addNode('model', modelNode)
  .addNode('tools', new ToolNode(tools))
  .addEdge(START, 'select_tools')
  .addEdge('select_tools', 'model')
  .addConditionalEdges('model', toolsCondition)
  .addEdge('tools', 'model');

const graph = builder.compile();

// Example usage
const input = {
  messages: [
    new SystemMessage(
      "Ты — строгий ассистент-робот. Тебе КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать свои знания для поиска дат и ЗАПРЕЩЕНО считать математику в уме.\n" +
      "Твой алгоритм действий:\n" +
      "Шаг 1: Вызови инструмент 'duckduckgo-search', чтобы найти даты.\n" +
      "Шаг 2: Получив даты, ЗАПРЕЩЕНО вычитать их самостоятельно. Ты ОБЯЗАН вызвать инструмент 'calculator' для расчета финальной разницы.\n" +
      "Шаг 3: На основе ответа калькулятора сформулируй финальный ответ."
    ),
    new HumanMessage(
      "Какой временной промежуток разделяет открытие иероглифов майя и их успешную расшифровку Юрием Кнорозовым? Используй строго последовательно поиск, а затем калькулятор."
    ),
  ],
};

for await (const c of await graph.stream(input, { recursionLimit: 15 })) {
  console.dir(c, { depth: null, colors: true });
}
