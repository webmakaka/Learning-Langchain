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

### [FAIL!] МultiVectorRetriever

Не отрабатывает с бесплатными моделями. А платных у меня нет.

```shell
$ node ./k-multi-vector-retriever.js 
file:///home/marley/tmp/Learning-Langchain/02.%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D1%81%20%D0%B4%D0%BE%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC%20%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%BE%D0%BC,%20%D1%87%D0%B0%D1%81%D1%82%D1%8C%20I:%20%D0%B8%D0%BD%D0%B4%D0%B5%D0%BA%D1%81%D0%B0%D1%86%D0%B8%D1%8F%20%D0%B2%D0%B0%D1%88%D0%B8%D1%85%20%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85/js/node_modules/openai/error.mjs:62
            return new InternalServerError(status, error, message, headers);
                   ^

InternalServerError: 502 Vireonix is temporarily unavailable.
```
