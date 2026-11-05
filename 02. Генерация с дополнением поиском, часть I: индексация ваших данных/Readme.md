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

```shell
$ node ./i-pg-vector.js 
Vector store created successfully
Similarity search results: [{"pageContent":"VII.","metadata":{"loc":{"lines":{"to":13958,"from":13958}},"source":"./test.txt"},"id":"9003c79e-088f-4aec-8da4-4c001d43a12e"},{"pageContent":"VII.","metadata":{"loc":{"lines":{"to":10951,"from":10951}},"source":"./test.txt"},"id":"3b455001-3941-4b5d-99ec-789013486843"},{"pageContent":"VII.","metadata":{"loc":{"lines":{"to":4093,"from":4093}},"source":"./test.txt"},"id":"5e25dd9b-2b84-47c7-a3e9-cf9069b37266"},{"pageContent":"II.","metadata":{"loc":{"lines":{"to":1099,"from":1099}},"source":"./test.txt"},"id":"1b3d42fe-9def-46bf-b793-34e2ff16d982"}]
Adding documents to the vector store
Documents added successfully
second document deleted successfully
```
