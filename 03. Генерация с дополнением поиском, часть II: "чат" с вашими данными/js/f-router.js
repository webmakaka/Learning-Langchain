import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import 'dotenv/config';
import { z } from 'zod';

const llm =new ChatOpenAI({
  model: 'auto',
  temperature: 0,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const routeQuery = z
  .object({
    datasource: z
      .enum(['python_docs', 'js_docs'])
      .describe(
        'На основе пользовательского вопроса выбери, какой источник данных будет наиболее подходящим для ответа на него'
      ),
  })
  .describe('Маршрутизация пользовательского запроса к наиболее релевантному источнику данных');

// withStructuredOutput is a method that allows us to use the structured output of the model
const structuredLlm = llm.withStructuredOutput(routeQuery, {
  name: 'RouteQuery',
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `Ты эксперт по маршрутизации пользовательских вопросов к соответствующему источнику данных.
Основываясь на языке программирования, к которому относится вопрос, направь его к соответствующему источнику.`,
  ],
  ['human', '{question}'],
]);

const router = prompt.pipe(structuredLlm);

const question = `Почему следующий код не работает: 
from langchain_core.prompts 
import ChatPromptTemplate 
prompt = ChatPromptTemplate.from_messages(["human", "speak in {language}"]) 
prompt.invoke("french") `;

const result = await router.invoke({ question });

console.log('Routing to: ', result);

/** Once we’ve extracted the relevant data source, we can pass the value into another function to execute additional logic as required: */

const chooseRoute = (result) => {
  if (result.datasource.toLowerCase().includes('python_docs')) {
    return 'chain for python_docs';
  } else {
    return 'chain for js_docs';
  }
};

const fullChain = router.pipe(chooseRoute);

const finalResult = await fullChain.invoke({ question });

console.log('Choose route: ', finalResult);
