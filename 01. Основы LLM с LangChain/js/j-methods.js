import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  model: 'auto',
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const response = await model.invoke('Hi there!');
console.log(response);
// Hi!

const completions = await model.batch(['Hi there!', 'Bye!']);
// ['Hi!', 'See you!']

for await (const token of await model.stream('Bye!')) {
  console.log(token);
  // Good
  // bye
  // !
}
