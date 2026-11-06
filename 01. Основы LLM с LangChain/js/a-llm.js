import { ChatOpenAI } from '@langchain/openai';
import 'dotenv/config';

const model = new ChatOpenAI({
  model: 'auto',
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

// const model = new ChatOpenAI({
//   model: 'glm-4.5-flash',
//   configuration: {
//     baseURL: 'https://api.z.ai/api/paas/v4',
//   },
//   apiKey: process.env.GLM_API_KEY,
// });

const response = await model.invoke('Какого цвета облака?');
console.log(response.content);
