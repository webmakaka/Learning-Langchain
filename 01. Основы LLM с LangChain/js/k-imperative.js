import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda } from '@langchain/core/runnables';
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
// RunnableLambda adds the same Runnable interface for any function you write

const chatbot = RunnableLambda.from(async (values) => {
  const prompt = await template.invoke(values);
  return await model.invoke(prompt);
});

// use it

const response = await chatbot.invoke({
  question: 'Кто является поставщиком LLM?',
});
console.log(response.content);
