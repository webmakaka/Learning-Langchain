# 02. Генерация с дополнением поиском, часть I: индексация ваших данных

```shell
$ docker run \
    --name pgvector-container \
    -e POSTGRES_USER=langchain \
    -e POSTGRES_PASSWORD=langchain \
    -e POSTGRES_DB=langchain \
    -p 6024:5432 \
    -d pgvector/pgvector:pg16
```

<br/>

### Работа с векторными хранилищами


```shell
$ node ./i-pg-vector.js 
Vector store created successfully
Similarity search results: [{"pageContent":"VII.","metadata":{"loc":{"lines":{"to":13958,"from":13958}},"source":"./test.txt"},"id":"9003c79e-088f-4aec-8da4-4c001d43a12e"},{"pageContent":"VII.","metadata":{"loc":{"lines":{"to":10951,"from":10951}},"source":"./test.txt"},"id":"3b455001-3941-4b5d-99ec-789013486843"},{"pageContent":"VII.","metadata":{"loc":{"lines":{"to":4093,"from":4093}},"source":"./test.txt"},"id":"5e25dd9b-2b84-47c7-a3e9-cf9069b37266"},{"pageContent":"II.","metadata":{"loc":{"lines":{"to":1099,"from":1099}},"source":"./test.txt"},"id":"1b3d42fe-9def-46bf-b793-34e2ff16d982"}]
Adding documents to the vector store
Documents added successfully
second document deleted successfully
```

<br/>

### Отслеживание изменений в документах

```shell
$ node ./j-record-manager.js 
The default method for hashing keys is insecure and will be replaced in a future version,
but hasn't been replaced yet as to not break existing caches. It's recommended that you use
a more secure hashing algorithm to avoid cache poisoning.

See this page for more information:
|
└> https://js.langchain.com/docs/troubleshooting/warnings/insecure-cache-algorithm
{ numAdded: 2, numDeleted: 2, numUpdated: 0, numSkipped: 0 }
{ numAdded: 0, numDeleted: 0, numUpdated: 0, numSkipped: 2 }
{ numAdded: 1, numDeleted: 1, numUpdated: 0, numSkipped: 1 }
```


<br/>

## Оптимизация индексации

### [FAIL!] МultiVectorRetriever

Не отрабатывает с бесплатными моделями. А платных у меня нет.

```shell
$ node ./k-multi-vector-retriever.js 
file:///home/marley/tmp/Learning-Langchain/02.%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D1%81%20%D0%B4%D0%BE%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC%20%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%BE%D0%BC,%20%D1%87%D0%B0%D1%81%D1%82%D1%8C%20I:%20%D0%B8%D0%BD%D0%B4%D0%B5%D0%BA%D1%81%D0%B0%D1%86%D0%B8%D1%8F%20%D0%B2%D0%B0%D1%88%D0%B8%D1%85%20%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85/js/node_modules/openai/error.mjs:62
            return new InternalServerError(status, error, message, headers);
                   ^

InternalServerError: 502 Vireonix is temporarily unavailable.
```

<br/>

