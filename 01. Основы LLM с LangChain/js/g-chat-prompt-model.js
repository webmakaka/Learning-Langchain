import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  model: 'auto',
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const template = ChatPromptTemplate.fromMessages([
  [
    'system',
    'Ответь на вопрос, основываясь на контексте ниже. Если на вопрос невозможно ответить, используя предоставленную информацию, ответь «Я не знаю».',
  ],
  ['human', 'Context: {context}'],
  ['human', 'Question: {question}'],
]);

const prompt = await template.invoke({
  context:
    'Последние достижения в области обработки естественного языка обусловлены большими языковыми моделями (LLM). Эти модели превосходят своих меньших аналогов и стали бесценными для разработчиков, создающих приложения с возможностями обработки естественного языка. Разработчики могут использовать эти модели через библиотеку `transformers` от Hugging Face, или используя предложения OpenAI и Cohere через библиотеки `openai` и `cohere` соответственно.',
  question: 'Кто является поставщиком LLM?',
});

const response = await model.invoke(prompt);
console.log(response.content);
