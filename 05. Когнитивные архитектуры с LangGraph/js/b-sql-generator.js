import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import {
  StateGraph,
  Annotation,
  messagesStateReducer,
  START,
  END,
} from "@langchain/langgraph";

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
  sql_query: Annotation(),
  sql_explanation: Annotation(),
});

const generatePrompt = new SystemMessage(
  "Ты - аналитик данных, генерирующий SQL-запросы дпя пользователей на основе их вопросов.",
);

async function generateSql(state) {
  const userMessage = new HumanMessage(state.user_query);
  const messages = [generatePrompt, ...state.messages, userMessage];
  const res = await modelLowTemp.invoke(messages);
  return {
    sql_query: res.content,
    // update conversation history
    messages: [userMessage, res],
  };
}

const explainPrompt = new SystemMessage(
  "Ты - аналитик данных, объясняющий SQL-запросы пользователям.",
);

async function explainSql(state) {
  const messages = [explainPrompt, ...state.messages];
  const res = await modelHighTemp.invoke(messages);
  return {
    sql_explanation: res.content,
    // update conversation history
    messages: res,
  };
}

const builder = new StateGraph(annotation)
  .addNode("generate_sql", generateSql)
  .addNode("explain_sql", explainSql)
  .addEdge(START, "generate_sql")
  .addEdge("generate_sql", "explain_sql")
  .addEdge("explain_sql", END);

const graph = builder.compile();

// Example usage
const result = await graph.invoke({
  user_query: "Каков общий объем продаж каждого продукта?",
});
console.log(result);
