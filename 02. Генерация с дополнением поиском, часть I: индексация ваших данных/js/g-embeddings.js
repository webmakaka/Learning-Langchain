import { OpenAIEmbeddings } from '@langchain/openai';
import 'dotenv/config';

const model = new OpenAIEmbeddings({
  model: 'liquid/lfm-2.5-embedding-350m:free',
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
  apiKey: process.env.OPENROUTER_API_KEY,
});

const embeddings = await model.embedDocuments([
  'Hi there!',
  'Oh, hello!',
  "What's your name?",
  'My friends call me World',
  'Hello World!',
]);

console.log(embeddings);
