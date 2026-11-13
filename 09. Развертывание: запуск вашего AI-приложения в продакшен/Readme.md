# 09. Развертывание: запуск вашего AI-приложения в продакшен

Этот репозиторий содержит код для RAG-чат-бота с поддержкой Python и JavaScript. 

Приложение состоит из графа загрузки (`Ingestion Graph`) и графа поиска (`Retrieval Graph`).

<br/>

В примере развертывания (в книге) используются следующие сервисы:

* Векторное хранилище: Supabase;
* Мониторинг и отладка: LangSmith;
* :heavy_dollar_sign: Бэкенд API: LangGraph Platform.

<br/>

## Предварительные требования

1. **Переменные окружения:** Настройте файл `.env` в корне репозитория (`learning-langchain`), ориентируясь на `.env.example`.
2. **Supabase:** Создайте проект на supabase.com, скопируйте `Project URL` и ключ `service_role` в переменные `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY`.

<br/>

### Векторное хранилище

Нужно создать организацию.

<br/>

**Supabase > SQL Editor**

```
-- Включаем расширение pgvector для работы со встраиванием векторов
create extension vector;

-- Создаем таблицу для хранения ваших документов
create table documents (
  id bigserial primary key,
  content text, -- соответствует Document.pageContent
  metadata jsonb, -- соответствует Document.met
  embedding vector(1536) -- 1536 для эмбеддингов OpenAI, измените, если нужно
);

-- Функция для поиска документов
create function match_documents (
  query_embedding vector(1536),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  embedding jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    (embedding::text)::jsonb as embedding,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

<br/>

## [JS] Тестирование приложения LangGraph локально

:warning: Нужно каталог со скриптами переитеновать во что-то без кириллицы и `:`

```
$ cd js
$ npm install
$ npm install -g @langchain/langgraph-cli --allow-scripts=esbuild

// [FAIL!] 
$ langgraphjs dev
```

<br/>

langgraphjs должен быть запущен на порту 2024 с доступом к интерфейсу LangSmith

<br/>

```
$ npm i -D tsx
$ npx tsx demo.ts
```

<br/>

## Развертывание и взаимодействие

* **JS:** `npx @langchain/langgraph-cli deploy -c ch9/js/langgraph.json`
