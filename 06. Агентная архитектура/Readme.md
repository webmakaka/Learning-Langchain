# Аrентная архитектура

LLM-приложение, обладающее агентной природой, — это приложение, которое использует языковую модель, чтобы выбирать один или несколько вариантов действия на основе текущего контекста (например, состояния мира или желаемого результата).

Такие способности обычно реализуются при сочетании двух приемов создания промптов:

**Вызов инструментов (Tool calling)**

Включение в промпт списка внешних функций, которыми LLM может воспользоваться (т. е. действий, которые она может выбрать), и указание, как оформлять выбор в выводе. 

**Цепочка рассуждений (Chain-of-thought)**

Исследователи выяснили, что LLM лучше справляются с задачами, когда получают инструкции "думать шаг за шагом" — т. е. разбивать сложную задачу на последовательность мелких шагов, что обычно реализуется либо через добавление явных указаний вроде "рассуждай поэтапно", либо с помощью примеров, в которых показано, как разбивается задача и решается по частям.

<br/>

### Цикл Plan-Do (планирование-действие)

Агентная архитектура отличается: циклом, управляемым LLM.

Любой программист знаком с понятием цикла. Под циклом мы подразумеваем конструкцию, при которой код выполняется многократно, пока не будет достигнуто определенное условие завершения (stop condition). В случае с агентом условие завершения контролируется самой языковой моделью — именно она решает, когда остановиться.

Ключевая особенность агентной архитектуры заключается в следующем: LLM не просто отвечает, а управляет процессом — выбирает действия, выполняет их, оценивает результат и решает, нужно ли продолжать.

Внутри цикла мы будем выполнять некую вариацию следующих шагов:

• планирование действия (или нескольких);
• выполнение запланированного действия.

Сила агентной архитектуры заключается в следующем: LLM получает свободу действий — она сама выбирает, какие шаги предпринять и когда остановиться. Задача — не только найти ответ, но и самостоятельно решить, сколько шагов потребуется для его получения.

Такая архитектура получила название ReAct (от Reasoning + Acting) и была впервые предложена Шанью Яо и др. 

<br/>

### Создание агента на базе LangGraph

:warning: DuckDuckGo говорит, что-то скрипт делает слишком много запросов и отказывается работать

:warning: Предустановленная функция toolsCondition из пакета @langchain/langgraph/prebuilt автоматически возвращает строку "__end__", если в сообщении от модели отсутствуют запросы на вызов инструментов.

<br/>

