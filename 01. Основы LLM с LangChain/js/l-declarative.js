import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

// the building blocks

const template = ChatPromptTemplate.fromMessages([
  ['system', 'Ты полезный помощник.'],
  ['human', '{question}'],
]);

const model = new ChatOpenAI({
  model: 'auto',
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

// combine them in a function

const chatbot = template.pipe(model);

// use it

const response = await chatbot.invoke({
  question: 'Кто является поставщиком LLM?',
});

console.log(response);

//streaming

for await (const part of chatbot.stream({
  question: 'Кто является поставщиком LLM?',
})) {
  console.log(part);
}
