# Аrентная архитектура

```shell
$ node ./a-basic-agent.js 
Zod field at `#/definitions/duckduckgo-search/properties/input` uses `.optional()` without `.nullable()` which is not supported by the API. See: https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses#all-fields-must-be-required
This will become an error in a future version of the SDK.
Zod field at `#/definitions/calculator/properties/input` uses `.optional()` without `.nullable()` which is not supported by the API. See: https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses#all-fields-must-be-required
This will become an error in a future version of the SDK.
{
  model: {
    messages: AIMessage {
      "id": "0740b67a546bc9a699c5cef7d6ce40de",
      "content": "**13 лет.**\n\nСын Николая II — цесаревич Алексей Николаевич — родился 30 августа 1904 года (12 августа по старому стилю). В ночь на 17 июля 1918 года семья была расстреляна в подвале Ипатьевского дома в Екатеринбурге. На тот момент Алексею было 13 лет (до 14-летия оставалось около 11 месяцев).\n\nВместе с ним погибли и остальные дети царской семьи: три дочери — Ольга (1895), Татьяна (1897) и Анастасия (1901), а также мать — Александра Фёдоровна, няньки и несколько приближённых. Единственным выжившим членом семьи оказалась великая княгиня Анастасия... точнее, фигурант этого дела — **Анастасия**, чья личность (Анастасия Романова) была установлена лишь в 1990-х годах.",
      "additional_kwargs": {},
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 585,
          "completionTokens": 738,
          "totalTokens": 1323
        },
        "finish_reason": "stop",
        "model_name": "auto"
      },
      "tool_calls": [],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 738,
        "input_tokens": 585,
        "total_tokens": 1323,
        "input_token_details": {
          "cache_read": 184
        },
        "output_token_details": {
          "reasoning": 503
        }
      }
    }
  }
}

```
