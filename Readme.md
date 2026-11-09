# [Книга][Ошин Майо, Кампос Нуну] Изучаем LangChain: разработка AI- и LLM-приложений с использованием LangChain и LangGraph [RUS, 2026]

<img src="./img/book-cover.jpg" alt="Изучаем LangChain: разработка AI- и LLM-приложений с использованием LangChain и LangGraph" height="512px" align="right">

[Book][Mayo Oshin, Nuno Campos] Learning LangChain: Building AI and LLM Applications with LangChain and LangGraph [ENG, 2025]

**Оригинальный код книги:**  
https://github.com/langchain-ai/learning-langchain

<br/>

Практическое руководство по изучению LangChain и LangGraph для создания готовых к эксплуатации AI- и LLM-приложений. Рассмотрены основы работы с большими языковыми моделями (LLM), извлечение и индексация данных для генерации, дополненной поиском (retrieval-augmented generation, RAG), организация памяти чат-ботов через StateGraph. Детально разобраны когнитивные архитектуры (цепочки, маршрутизаторы, агентные циклы «планирование-действие»), построение многомодульных и мультиагентных систем. Приведены паттерны эффективного использования LLM: структурированный вывод, потоковая передача, режимы с участием человека. Отдельные главы посвящены развертыванию созданных приложений на платформе LangGraph — конфигурации, локальному тестированию, работе со студией LangGraph, а также комплексной оценке приложений: трассировке и сбору обратной связи в рабочей среде. .Книга предлагает работающий код, примеры оптимизации индексации и приемы трансформации запросов.

<br/>

:triangular_flag_on_post: Оригинальное репо книги переведено в архив более года назад! :triangular_flag_on_post: 

<br/>

### Оглавление:

<ul>
  <li>:white_check_mark: :book: :hammer_and_wrench: 01. Основы LLM с LangChain</li>
  <li>:white_check_mark: :book: :hammer_and_wrench: 02. Генерация с дополнением поиском, часть I: индексация ваших данных</li>
  <li>:white_check_mark: :book: :hammer_and_wrench: 03. Генерация с дополнением поиском, часть II: "чат" с вашими данными</li>
  <li>:white_check_mark: :book: :hammer_and_wrench: 04. Добавляем долгосрочную память чат-боту с помощью LangGraph</li>
  <li>:white_check_mark: :book: :hammer_and_wrench: 05. Когнитивные архитектуры с LangGraph</li>
  <li>▶️ 06. Агентная архитектура</li>
  <li>:pause_button: 07. Агентная архитектура. Продолжение</li>
  <li>:pause_button: 08. Паттерны для максимально эффективного использования LLM</li>
  <li>:pause_button: 09. Развертывание: запуск вашего AI-приложения в продакшен</li>
  <li>:pause_button: 10. Тестирование: оценка, мониторинг и постоянное улучшение</li>
  <li>:pause_button: 11. Разработка приложений с LLM</li>
</ul>

<br/>

## Чем пользуюсь:

### [Vireonix][Qwen] Free AI for chat, apps, and agents. Бесплатно, но с ограничениями.
https://vireonix.ai/

```js
const llm =new ChatOpenAI({
  model: 'auto',
  temperature: 0,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});
```

### [Z.ai] glm-4.5-flash и glm-4.7-flash. Бесплатно, но с ограничениями.
https://z.ai/model-api

```js
const llm = new ChatOpenAI({
  model: 'glm-4.5-flash',
  temperature: 0,
  configuration: {
    baseURL: 'https://api.z.ai/api/paas/v4',
  },
  apiKey: process.env.GLM_API_KEY,
});
```

### [Groq + AmneziaVPN] openai/gpt-oss-120b. Бесплатно, но с ограничениями.
https://console.groq.com/

```js
const llm = new ChatOpenAI({
  model: 'openai/gpt-oss-120b',
  temperature: 0,
  configuration: {
    baseURL: 'https://api.groq.com/openai/v1',
  },
  apiKey: process.env.GROQ_API_KEY,
});
```

### [Openrouter + AmneziaVPN] Бесплатно, но с ограничениями.
https://openrouter.ai

```js
const embeddings = new OpenAIEmbeddings({
  model: 'liquid/lfm-2.5-embedding-350m:free',
  temperature: 0,
  batchSize: 128,
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

<br/>

```js
const llm = new ChatOpenAI({
  model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
  apiKey: process.env.OPENROUTER_API_KEY,
});
```
