import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  model: 'auto',
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});
const prompt = [new HumanMessage('Какой город является столицей Франции?')];

const response = await model.invoke(prompt);
console.log(response.content);
