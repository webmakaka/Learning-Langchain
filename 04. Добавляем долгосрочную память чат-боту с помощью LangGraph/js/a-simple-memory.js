import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

const llm =new ChatOpenAI({
  model: 'auto',
  temperature: 0,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    'Ты полезный помощник. Отвечай на все вопросы по мере своих возможностей.',
  ],
  ['placeholder', '{messages}'],
]);

const chain = prompt.pipe(llm);

const response = await chain.invoke({
  messages: [
    [
      'human',
      'Переведи это прецложение с английского на русский: I love programming.',
    ],
    ['ai', "Я люблю программировать"],
    ['human', 'Что ты только что сказал??'],
  ],
});

console.log(response.content);
