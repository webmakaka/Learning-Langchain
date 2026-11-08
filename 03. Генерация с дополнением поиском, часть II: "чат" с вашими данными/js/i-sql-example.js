import { ChatOpenAI } from '@langchain/openai';
import 'dotenv/config';
import { createSqlQueryChain } from 'langchain/chains/sql_db';
import { SqlDatabase } from 'langchain/sql_db';
import { QuerySqlTool } from 'langchain/tools/sql';
import { DataSource } from 'typeorm';

const llm = new ChatOpenAI({
  model: 'openai/gpt-oss-120b',
  temperature: 0,
  configuration: {
    baseURL: 'https://api.groq.com/openai/v1',
  },
  apiKey: process.env.GROQ_API_KEY,
});

const datasource = new DataSource({
  type: 'better-sqlite3',
  database: 'Chinook.db', //this should be the path to the db
});
const db = await SqlDatabase.fromDataSourceParams({
  appDataSource: datasource,
});
//test that the db is working
await db.run('SELECT * FROM Artist LIMIT 10;');

// convert question to sql query
const writeQuery = await createSqlQueryChain({ llm, db, dialect: 'sqlite' });
// execute query
const executeQuery = new QuerySqlTool(db);
// combined
const chain = writeQuery.pipe(executeQuery);

const result = await chain.invoke({
  question: 'Сколько у вас сотрудников?',
});
console.log(result);
