import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';

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

const chatbot = RunnableLambda.from(async function* (values) {
  const prompt = await template.invoke(values);
  for await (const token of await model.stream(prompt)) {
    yield token;
  }
});

for await (const token of await chatbot.stream({
  question: 'Кто является поставщиком LLM?',
})) {
  console.log(token);
}
