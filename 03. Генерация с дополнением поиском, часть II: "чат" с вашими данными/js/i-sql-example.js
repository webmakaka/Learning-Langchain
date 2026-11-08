import { ChatOpenAI } from '@langchain/openai';
import 'dotenv/config';
import { SqlDatabase } from 'langchain/sql_db';
import { QuerySqlTool } from 'langchain/tools/sql';
import { DataSource } from 'typeorm';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

// 1. Инициализация LLM
const llm = new ChatOpenAI({
  model: 'glm-4.5-flash',
  temperature: 0.01, // Избегаем абсолютного нуля, некоторые прокси выдают ошибку
  configuration: {
    baseURL: 'https://api.z.ai/api/paas/v4',
  },
  apiKey: process.env.GLM_API_KEY,
  model_kwargs: {
    stream: false // Принудительно отключаем стриминг во избежание пустых строк
  }
});

// 2. Подключение к SQLite
const datasource = new DataSource({
  type: 'better-sqlite3',
  database: 'Chinook.db',
});

const db = await SqlDatabase.fromDataSourceParams({
  appDataSource: datasource,
});

// Проверка работоспособности БД
await db.run('SELECT * FROM Artist LIMIT 10;');

// Определение инструмента выполнения
const executeQuery = new QuerySqlTool(db);

// 3. Получение схемы таблиц для LLM промпта
const tableInfo = await db.getTableInfo();

// 4. Шаблон промпта
const sqlPrompt = ChatPromptTemplate.fromTemplate(
  `Вы являетесь экспертом по SQLite. На основе схемы базы данных ниже напишите СТРОГО ОДИН SQL-запрос, который отвечает на вопрос. Не используйте markdown теги \`\`\`sql и не пишите никаких пояснений. Ответ должен содержать только валидный SQL код.

Схема таблиц:
{table_info}

Вопрос: {question}
SQL-запрос:`
);

// 5. Цепочка генерации и парсинга текста
const queryGenerator = sqlPrompt.pipe(llm).pipe(new StringOutputParser());

// 6. Сборка финального пайплайна
const chain = queryGenerator
  .pipe((output) => {
    console.log('--- СГЕНЕРИРОВАННЫЙ LLM ОТВЕТ ---');
    console.log(output);
    console.log('---------------------------------');

    let cleanSql = output.replace(/```sql|```/gi, '').trim();

    const selectMatch = cleanSql.match(/SELECT[\s\S]+/i);
    if (selectMatch) {
        cleanSql = selectMatch[0];
    }

    return cleanSql.replace(/\"/g, '');
  })
  .pipe(async (sqlString) => {
    return await executeQuery.invoke(sqlString);
  });

// 7. Вызов цепочки
const result = await chain.invoke({
  table_info: tableInfo,
  question: 'Сколько у вас сотрудников?',
});

console.log(result);