```shell
$ node ./k-multi-vector-retriever.js
file:///home/marley/tmp/Learning-Langchain/02.%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D1%81%20%D0%B4%D0%BE%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC%20%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%BE%D0%BC,%20%D1%87%D0%B0%D1%81%D1%82%D1%8C%20I:%20%D0%B8%D0%BD%D0%B4%D0%B5%D0%BA%D1%81%D0%B0%D1%86%D0%B8%D1%8F%20%D0%B2%D0%B0%D1%88%D0%B8%D1%85%20%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85/js/node_modules/openai/error.mjs:59
            return new RateLimitError(status, error, message, headers);
                   ^

RateLimitError: 429 Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day

Troubleshooting URL: https://js.langchain.com/docs/troubleshooting/errors/MODEL_RATE_LIMIT/

    at APIError.generate (file:///home/marley/tmp/Learning-Langchain/02.%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D1%81%20%D0%B4%D0%BE%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC%20%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%BE%D0%BC,%20%D1%87%D0%B0%D1%81%D1%82%D1%8C%20I:%20%D0%B8%D0%BD%D0%B4%D0%B5%D0%BA%D1%81%D0%B0%D1%86%D0%B8%D1%8F%20%D0%B2%D0%B0%D1%88%D0%B8%D1%85%20%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85/js/node_modules/openai/error.mjs:59:20)
    at OpenAI.makeStatusError (file:///home/marley/tmp/Learning-Langchain/02.%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D1%81%20%D0%B4%D0%BE%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC%20%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%BE%D0%BC,%20%D1%87%D0%B0%D1%81%D1%82%D1%8C%20I:%20%D0%B8%D0%BD%D0%B4%D0%B5%D0%BA%D1%81%D0%B0%D1%86%D0%B8%D1%8F%20%D0%B2%D0%B0%D1%88%D0%B8%D1%85%20%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85/js/node_modules/openai/core.mjs:295:25)
    at OpenAI.makeRequest (file:///home/marley/tmp/Learning-Langchain/02.%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D1%81%20%D0%B4%D0%BE%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC%20%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%BE%D0%BC,%20%D1%87%D0%B0%D1%81%D1%82%D1%8C%20I:%20%D0%B8%D0%BD%D0%B4%D0%B5%D0%BA%D1%81%D0%B0%D1%86%D0%B8%D1%8F%20%D0%B2%D0%B0%D1%88%D0%B8%D1%85%20%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85/js/node_modules/openai/core.mjs:339:30)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async file:///home/marley/tmp/Learning-Langchain/02.%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D1%81%20%D0%B4%D0%BE%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC%20%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%BE%D0%BC,%20%D1%87%D0%B0%D1%81%D1%82%D1%8C%20I:%20%D0%B8%D0%BD%D0%B4%D0%B5%D0%BA%D1%81%D0%B0%D1%86%D0%B8%D1%8F%20%D0%B2%D0%B0%D1%88%D0%B8%D1%85%20%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85/js/node_modules/@langchain/openai/dist/embeddings.js:268:29
    at async RetryOperation._fn (/home/marley/tmp/Learning-Langchain/02. Генерация с дополнением поиском, часть I: индексация ваших данных/js/node_modules/p-retry/index.js:50:12) {
  status: 429,
  headers: Proxy({
    'access-control-allow-origin': '*',
    'access-control-expose-headers': 'X-Generation-Id,x-openrouter-error-origin,x-openrouter-error-tool,X-Provider-Name,request-id,cf-ray',
    'alt-svc': 'h3=":443"; ma=86400',
    'cf-ray': 'a560b2d63b99f90a-SIN',
    connection: 'keep-alive',
    'content-type': 'application/json',
    date: 'Fri, 06 Nov 2026 02:34:21 GMT',
    'permissions-policy': 'payment=(self "https://checkout.stripe.com" "https://connect-js.stripe.com" "https://js.stripe.com" "https://*.js.stripe.com" "https://hooks.stripe.com")',
    'referrer-policy': 'no-referrer, strict-origin-when-cross-origin',
    server: 'cloudflare',
    'set-cookie': '__cf_bm=ZaPevt7Iq3U00oIGf_yEd6G3Ql3chrz4vmH3mxeTW94-1793932460.5126739-1.0.1.1-XRo95y_R39au_.N4It2JFZHUsNw5MnNdvgcPSH6iOdKsoaidvT75rS31R7AM4H4N4WkDMt2baGhhMGUrccs4MvuMY4bddkzjbSPX3aegdwhaTxRzJTOEohRK9ZmDV7Wc; HttpOnly; SameSite=None; Secure; Path=/; Domain=openrouter.ai; Expires=Fri, 06 Nov 2026 03:04:21 GMT',
    'transfer-encoding': 'chunked',
    'x-content-type-options': 'nosniff',
    'x-openrouter-error-origin': 'client',
    'x-ratelimit-limit': '50',
    'x-ratelimit-remaining': '0',
    'x-ratelimit-reset': '1794009600000'
  }),
  request_id: undefined,
  error: {
    message: 'Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day',
    code: 429,
    metadata: {
      headers: {
        'X-RateLimit-Limit': '50',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '1794009600000'
      },
      limit_source: 'openrouter_free_tier_daily',
      remedy_hint: 'Wait for the daily reset (see X-RateLimit-Reset), or purchase credits to raise your free-model daily limit.'
    }
  },
  code: 429,
  param: undefined,
  type: undefined,
  lc_error_code: 'MODEL_RATE_LIMIT',
  attemptNumber: 7,
  retriesLeft: 0
}

Node.js v26.13.0
```
