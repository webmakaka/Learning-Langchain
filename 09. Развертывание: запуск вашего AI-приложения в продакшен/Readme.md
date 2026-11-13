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
2. **Supabase:** Создайте проект на [supabase.com](https://supabase.com), скопируйте `Project URL` и ключ `service_role` в переменные `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY`.

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