```shell
$ node ./a-basic-agent.js 
Zod field at `#/definitions/duckduckgo-search/properties/input` uses `.optional()` without `.nullable()` which is not supported by the API. See: https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses#all-fields-must-be-required
This will become an error in a future version of the SDK.
Zod field at `#/definitions/calculator/properties/input` uses `.optional()` without `.nullable()` which is not supported by the API. See: https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses#all-fields-must-be-required
This will become an error in a future version of the SDK.
{
  model: {
    messages: AIMessage {
      "id": "0740bbcc48fbb30ea07b0a43a6a5aee0",
      "content": "",
      "additional_kwargs": {
        "tool_calls": [
          {
            "id": "call_01a1bf7e6ee3749f9e324f5e",
            "type": "function",
            "function": "[Object]"
          },
          {
            "id": "call_01a1bf7e6ee3749f9e324f5f",
            "type": "function",
            "function": "[Object]"
          }
        ]
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 645,
          "completionTokens": 292,
          "totalTokens": 937
        },
        "finish_reason": "tool_calls",
        "model_name": "auto"
      },
      "tool_calls": [
        {
          "name": "duckduckgo-search",
          "args": {
            "input": "открытие иероглифов майя дата открытия 1511 Кортес"
          },
          "type": "tool_call",
          "id": "call_01a1bf7e6ee3749f9e324f5e"
        },
        {
          "name": "duckduckgo-search",
          "args": {
            "input": "Юрий Кнорозов расшифровка иероглифов майя 1962 1963 год"
          },
          "type": "tool_call",
          "id": "call_01a1bf7e6ee3749f9e324f5f"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 292,
        "input_tokens": 645,
        "total_tokens": 937,
        "input_token_details": {
          "cache_read": 185
        },
        "output_token_details": {
          "reasoning": 196
        }
      }
    }
  }
}
{
  tools: {
    messages: [
      ToolMessage {
        "id": "3fddc4d9-3d8c-4981-9ac8-2579c8739f12",
        "content": "Error: DDG detected an anomaly in the request, you are likely making requests too quickly.\n Please fix your mistakes.",
        "name": "duckduckgo-search",
        "additional_kwargs": {},
        "response_metadata": {},
        "tool_call_id": "call_01a1bf7e6ee3749f9e324f5e"
      },
      ToolMessage {
        "id": "3ae1c711-e993-4535-8db5-515858e2bbaa",
        "content": "Error: DDG detected an anomaly in the request, you are likely making requests too quickly.\n Please fix your mistakes.",
        "name": "duckduckgo-search",
        "additional_kwargs": {},
        "response_metadata": {},
        "tool_call_id": "call_01a1bf7e6ee3749f9e324f5f"
      }
    ]
  }
}
{
  model: {
    messages: AIMessage {
      "id": "0740bbd58f9b6f28144d8ca6f630301c",
      "content": "",
      "additional_kwargs": {
        "tool_calls": [
          {
            "id": "call_01a1bf7e88fd747f823181dc",
            "type": "function",
            "function": "[Object]"
          }
        ]
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 1004,
          "completionTokens": 53,
          "totalTokens": 1057
        },
        "finish_reason": "tool_calls",
        "model_name": "auto"
      },
      "tool_calls": [
        {
          "name": "duckduckgo-search",
          "args": {
            "input": "открытие иероглифов майя история открытия дата"
          },
          "type": "tool_call",
          "id": "call_01a1bf7e88fd747f823181dc"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 53,
        "input_tokens": 1004,
        "total_tokens": 1057,
        "input_token_details": {
          "cache_read": 645
        },
        "output_token_details": {
          "reasoning": 8
        }
      }
    }
  }
}
{
  tools: {
    messages: [
      ToolMessage {
        "id": "e50d9cae-046d-4bbf-831b-8f0a95648c75",
        "content": "Error: DDG detected an anomaly in the request, you are likely making requests too quickly.\n Please fix your mistakes.",
        "name": "duckduckgo-search",
        "additional_kwargs": {},
        "response_metadata": {},
        "tool_call_id": "call_01a1bf7e88fd747f823181dc"
      }
    ]
  }
}
```

<br/>

<img src="../img/ch06-pic01.png" alt="Создание агента на базе LangGraph">

<br/>

Граф зацикливается между узлами модели и инструментов. То есть именно модель принимает решение о том, когда остановить выполнение — и это ключевая особенность агентной архитектуры. Каждый раз, когда вы строите цикл в LangGraph, скорее всего, потребуется условие завершения, чтобы определить, когда цикл должен завершиться.

<br/>

### Всегда сначала вызываем инструмент

<br/>

```shell

```

<br/>

<img src="../img/ch06-pic02.png" alt="Создание агента на базе LangGraph">

Обратите внимание на различия по сравнению с предыдущим разделом:

• Мы начинаем выполнение с узла first_model, который вообще не вызывает LLM. Он просто создает вызов инструмента search, используя пользовательское сообщение без изменений как поисковый запрос. В предыдущей архитектуре именно LLM должен был бы сгенерировать такой вызов инструмента (или какой-либо другой, который он посчитал бы более уместным).
• Далее мы переходим к узлу ToolNode, который работает так же, как и в предыдущем примере, а затем к агентному узлу (agent node), как и раньше.

