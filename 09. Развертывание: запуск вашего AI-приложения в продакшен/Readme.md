# 09. Развертывание: запуск вашего AI-приложения в продакшен

Этот репозиторий содержит код для RAG-чат-бота с поддержкой Python и JavaScript. 

Приложение состоит из графа загрузки (`Ingestion Graph`) и графа поиска (`Retrieval Graph`).

<br/>

В примере развертывания, мы будем использовать следующие сервисы:

* Векторное хранилище: Supabase;
* Мониторинг и отладка: LangSmith;
* :heavy_dollar_sign: Бэкенд API: LangGraph Platform.

<br/>

## Предварительные требования

1. **Переменные окружения:** Настройте файл `.env` в корне репозитория (`learning-langchain`), ориентируясь на `.env.example`.
2. **Supabase:** Создайте проект на [supabase.com](https://supabase.com), скопируйте `Project URL` и ключ `service_role` в переменные `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY`.
3. **Docker (опционально):** Требуется для Chroma в JS-реализации:
   ```bash
   docker pull chromadb/chroma
   docker run -p 8000:8000 chromadb/chroma
   ```

## Структура репозитория

Директория содержит раздельные реализации для JS и Python с аналогичной архитектурой (`ingestion_graph`, `retrieval_graph`, файлы конфигурации и демо-скрипты).

## Настройка и запуск

### Python
* **Установка:** `python -m venv .venv`, активация окружения, затем `pip install -e .` в папке `ch9/py`.
* **Запуск демо:** `python demo.py`
* **Сервер разработки:** `langgraph dev -c ch9/py/langgraph.json --verbose` (или `langgraph-dev`).

### JavaScript
* **Установка:** `npm install` в папке `ch9/js`.
* **Запуск демо:** `node demo.ts`
* **Сервер разработки:** `npm run langgraph:dev` (из корня репозитория).

Сервер разработки запускается на порту 2024 с доступом к интерфейсу LangSmith.

## Развертывание и взаимодействие

Развертывание выполняется через LangGraph CLI:
* **JS:** `npx @langchain/langgraph-cli deploy -c ch9/js/langgraph.json`
* **Python:** `npx @langchain/langgraph-cli deploy -c ch9/py/langgraph.json`

Для взаимодействия с API используйте LangGraph SDK и примеры из `demo.ts` / `demo.py`.
