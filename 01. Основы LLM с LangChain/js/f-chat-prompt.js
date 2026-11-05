import { ChatPromptTemplate } from '@langchain/core/prompts';

const template = ChatPromptTemplate.fromMessages([
  [
    'system',
    'Ответь на вопрос, основываясь на контексте ниже. Если на вопрос невозможно ответить, используя предоставленную информацию, ответь «Я не знаю».',
  ],
  ['human', 'Context: {context}'],
  ['human', 'Question: {question}'],
]);

const response = await template.invoke({
  context:
    'Последние достижения в области обработки естественного языка обусловлены большими языковыми моделями (LLM). Эти модели превосходят своих меньших аналогов и стали бесценными для разработчиков, создающих приложения с возможностями обработки естественного языка. Разработчики могут использовать эти модели через библиотеку `transformers` от Hugging Face, или используя предложения OpenAI и Cohere через библиотеки `openai` и `cohere` соответственно.',
  question: 'Кто является поставщиком LLM?',
});
console.log(response.value);
