import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

const answerSchema = z
  .object({
    answer: z.string().describe('Oтвeт на вопрос пользователя'),
    justification: z.string().describe('Обоснование ответа'),
  })
  .describe('Oтвeт на вопрос пользователя и обоснование ответа.');

const model = new ChatOpenAI({
  model: 'auto',
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
}).withStructuredOutput(answerSchema);

const response = await model.invoke(
  'Чтo весит больше, фунт кирпичей или фунт перьев'
);
console.log(response);
