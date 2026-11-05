import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  model: 'auto',
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const response = await model.invoke('Какого цвета облака?');
console.log(response.content);
