import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
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

const chatbot = template.pipe(model).pipe(new StringOutputParser());

const response = await chatbot.invoke({
  question: 'Кто является поставщиком LLM?',
});
console.log(response);

const stream = await chatbot.stream({
  question: 'Кто является поставщиком LLM?',
});

for await (const part of stream) {
  process.stdout.write(part);
}
