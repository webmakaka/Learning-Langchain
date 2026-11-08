import {
  StateGraph,
  Annotation,
  messagesStateReducer,
  START,
  END,
} from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

const llm =new ChatOpenAI({
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

builder = builder.addNode('chatbot', chatbot);

builder = builder.addEdge(START, 'chatbot').addEdge('chatbot', END);

let graph = builder.compile();

// Run the graph
const input = { messages: [new HumanMessage('Привет!')] };
for await (const chunk of await graph.stream(input)) {
  console.log(chunk);
}
