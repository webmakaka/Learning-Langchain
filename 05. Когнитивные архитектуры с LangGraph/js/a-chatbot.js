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
  // Messages have the type "list". The `add_messages`
  // function in the annotation defines how this state should
  // be updated (in this case, it appends new messages to the
  // list, rather than replacing the previous messages)
  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [],
  }),
};

async function chatbot(state) {
  const answer = await llm.invoke(state.messages);
  return { messages: answer };
}

const builder = new StateGraph(State)
  .addNode('chatbot', chatbot)
  .addEdge(START, 'chatbot')
  .addEdge('chatbot', END);

const graph = builder.compile();

// Example usage
const input = { messages: [new HumanMessage('Привет!')] };
for await (const chunk of await graph.stream(input)) {
  console.log(chunk);
}
