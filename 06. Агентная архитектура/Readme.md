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

### 01. Создание агента на базе LangGraph

:warning: Код сильно поменялся из-за того, что DuckDuckGo писал сообщения о слишком большом количестве запросов и отказывается работать

:warning: Предустановленная функция toolsCondition из пакета @langchain/langgraph/prebuilt автоматически возвращает строку "__end__", если в сообщении от модели отсутствуют запросы на вызов инструментов.

<br/>

```shell
$ node ./a-basic-agent
Zod field at `#/definitions/calculator/properties/input` uses `.optional()` without `.nullable()` which is not supported by the API. See: https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses#all-fields-must-be-required
This will become an error in a future version of the SDK.
{
  model: {
    messages: AIMessage {
      lc_serializable: true,
      lc_kwargs: {
        content: '',
        name: undefined,
        additional_kwargs: {
          function_call: null,
          tool_calls: [
            {
              id: 'chatcmpl-tool-bc8700555deabfd8',
              type: 'function',
              function: {
                name: 'duckduckgo-search',
                arguments: '{"input": "When were Mayan hieroglyphs first discovered/opened and when did Yuri Knorozov successfully decipher them"}'
              }
            }
          ]
        },
        response_metadata: {
          model_name: 'auto',
          usage: {
            prompt_tokens: 627,
            total_tokens: 676,
            completion_tokens: 49,
            prompt_tokens_details: null,
            completion_tokens_details: { reasoning_tokens: 0 }
          },
          system_fingerprint: 'vllm-0.30.0-4dc91a50'
        },
        id: 'chatcmpl-83372b25151bf717',
        tool_calls: [
          {
            name: 'duckduckgo-search',
            args: {
              input: 'When were Mayan hieroglyphs first discovered/opened and when did Yuri Knorozov successfully decipher them'
            },
            type: 'tool_call',
            id: 'chatcmpl-tool-bc8700555deabfd8'
          }
        ],
        invalid_tool_calls: [],
        usage_metadata: {
          output_tokens: 49,
          input_tokens: 627,
          total_tokens: 676,
          input_token_details: { audio: undefined, cache_read: undefined },
          output_token_details: { audio: undefined, reasoning: 0 }
        }
      },
      lc_namespace: [ 'langchain_core', 'messages' ],
      content: '',
      name: undefined,
      additional_kwargs: {
        function_call: null,
        tool_calls: [
          {
            id: 'chatcmpl-tool-bc8700555deabfd8',
            type: 'function',
            function: {
              name: 'duckduckgo-search',
              arguments: '{"input": "When were Mayan hieroglyphs first discovered/opened and when did Yuri Knorozov successfully decipher them"}'
            }
          }
        ]
      },
      response_metadata: {
        tokenUsage: { promptTokens: 627, completionTokens: 49, totalTokens: 676 },
        finish_reason: 'tool_calls',
        model_name: 'auto',
        usage: {
          prompt_tokens: 627,
          total_tokens: 676,
          completion_tokens: 49,
          prompt_tokens_details: null,
          completion_tokens_details: { reasoning_tokens: 0 }
        },
        system_fingerprint: 'vllm-0.30.0-4dc91a50'
      },
      id: 'chatcmpl-83372b25151bf717',
      tool_calls: [
        {
          name: 'duckduckgo-search',
          args: {
            input: 'When were Mayan hieroglyphs first discovered/opened and when did Yuri Knorozov successfully decipher them'
          },
          type: 'tool_call',
          id: 'chatcmpl-tool-bc8700555deabfd8'
        }
      ],
      invalid_tool_calls: [],
      usage_metadata: {
        output_tokens: 49,
        input_tokens: 627,
        total_tokens: 676,
        input_token_details: { audio: undefined, cache_read: undefined },
        output_token_details: { audio: undefined, reasoning: 0 }
      }
    }
  }
}
{
  tools: {
    messages: [
      ToolMessage {
        lc_serializable: true,
        lc_kwargs: {
          status: 'success',
          content: 'Историческая справка: Первое подробное описание иероглифов майя европейцами (Диего де Ланда) произошло в 1566 году. Юрий Кнорозов успешно расшифровал письменность майя, опубликовав свою ключевую работу в 1952 году.',
          artifact: undefined,
          tool_call_id: 'chatcmpl-tool-bc8700555deabfd8',
          name: 'duckduckgo-search',
          metadata: {},
          additional_kwargs: {},
          response_metadata: {},
          id: '8ee329a9-caab-4454-92ad-f4b4514740a3'
        },
        lc_namespace: [ 'langchain_core', 'messages' ],
        content: 'Историческая справка: Первое подробное описание иероглифов майя европейцами (Диего де Ланда) произошло в 1566 году. Юрий Кнорозов успешно расшифровал письменность майя, опубликовав свою ключевую работу в 1952 году.',
        name: 'duckduckgo-search',
        additional_kwargs: {},
        response_metadata: {},
        id: '8ee329a9-caab-4454-92ad-f4b4514740a3',
        lc_direct_tool_output: true,
        status: 'success',
        tool_call_id: 'chatcmpl-tool-bc8700555deabfd8',
        metadata: {},
        artifact: undefined
      }
    ]
  }
}
{
  model: {
    messages: AIMessage {
      lc_serializable: true,
      lc_kwargs: {
        content: '',
        name: undefined,
        additional_kwargs: {
          function_call: null,
          tool_calls: [
            {
              id: 'chatcmpl-tool-9508015860d57aa6',
              type: 'function',
              function: {
                name: 'calculator',
                arguments: '{"input": "1952 - 1566"}'
              }
            }
          ]
        },
        response_metadata: {
          model_name: 'auto',
          usage: {
            prompt_tokens: 759,
            total_tokens: 793,
            completion_tokens: 34,
            prompt_tokens_details: null,
            completion_tokens_details: { reasoning_tokens: 0 }
          },
          system_fingerprint: 'vllm-0.30.0-4dc91a50'
        },
        id: 'chatcmpl-bbd9bc716d0f823a',
        tool_calls: [
          {
            name: 'calculator',
            args: { input: '1952 - 1566' },
            type: 'tool_call',
            id: 'chatcmpl-tool-9508015860d57aa6'
          }
        ],
        invalid_tool_calls: [],
        usage_metadata: {
          output_tokens: 34,
          input_tokens: 759,
          total_tokens: 793,
          input_token_details: { audio: undefined, cache_read: undefined },
          output_token_details: { audio: undefined, reasoning: 0 }
        }
      },
      lc_namespace: [ 'langchain_core', 'messages' ],
      content: '',
      name: undefined,
      additional_kwargs: {
        function_call: null,
        tool_calls: [
          {
            id: 'chatcmpl-tool-9508015860d57aa6',
            type: 'function',
            function: {
              name: 'calculator',
              arguments: '{"input": "1952 - 1566"}'
            }
          }
        ]
      },
      response_metadata: {
        tokenUsage: { promptTokens: 759, completionTokens: 34, totalTokens: 793 },
        finish_reason: 'tool_calls',
        model_name: 'auto',
        usage: {
          prompt_tokens: 759,
          total_tokens: 793,
          completion_tokens: 34,
          prompt_tokens_details: null,
          completion_tokens_details: { reasoning_tokens: 0 }
        },
        system_fingerprint: 'vllm-0.30.0-4dc91a50'
      },
      id: 'chatcmpl-bbd9bc716d0f823a',
      tool_calls: [
        {
          name: 'calculator',
          args: { input: '1952 - 1566' },
          type: 'tool_call',
          id: 'chatcmpl-tool-9508015860d57aa6'
        }
      ],
      invalid_tool_calls: [],
      usage_metadata: {
        output_tokens: 34,
        input_tokens: 759,
        total_tokens: 793,
        input_token_details: { audio: undefined, cache_read: undefined },
        output_token_details: { audio: undefined, reasoning: 0 }
      }
    }
  }
}
{
  tools: {
    messages: [
      ToolMessage {
        lc_serializable: true,
        lc_kwargs: {
          status: 'success',
          content: '386',
          artifact: undefined,
          tool_call_id: 'chatcmpl-tool-9508015860d57aa6',
          name: 'calculator',
          metadata: {},
          additional_kwargs: {},
          response_metadata: {},
          id: '7bf43f59-0827-494b-b0b5-1c3f68ac9744'
        },
        lc_namespace: [ 'langchain_core', 'messages' ],
        content: '386',
        name: 'calculator',
        additional_kwargs: {},
        response_metadata: {},
        id: '7bf43f59-0827-494b-b0b5-1c3f68ac9744',
        lc_direct_tool_output: true,
        status: 'success',
        tool_call_id: 'chatcmpl-tool-9508015860d57aa6',
        metadata: {},
        artifact: undefined
      }
    ]
  }
}
{
  model: {
    messages: AIMessage {
      lc_serializable: true,
      lc_kwargs: {
        content: 'Временной промежуток между первым подробным описанием иероглифов майя (1566 год, Диего де Ланда) и их успешной расшифровкой Юрием Кнорозовым (1952 год) составляет **386 лет**.',
        name: undefined,
        additional_kwargs: { function_call: null, tool_calls: undefined },
        response_metadata: {
          model_name: 'auto',
          usage: {
            prompt_tokens: 813,
            total_tokens: 876,
            completion_tokens: 63,
            prompt_tokens_details: null,
            completion_tokens_details: { reasoning_tokens: 0 }
          },
          system_fingerprint: 'vllm-0.30.0-4dc91a50'
        },
        id: 'chatcmpl-9524b005361e8c21',
        tool_calls: [],
        invalid_tool_calls: [],
        usage_metadata: {
          output_tokens: 63,
          input_tokens: 813,
          total_tokens: 876,
          input_token_details: { audio: undefined, cache_read: undefined },
          output_token_details: { audio: undefined, reasoning: 0 }
        }
      },
      lc_namespace: [ 'langchain_core', 'messages' ],
      content: 'Временной промежуток между первым подробным описанием иероглифов майя (1566 год, Диего де Ланда) и их успешной расшифровкой Юрием Кнорозовым (1952 год) составляет **386 лет**.',
      name: undefined,
      additional_kwargs: { function_call: null, tool_calls: undefined },
      response_metadata: {
        tokenUsage: { promptTokens: 813, completionTokens: 63, totalTokens: 876 },
        finish_reason: 'stop',
        model_name: 'auto',
        usage: {
          prompt_tokens: 813,
          total_tokens: 876,
          completion_tokens: 63,
          prompt_tokens_details: null,
          completion_tokens_details: { reasoning_tokens: 0 }
        },
        system_fingerprint: 'vllm-0.30.0-4dc91a50'
      },
      id: 'chatcmpl-9524b005361e8c21',
      tool_calls: [],
      invalid_tool_calls: [],
      usage_metadata: {
        output_tokens: 63,
        input_tokens: 813,
        total_tokens: 876,
        input_token_details: { audio: undefined, cache_read: undefined },
        output_token_details: { audio: undefined, reasoning: 0 }
      }
    }
  }
}
```

<br/>

<img src="../img/ch06-pic01.png" alt="Создание агента на базе LangGraph">

<br/>

Граф зацикливается между узлами модели и инструментов. То есть именно модель принимает решение о том, когда остановить выполнение — и это ключевая особенность агентной архитектуры. Каждый раз, когда вы строите цикл в LangGraph, скорее всего, потребуется условие завершения, чтобы определить, когда цикл должен завершиться.

<br/>

### 02. Всегда сначала вызываем инструмент

<br/>

<img src="../img/ch06-pic02.png" alt="Создание агента на базе LangGraph">

Обратите внимание на различия по сравнению с предыдущим примером:

• Мы начинаем выполнение с узла first_model, который вообще не вызывает LLM. Он просто создает вызов инструмента search, используя пользовательское сообщение без изменений как поисковый запрос. В предыдущей архитектуре именно LLM должен был бы сгенерировать такой вызов инструмента (или какой-либо другой, который он посчитал бы более уместным).

• Далее мы переходим к узлу ToolNode, который работает так же, как и в предыдущем примере, а затем к агентному узлу (agent node), как и раньше.

<br/>

```shell
$ node ./b-force-first-tool.js 
Zod field at `#/definitions/calculator/properties/input` uses `.optional()` without `.nullable()` which is not supported by the API. See: https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses#all-fields-must-be-required
This will become an error in a future version of the SDK.
{
  first_model: {
    messages: [
      AIMessage {
        lc_serializable: true,
        lc_kwargs: {
          content: '',
          tool_calls: [
            {
              name: 'duckduckgo-search',
              args: {
                input: 'Какой временной промежуток разделяет открытие иероглифов майя и их успешную расшифровку Юрием Кнорозовым? Используй строго последовательно поиск, а затем калькулятор.'
              },
              id: '0.16970407334598425'
            }
          ],
          invalid_tool_calls: [],
          additional_kwargs: {},
          response_metadata: {},
          id: '48bad657-1ad1-4ed7-9726-4ade9b2ff2bc'
        },
        lc_namespace: [ 'langchain_core', 'messages' ],
        content: '',
        name: undefined,
        additional_kwargs: {},
        response_metadata: {},
        id: '48bad657-1ad1-4ed7-9726-4ade9b2ff2bc',
        tool_calls: [
          {
            name: 'duckduckgo-search',
            args: {
              input: 'Какой временной промежуток разделяет открытие иероглифов майя и их успешную расшифровку Юрием Кнорозовым? Используй строго последовательно поиск, а затем калькулятор.'
            },
            id: '0.16970407334598425'
          }
        ],
        invalid_tool_calls: [],
        usage_metadata: undefined
      }
    ]
  }
}
{
  tools: {
    messages: [
      ToolMessage {
        lc_serializable: true,
        lc_kwargs: {
          status: 'success',
          content: 'Историческая справка: Первое подробное описание иероглифов майя европейцами (Диего де Ланда) произошло в 1566 году. Юрий Кнорозов успешно расшифровал письменность майя, опубликовав свою ключевую работу в 1952 году.',
          artifact: undefined,
          tool_call_id: '0.16970407334598425',
          name: 'duckduckgo-search',
          metadata: {},
          additional_kwargs: {},
          response_metadata: {},
          id: 'd14caec0-db6e-4f3a-8992-27b9899675e3'
        },
        lc_namespace: [ 'langchain_core', 'messages' ],
        content: 'Историческая справка: Первое подробное описание иероглифов майя европейцами (Диего де Ланда) произошло в 1566 году. Юрий Кнорозов успешно расшифровал письменность майя, опубликовав свою ключевую работу в 1952 году.',
        name: 'duckduckgo-search',
        additional_kwargs: {},
        response_metadata: {},
        id: 'd14caec0-db6e-4f3a-8992-27b9899675e3',
        lc_direct_tool_output: true,
        status: 'success',
        tool_call_id: '0.16970407334598425',
        metadata: {},
        artifact: undefined
      }
    ]
  }
}
{
  model: {
    messages: AIMessage {
      lc_serializable: true,
      lc_kwargs: {
        content: '',
        name: undefined,
        additional_kwargs: {
          function_call: undefined,
          tool_calls: [
            {
              id: 'fc_aa58258f-23d8-4106-a28b-8f5614ea88d7',
              type: 'function',
              function: {
                name: 'calculator',
                arguments: '{"input":"1952-1566"}'
              }
            }
          ]
        },
        response_metadata: {
          model_name: 'openai/gpt-oss-120b',
          usage: {
            queue_time: 0.555466609,
            prompt_tokens: 508,
            prompt_time: 0.180448058,
            completion_tokens: 58,
            completion_time: 0.122661505,
            total_tokens: 566,
            total_time: 0.303109563,
            completion_tokens_details: { reasoning_tokens: 33 }
          },
          system_fingerprint: 'fp_64b2f1c926'
        },
        id: 'chatcmpl-e34d72bb-4217-49fd-9cbc-11504d3c6df2',
        tool_calls: [
          {
            name: 'calculator',
            args: { input: '1952-1566' },
            type: 'tool_call',
            id: 'fc_aa58258f-23d8-4106-a28b-8f5614ea88d7'
          }
        ],
        invalid_tool_calls: [],
        usage_metadata: {
          output_tokens: 58,
          input_tokens: 508,
          total_tokens: 566,
          input_token_details: { audio: undefined, cache_read: undefined },
          output_token_details: { audio: undefined, reasoning: 33 }
        }
      },
      lc_namespace: [ 'langchain_core', 'messages' ],
      content: '',
      name: undefined,
      additional_kwargs: {
        function_call: undefined,
        tool_calls: [
          {
            id: 'fc_aa58258f-23d8-4106-a28b-8f5614ea88d7',
            type: 'function',
            function: { name: 'calculator', arguments: '{"input":"1952-1566"}' }
          }
        ]
      },
      response_metadata: {
        tokenUsage: { promptTokens: 508, completionTokens: 58, totalTokens: 566 },
        finish_reason: 'tool_calls',
        model_name: 'openai/gpt-oss-120b',
        usage: {
          queue_time: 0.555466609,
          prompt_tokens: 508,
          prompt_time: 0.180448058,
          completion_tokens: 58,
          completion_time: 0.122661505,
          total_tokens: 566,
          total_time: 0.303109563,
          completion_tokens_details: { reasoning_tokens: 33 }
        },
        system_fingerprint: 'fp_64b2f1c926'
      },
      id: 'chatcmpl-e34d72bb-4217-49fd-9cbc-11504d3c6df2',
      tool_calls: [
        {
          name: 'calculator',
          args: { input: '1952-1566' },
          type: 'tool_call',
          id: 'fc_aa58258f-23d8-4106-a28b-8f5614ea88d7'
        }
      ],
      invalid_tool_calls: [],
      usage_metadata: {
        output_tokens: 58,
        input_tokens: 508,
        total_tokens: 566,
        input_token_details: { audio: undefined, cache_read: undefined },
        output_token_details: { audio: undefined, reasoning: 33 }
      }
    }
  }
}
{
  tools: {
    messages: [
      ToolMessage {
        lc_serializable: true,
        lc_kwargs: {
          status: 'success',
          content: '386',
          artifact: undefined,
          tool_call_id: 'fc_aa58258f-23d8-4106-a28b-8f5614ea88d7',
          name: 'calculator',
          metadata: {},
          additional_kwargs: {},
          response_metadata: {},
          id: 'e2b555c3-ff73-4186-93f4-aa4d2ab46c4b'
        },
        lc_namespace: [ 'langchain_core', 'messages' ],
        content: '386',
        name: 'calculator',
        additional_kwargs: {},
        response_metadata: {},
        id: 'e2b555c3-ff73-4186-93f4-aa4d2ab46c4b',
        lc_direct_tool_output: true,
        status: 'success',
        tool_call_id: 'fc_aa58258f-23d8-4106-a28b-8f5614ea88d7',
        metadata: {},
        artifact: undefined
      }
    ]
  }
}
{
  model: {
    messages: AIMessage {
      lc_serializable: true,
      lc_kwargs: {
        content: 'Разница между открытием майянских иероглифов (1566 г.) и их успешной расшифровкой Юрием Кнорозовым (1952 г.) составляет **386 лет**.',
        name: undefined,
        additional_kwargs: { function_call: undefined, tool_calls: undefined },
        response_metadata: {
          model_name: 'openai/gpt-oss-120b',
          usage: {
            queue_time: 0.498652425,
            prompt_tokens: 537,
            prompt_time: 0.035604679,
            completion_tokens: 91,
            completion_time: 0.188701698,
            total_tokens: 628,
            total_time: 0.224306377,
            completion_tokens_details: { reasoning_tokens: 34 }
          },
          system_fingerprint: 'fp_19b184c447'
        },
        id: 'chatcmpl-6135b60f-0f77-4d89-8e18-478802673dce',
        tool_calls: [],
        invalid_tool_calls: [],
        usage_metadata: {
          output_tokens: 91,
          input_tokens: 537,
          total_tokens: 628,
          input_token_details: { audio: undefined, cache_read: undefined },
          output_token_details: { audio: undefined, reasoning: 34 }
        }
      },
      lc_namespace: [ 'langchain_core', 'messages' ],
      content: 'Разница между открытием майянских иероглифов (1566 г.) и их успешной расшифровкой Юрием Кнорозовым (1952 г.) составляет **386 лет**.',
      name: undefined,
      additional_kwargs: { function_call: undefined, tool_calls: undefined },
      response_metadata: {
        tokenUsage: { promptTokens: 537, completionTokens: 91, totalTokens: 628 },
        finish_reason: 'stop',
        model_name: 'openai/gpt-oss-120b',
        usage: {
          queue_time: 0.498652425,
          prompt_tokens: 537,
          prompt_time: 0.035604679,
          completion_tokens: 91,
          completion_time: 0.188701698,
          total_tokens: 628,
          total_time: 0.224306377,
          completion_tokens_details: { reasoning_tokens: 34 }
        },
        system_fingerprint: 'fp_19b184c447'
      },
      id: 'chatcmpl-6135b60f-0f77-4d89-8e18-478802673dce',
      tool_calls: [],
      invalid_tool_calls: [],
      usage_metadata: {
        output_tokens: 91,
        input_tokens: 537,
        total_tokens: 628,
        input_token_details: { audio: undefined, cache_read: undefined },
        output_token_details: { audio: undefined, reasoning: 34 }
      }
    }
  }
}
```

<br/>

### 03. Работа с множеством инструментов

Когда LLM предоставляют множество инструментов (скажем, больше 10), качество планирования (т. е. способность выбрать правильный инстру­ мент) начинает снижаться.

Решение этой проблемы — сокращение числа инструментов, из которых модель может выбирать. Но что делать, если вы действительно хотите, чтобы модель могла использовать большое разнообразие инструментов в зависимости от пользовательских запросов?

Один из элегантных подходов — использовать этап RAG (Retrieval-Augmented Generation) для предварительного отбора наиболее релевантных инструментов для текущего запроса, а затем передать LLM только полученный поднабор, а не весь арсенал, что также поможет снизить стоимость вызова LLM (коммерческие модели, как правило, тарифицируются по длине запроса и ответа). С другой стороны, этап RAG вносит дополнительную задержку в работу приложения, поэтому его стоит использовать только при явном снижении производительности после добавления большего количества инструментов.

<br/>

<img src="../img/ch06-pic03.png" alt="Создание агента на базе LangGraph">

<br/>

Это почти то же самое, что и обычная агентная архитектура. Единственное отличие в том, что перед входом в основной цикл агента мы сначала проходим через узел select_tools (выбор инструментов). После этого все работает так же, как и в обычной агентной архитектуре, которую мы рассматривали ранее.


<br/>

```shell
$ node ./c-many-tools.js 
{
  select_tools: { selected_tools: [ 'DynamicStructuredTool', 'Calculator' ] }
}
Zod field at `#/definitions/calculator/properties/input` uses `.optional()` without `.nullable()` which is not supported by the API. See: https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses#all-fields-must-be-required
This will become an error in a future version of the SDK.
{
  model: {
    messages: AIMessage {
      lc_serializable: true,
      lc_kwargs: {
        content: '',
        name: undefined,
        additional_kwargs: {
          function_call: undefined,
          tool_calls: [
            {
              id: 'fc_3c936ddc-e954-43e8-ac3a-9262f749e109',
              type: 'function',
              function: {
                name: 'duckduckgo-search',
                arguments: '{"input":"first discovery of Mayan hieroglyphs date"}'
              }
            }
          ]
        },
        response_metadata: {
          model_name: 'openai/gpt-oss-120b',
          usage: {
            queue_time: 0.286018896,
            prompt_tokens: 364,
            prompt_time: 0.016209895,
            completion_tokens: 349,
            completion_time: 0.72330745,
            total_tokens: 713,
            total_time: 0.739517345,
            completion_tokens_details: { reasoning_tokens: 310 }
          },
          system_fingerprint: 'fp_854fa9be4c'
        },
        id: 'chatcmpl-afc02603-604b-4f3a-bf46-1550e0bb69e0',
        tool_calls: [
          {
            name: 'duckduckgo-search',
            args: { input: 'first discovery of Mayan hieroglyphs date' },
            type: 'tool_call',
            id: 'fc_3c936ddc-e954-43e8-ac3a-9262f749e109'
          }
        ],
        invalid_tool_calls: [],
        usage_metadata: {
          output_tokens: 349,
          input_tokens: 364,
          total_tokens: 713,
          input_token_details: { audio: undefined, cache_read: undefined },
          output_token_details: { audio: undefined, reasoning: 310 }
        }
      },
      lc_namespace: [ 'langchain_core', 'messages' ],
      content: '',
      name: undefined,
      additional_kwargs: {
        function_call: undefined,
        tool_calls: [
          {
            id: 'fc_3c936ddc-e954-43e8-ac3a-9262f749e109',
            type: 'function',
            function: {
              name: 'duckduckgo-search',
              arguments: '{"input":"first discovery of Mayan hieroglyphs date"}'
            }
          }
        ]
      },
      response_metadata: {
        tokenUsage: { promptTokens: 364, completionTokens: 349, totalTokens: 713 },
        finish_reason: 'tool_calls',
        model_name: 'openai/gpt-oss-120b',
        usage: {
          queue_time: 0.286018896,
          prompt_tokens: 364,
          prompt_time: 0.016209895,
          completion_tokens: 349,
          completion_time: 0.72330745,
          total_tokens: 713,
          total_time: 0.739517345,
          completion_tokens_details: { reasoning_tokens: 310 }
        },
        system_fingerprint: 'fp_854fa9be4c'
      },
      id: 'chatcmpl-afc02603-604b-4f3a-bf46-1550e0bb69e0',
      tool_calls: [
        {
          name: 'duckduckgo-search',
          args: { input: 'first discovery of Mayan hieroglyphs date' },
          type: 'tool_call',
          id: 'fc_3c936ddc-e954-43e8-ac3a-9262f749e109'
        }
      ],
      invalid_tool_calls: [],
      usage_metadata: {
        output_tokens: 349,
        input_tokens: 364,
        total_tokens: 713,
        input_token_details: { audio: undefined, cache_read: undefined },
        output_token_details: { audio: undefined, reasoning: 310 }
      }
    }
  }
}
{
  tools: {
    messages: [
      ToolMessage {
        lc_serializable: true,
        lc_kwargs: {
          status: 'success',
          content: 'Историческая справка: Первое подробное описание иероглифов майя европейцами (Диего де Ланда) произошло в 1566 году. Юрий Кнорозов успешно расшифровал письменность майя, опубликовав свою ключевую работу в 1952 году.',
          artifact: undefined,
          tool_call_id: 'fc_3c936ddc-e954-43e8-ac3a-9262f749e109',
          name: 'duckduckgo-search',
          metadata: {},
          additional_kwargs: {},
          response_metadata: {},
          id: '57d5598e-5d5c-4b30-8006-339f8f7e2387'
        },
        lc_namespace: [ 'langchain_core', 'messages' ],
        content: 'Историческая справка: Первое подробное описание иероглифов майя европейцами (Диего де Ланда) произошло в 1566 году. Юрий Кнорозов успешно расшифровал письменность майя, опубликовав свою ключевую работу в 1952 году.',
        name: 'duckduckgo-search',
        additional_kwargs: {},
        response_metadata: {},
        id: '57d5598e-5d5c-4b30-8006-339f8f7e2387',
        lc_direct_tool_output: true,
        status: 'success',
        tool_call_id: 'fc_3c936ddc-e954-43e8-ac3a-9262f749e109',
        metadata: {},
        artifact: undefined
      }
    ]
  }
}
Zod field at `#/definitions/calculator/properties/input` uses `.optional()` without `.nullable()` which is not supported by the API. See: https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses#all-fields-must-be-required
This will become an error in a future version of the SDK.
{
  model: {
    messages: AIMessage {
      lc_serializable: true,
      lc_kwargs: {
        content: '',
        name: undefined,
        additional_kwargs: {
          function_call: undefined,
          tool_calls: [
            {
              id: 'fc_6de49679-1b8b-439b-9097-ed4b7e35161f',
              type: 'function',
              function: {
                name: 'calculator',
                arguments: '{"input":"1952 - 1566"}'
              }
            }
          ]
        },
        response_metadata: {
          model_name: 'openai/gpt-oss-120b',
          usage: {
            queue_time: 0.287459383,
            prompt_tokens: 470,
            prompt_time: 0.019692767,
            completion_tokens: 75,
            completion_time: 0.157605681,
            total_tokens: 545,
            total_time: 0.177298448,
            completion_tokens_details: { reasoning_tokens: 47 }
          },
          system_fingerprint: 'fp_96d96a151c'
        },
        id: 'chatcmpl-f3a157aa-64a0-4384-a0f2-e3acad124d91',
        tool_calls: [
          {
            name: 'calculator',
            args: { input: '1952 - 1566' },
            type: 'tool_call',
            id: 'fc_6de49679-1b8b-439b-9097-ed4b7e35161f'
          }
        ],
        invalid_tool_calls: [],
        usage_metadata: {
          output_tokens: 75,
          input_tokens: 470,
          total_tokens: 545,
          input_token_details: { audio: undefined, cache_read: undefined },
          output_token_details: { audio: undefined, reasoning: 47 }
        }
      },
      lc_namespace: [ 'langchain_core', 'messages' ],
      content: '',
      name: undefined,
      additional_kwargs: {
        function_call: undefined,
        tool_calls: [
          {
            id: 'fc_6de49679-1b8b-439b-9097-ed4b7e35161f',
            type: 'function',
            function: {
              name: 'calculator',
              arguments: '{"input":"1952 - 1566"}'
            }
          }
        ]
      },
      response_metadata: {
        tokenUsage: { promptTokens: 470, completionTokens: 75, totalTokens: 545 },
        finish_reason: 'tool_calls',
        model_name: 'openai/gpt-oss-120b',
        usage: {
          queue_time: 0.287459383,
          prompt_tokens: 470,
          prompt_time: 0.019692767,
          completion_tokens: 75,
          completion_time: 0.157605681,
          total_tokens: 545,
          total_time: 0.177298448,
          completion_tokens_details: { reasoning_tokens: 47 }
        },
        system_fingerprint: 'fp_96d96a151c'
      },
      id: 'chatcmpl-f3a157aa-64a0-4384-a0f2-e3acad124d91',
      tool_calls: [
        {
          name: 'calculator',
          args: { input: '1952 - 1566' },
          type: 'tool_call',
          id: 'fc_6de49679-1b8b-439b-9097-ed4b7e35161f'
        }
      ],
      invalid_tool_calls: [],
      usage_metadata: {
        output_tokens: 75,
        input_tokens: 470,
        total_tokens: 545,
        input_token_details: { audio: undefined, cache_read: undefined },
        output_token_details: { audio: undefined, reasoning: 47 }
      }
    }
  }
}
{
  tools: {
    messages: [
      ToolMessage {
        lc_serializable: true,
        lc_kwargs: {
          status: 'success',
          content: '386',
          artifact: undefined,
          tool_call_id: 'fc_6de49679-1b8b-439b-9097-ed4b7e35161f',
          name: 'calculator',
          metadata: {},
          additional_kwargs: {},
          response_metadata: {},
          id: '9103cd94-8dc7-467c-a0d4-83f754a3f27f'
        },
        lc_namespace: [ 'langchain_core', 'messages' ],
        content: '386',
        name: 'calculator',
        additional_kwargs: {},
        response_metadata: {},
        id: '9103cd94-8dc7-467c-a0d4-83f754a3f27f',
        lc_direct_tool_output: true,
        status: 'success',
        tool_call_id: 'fc_6de49679-1b8b-439b-9097-ed4b7e35161f',
        metadata: {},
        artifact: undefined
      }
    ]
  }
}
Zod field at `#/definitions/calculator/properties/input` uses `.optional()` without `.nullable()` which is not supported by the API. See: https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses#all-fields-must-be-required
This will become an error in a future version of the SDK.
{
  model: {
    messages: AIMessage {
      lc_serializable: true,
      lc_kwargs: {
        content: 'Временной промежуток между первым описанием иероглифов майя (1566 г.) и их успешной расшифровкой Юрием Кнорозовым (1952 г.) составляет **386 лет**.',
        name: undefined,
        additional_kwargs: { function_call: undefined, tool_calls: undefined },
        response_metadata: {
          model_name: 'openai/gpt-oss-120b',
          usage: {
            queue_time: 0.370098931,
            prompt_tokens: 500,
            prompt_time: 0.019510595,
            completion_tokens: 55,
            completion_time: 0.114073972,
            total_tokens: 555,
            total_time: 0.133584567
          },
          system_fingerprint: 'fp_c868cf1eaa'
        },
        id: 'chatcmpl-ddd95f29-ab8c-4c57-b402-19ff39f5fa29',
        tool_calls: [],
        invalid_tool_calls: [],
        usage_metadata: {
          output_tokens: 55,
          input_tokens: 500,
          total_tokens: 555,
          input_token_details: { audio: undefined, cache_read: undefined },
          output_token_details: { audio: undefined, reasoning: undefined }
        }
      },
      lc_namespace: [ 'langchain_core', 'messages' ],
      content: 'Временной промежуток между первым описанием иероглифов майя (1566 г.) и их успешной расшифровкой Юрием Кнорозовым (1952 г.) составляет **386 лет**.',
      name: undefined,
      additional_kwargs: { function_call: undefined, tool_calls: undefined },
      response_metadata: {
        tokenUsage: { promptTokens: 500, completionTokens: 55, totalTokens: 555 },
        finish_reason: 'stop',
        model_name: 'openai/gpt-oss-120b',
        usage: {
          queue_time: 0.370098931,
          prompt_tokens: 500,
          prompt_time: 0.019510595,
          completion_tokens: 55,
          completion_time: 0.114073972,
          total_tokens: 555,
          total_time: 0.133584567
        },
        system_fingerprint: 'fp_c868cf1eaa'
      },
      id: 'chatcmpl-ddd95f29-ab8c-4c57-b402-19ff39f5fa29',
      tool_calls: [],
      invalid_tool_calls: [],
      usage_metadata: {
        output_tokens: 55,
        input_tokens: 500,
        total_tokens: 555,
        input_token_details: { audio: undefined, cache_read: undefined },
        output_token_details: { audio: undefined, reasoning: undefined }
      }
    }
  }
}
```

:warning: В данном коде выбор происходит из 2 инструментов.
