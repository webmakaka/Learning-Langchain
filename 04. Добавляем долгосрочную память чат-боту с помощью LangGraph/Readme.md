# 04. Добавляем долгосрочную память чат-боту с помощью LangGraph

<br/>

<img src="../img/ch04-pic01.png" alt="Добавляем долгосрочную память чат-боту с помощью LangGraph">

<br/>

<img src="../img/ch04-pic02.png" alt="Добавляем долгосрочную память чат-боту с помощью LangGraph">

<br/>

```shell
$ node ./a-simple-memory.js 
Я перевел ваше предложение "I love programming" на русский язык.

Перевод: **Я люблю программировать.**

Если вы имели в виду что-то другое или хотите уточнить контекст, пожалуйста, дайте знать! 😊
```

<br/>

## Знакомство с LangGraph

<br/>

```shell
$ node ./b-state-graph.js 
{
  chatbot: {
    messages: AIMessage {
      "id": "chatcmpl-a86e8fbf599ef32a",
      "content": "Привет! Чем могу помочь?",
      "additional_kwargs": {
        "function_call": null
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 16,
          "completionTokens": 9,
          "totalTokens": 25
        },
        "finish_reason": "stop",
        "model_name": "auto",
        "usage": {
          "prompt_tokens": 16,
          "total_tokens": 25,
          "completion_tokens": 9,
          "prompt_tokens_details": null,
          "completion_tokens_details": {
            "reasoning_tokens": 0
          }
        },
        "system_fingerprint": "vllm-0.30.0-4dc91a50"
      },
      "tool_calls": [],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 9,
        "input_tokens": 16,
        "total_tokens": 25,
        "input_token_details": {},
        "output_token_details": {
          "reasoning": 0
        }
      }
    }
  }
}
```

<br/>

```js
// Отрисовать в консоли graph
const drawableGraph = await graph.getGraphAsync();
console.log(drawableGraph.drawMermaid());
```

<br/>

### Добавление памяти в StateGraph

<br/>

```shell
$ node ./c-persistent-memory.js 
{
  messages: [
    HumanMessage {
      "id": "58f13305-cc1b-4e65-a1d9-7cf475852479",
      "content": "Привет, я Malrey!",
      "additional_kwargs": {},
      "response_metadata": {}
    },
    AIMessage {
      "id": "chatcmpl-864ee7e9ed42195f",
      "content": "Привет, Malrey! Рад знакомству. Чем могу помочь тебе сегодня?",
      "additional_kwargs": {
        "function_call": null
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 20,
          "completionTokens": 19,
          "totalTokens": 39
        },
        "finish_reason": "stop",
        "model_name": "auto",
        "usage": {
          "prompt_tokens": 20,
          "total_tokens": 39,
          "completion_tokens": 19,
          "prompt_tokens_details": null,
          "completion_tokens_details": {
            "reasoning_tokens": 0
          }
        },
        "system_fingerprint": "vllm-0.30.0-4dc91a50"
      },
      "tool_calls": [],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 19,
        "input_tokens": 20,
        "total_tokens": 39,
        "input_token_details": {},
        "output_token_details": {
          "reasoning": 0
        }
      }
    }
  ]
}
{
  messages: [
    HumanMessage {
      "id": "58f13305-cc1b-4e65-a1d9-7cf475852479",
      "content": "Привет, я Malrey!",
      "additional_kwargs": {},
      "response_metadata": {}
    },
    AIMessage {
      "id": "chatcmpl-864ee7e9ed42195f",
      "content": "Привет, Malrey! Рад знакомству. Чем могу помочь тебе сегодня?",
      "additional_kwargs": {
        "function_call": null
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 20,
          "completionTokens": 19,
          "totalTokens": 39
        },
        "finish_reason": "stop",
        "model_name": "auto",
        "usage": {
          "prompt_tokens": 20,
          "total_tokens": 39,
          "completion_tokens": 19,
          "prompt_tokens_details": null,
          "completion_tokens_details": {
            "reasoning_tokens": 0
          }
        },
        "system_fingerprint": "vllm-0.30.0-4dc91a50"
      },
      "tool_calls": [],
      "invalid_tool_calls": []
    },
    HumanMessage {
      "id": "6f50059f-7954-48e1-9659-f50555ea6ed6",
      "content": "Не забыл как меня зовут?",
      "additional_kwargs": {},
      "response_metadata": {}
    },
    AIMessage {
      "id": "chatcmpl-afd635d6041be776",
      "content": "Конечно, я помню! Вас зовут **Malrey**. 😊\n\nЧем могу быть полезен?",
      "additional_kwargs": {
        "function_call": null
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 61,
          "completionTokens": 25,
          "totalTokens": 86
        },
        "finish_reason": "stop",
        "model_name": "auto",
        "usage": {
          "prompt_tokens": 61,
          "total_tokens": 86,
          "completion_tokens": 25,
          "prompt_tokens_details": null,
          "completion_tokens_details": {
            "reasoning_tokens": 0
          }
        },
        "system_fingerprint": "vllm-0.30.0-4dc91a50"
      },
      "tool_calls": [],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 25,
        "input_tokens": 61,
        "total_tokens": 86,
        "input_token_details": {},
        "output_token_details": {
          "reasoning": 0
        }
      }
    }
  ]
}
```


