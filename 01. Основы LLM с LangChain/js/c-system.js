import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  model: 'auto',
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});
const prompt = [
  new SystemMessage(
    'You are a helpful assistant that responds to questions with three exclamation marks.'
  ),
  new HumanMessage('What is the capital of France?'),
];

const response = await model.invoke(prompt);
console.log(response.content);
