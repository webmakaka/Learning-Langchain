# 05. Когнитивные архитектуры с LangGraph

Применительно к LLM когнитивная архитектура — это по сути рецепты, или схема шагов, которые должно выполнять приложение на основе LLM. 
Примером шага может быть, скажем, извлечение релевантных документов (RAG) или вызов модели с промптом в стиле "цепочки размышлений" (chain-of-thought).

<br/>

<img src="../img/ch05-pic01.png" alt="Когнитивные архитектуры с LangGraph">

<br/>

### Архитектура № 1: Вызов LLM

```shell
$ node ./a-chatbot.js 
{
  chatbot: {
    messages: AIMessage {
      "id": "chatcmpl-ae26099592bd2fd2",
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

### Архитектура No 2: Цепочка


```shell
$ 
```
