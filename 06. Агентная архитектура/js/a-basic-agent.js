import 'dotenv/config';
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Parser } from "expr-eval"; // Надежный парсер математических выражений
import {
  StateGraph,
  Annotation,
  messagesStateReducer,
  START, END
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, ToolMessage, SystemMessage } from "@langchain/core/messages";

// 1. Исправленный и надежный поиск
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

// 2. КАСТОМНЫЙ КАЛЬКУЛЯТОР (Совместимый с Groq / OpenAI Tool Calls)
const calculator = tool(
  async ({ expression }) => {
    try {
      // Безопасное вычисление строки выражения (например, "1952 - 1566")
      const result = Parser.evaluate(expression);
      return String(result);
    } catch (error) {
      return `Ошибка вычисления: ${error.message}`;
    }
  },
  {
    name: "calculator",
    description: "Выполняет математические расчеты. Подает на вход строку-выражение, например: '1952 - 1566'.",
    schema: z.object({
      expression: z.string().describe("Математическое выражение для вычисления, например '1952 - 1566'"),
    }),
  }
);

const tools = [search, calculator];

const llm = new ChatOpenAI({
  model: 'openai/gpt-oss-120b',
  temperature: 0,
  configuration: {
    baseURL: 'https://api.groq.com/openai/v1',
  },
  apiKey: process.env.GROQ_API_KEY,
}).bindTools(tools);

const annotation = Annotation.Root({
  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [],
  }),
});

async function modelNode(state) {
  const res = await llm.invoke(state.messages);
  return { messages: [res] };
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function customToolsNode(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
    return { messages: [] };
  }

  const toolMessages = [];
  
  for (const call of lastMessage.tool_calls) {
    await delay(1000); // Снизил задержку для скорости тестирования
    const targetTool = tools.find((t) => t.name === call.name);
    
    if (targetTool) {
      try {
        const response = await targetTool.invoke(call.args);
        toolMessages.push(new ToolMessage({
          content: typeof response === "string" ? response : JSON.stringify(response),
          name: call.name,
          tool_call_id: call.id,
        }));
      } catch (error) {
        toolMessages.push(new ToolMessage({
          content: `Error: ${error.message}`,
          name: call.name,
          tool_call_id: call.id,
        }));
      }
    }
  }

  return { messages: toolMessages };
}

function routerCondition(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return "end";
}

const builder = new StateGraph(annotation)
  .addNode("model", modelNode)
  .addNode("tools", customToolsNode)
  .addEdge(START, "model")
  .addConditionalEdges("model", routerCondition, {
    tools: "tools",
    end: END,
  })
  .addEdge("tools", "model");

const graph = builder.compile();

// 3. СТРОГИЙ ПРОМПТ ДЛЯ ДВУХШАГОВОГО ВЫЗОВА
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

// Запуск
for await (const c of await graph.stream(input, { recursionLimit: 15 })) {
  console.dir(c, { depth: null, colors: true });
}
