import 'dotenv/config';
import {
  AIMessage,
  SystemMessage,
  HumanMessage,
} from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import {
  StateGraph,
  Annotation,
  messagesStateReducer,
  START,
  END,
} from '@langchain/langgraph';

const llm1 = new ChatOpenAI({
  model: 'auto',
  temperature: 0,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const llm2 = new ChatOpenAI({
  model: 'openai/gpt-oss-120b',
  temperature: 0,
  configuration: {
    baseURL: 'https://api.groq.com/openai/v1',
  },
  apiKey: process.env.GROQ_API_KEY,
});



const annotation = Annotation.Root({
  messages: Annotation({ reducer: messagesStateReducer, default: () => [] }),
});

const generatePrompt = new SystemMessage(
  `Вы — ассистент по написанию эссе, чья задача — создавать отличные эссе из трех абзацев.
Сгенерируйте максимально качественное эссе по запросу пользователя.
Если пользователь предоставляет критику, ответьте измененной версией ваших предыдущих попыток.`
);

async function generate(state) {
  const answer = await llm1.invoke([generatePrompt, ...state.messages]);
  return { messages: [answer] };
}

const reflectionPrompt = new SystemMessage(
  `Вы — преподаватель, оценивающий отправленное эссе. Сгенерируйте критику и рекомендации для работы пользователя.
Предоставьте подробные рекомендации, включая требования к объему, глубине содержания, стилю и т. д.`
);

async function reflect(state) {
  // Invert the messages to get the LLM to reflect on its own output
  const clsMap = {
    ai: HumanMessage,
    human: AIMessage,
  };
  // First message is the original user request. We hold it the same for all nodes
  const translated = [
    reflectionPrompt,
    state.messages[0],
    ...state.messages
      .slice(1)
      .map((msg) => new clsMap[msg._getType()](msg.content)),
  ];
  const answer = await llm2.invoke(translated);
  // We treat the output of this as human feedback for the generator
  return { messages: [new HumanMessage({ content: answer.content })] };
}

function shouldContinue(state) {
  if (state.messages.length > 6) {
    // End after 3 iterations, each with 2 messages
    return END;
  } else {
    return 'reflect';
  }
}

const builder = new StateGraph(annotation)
  .addNode('generate', generate)
  .addNode('reflect', reflect)
  .addEdge(START, 'generate')
  .addConditionalEdges('generate', shouldContinue)
  .addEdge('reflect', 'generate');

const graph = builder.compile();

// Example usage
const initialState = {
  messages: [
    new HumanMessage(
      "Напиши краткое эссе на пару абзацев о мифах и сказках, повлиявших на творчество группы 'Король и шут'"
    ),
  ],
};

for await (const output of await graph.stream(initialState)) {
  const messageType = output.generate ? 'generate' : 'reflect';
  console.log(
    '\nNew message:',
    output[messageType].messages[
      output[messageType].messages.length - 1
    ].content.slice(0, 100),
    '...'
  );
}
