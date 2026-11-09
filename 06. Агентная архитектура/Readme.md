# Аrентная архитектура

:warning: Duck не разрешает делать вызовы их tool

```shell
s$ node ./a-basic-agent.js 
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
