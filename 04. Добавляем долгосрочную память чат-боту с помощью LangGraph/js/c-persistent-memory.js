import {
  StateGraph,
  Annotation,
  messagesStateReducer,
  START,
  END
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";

const llm = new ChatOpenAI({
  model: 'auto',
  temperature: 0,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const State = {
  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [],
  }),
};

let builder = new StateGraph(State);

async function chatbot(state) {
  const answer = await llm.invoke(state.messages);
  return { messages: answer };
}

builder = builder.addNode("chatbot", chatbot);

builder = builder.addEdge(START, "chatbot").addEdge("chatbot", END);

// Add persistence
const graph = builder.compile({ checkpointer: new MemorySaver() });

// Configure thread
const thread1 = { configurable: { thread_id: "1" } };

// Run with persistence
const result_1 = await graph.invoke(
  {
    messages: [new HumanMessage("Привет, я Malrey!")],
  },
  thread1,
);
console.log(result_1);

const result_2 = await graph.invoke(
  {
    messages: [new HumanMessage("Не забыл как меня зовут?")],
  },
  thread1,
);
console.log(result_2);

// Get state
await graph.getState(thread1);

// ----------------

await graph.updateState(thread1, { messages: [new HumanMessage(' Мне нравятся LLM!')] });

const updatedState = await graph.getState(thread1);

console.log(updatedState.values.messages);
