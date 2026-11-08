import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda } from '@langchain/core/runnables';
import { cosineSimilarity } from '@langchain/core/utils/math';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import 'dotenv/config';

const physicsTemplate = `Вы – очень умный профессор физики. Вы отлично умеете отвечать на вопросы по физике кратко и понятно.
Если вы не знаете ответа на вопрос, вы честно признаетесь в этом.
Вот вопрос: {query}`;

const mathTemplate = `Вы – очень хороший математик. Вы отлично отвечаете
на математические вопросы. Ваша сила в том, что вы умеете разбивать сложные задачи на части, решать каждую часть по отдельности, а затем собирать их в общий ответ.
Вот вопрос: {query}`;

const embeddings = new OpenAIEmbeddings({
  model: 'liquid/lfm-2.5-embedding-350m:free',
  temperature: 0,
  batchSize: 128,
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
  apiKey: process.env.OPENROUTER_API_KEY,
});

const llm = new ChatOpenAI({
  model: 'openai/gpt-oss-120b',
  temperature: 0,
  configuration: {
    baseURL: 'https://api.groq.com/openai/v1',
  },
  apiKey: process.env.GROQ_API_KEY,
});

const promptTemplates = [physicsTemplate, mathTemplate];

const promptEmbeddings = await embeddings.embedDocuments(promptTemplates);

const promptRouter = RunnableLambda.from(async (query) => {
  // Embed question
  const queryEmbedding = await embeddings.embedQuery(query);
  // Compute similarity
  const similarities = cosineSimilarity([queryEmbedding], promptEmbeddings)[0];
  // Pick the prompt most similar to the input question
  const mostSimilar =
    similarities[0] > similarities[1] ? promptTemplates[0] : promptTemplates[1];
  console.log(
    `Using ${mostSimilar === promptTemplates[0] ? 'PHYSICS' : 'MATH'}`
  );
  return PromptTemplate.fromTemplate(mostSimilar).invoke({ query });
});

const semanticRouter = promptRouter.pipe(
  llm
);

const result = await semanticRouter.invoke('Что такое косинусное расстояние?');
console.log('\nSemantic router result: ', result);
