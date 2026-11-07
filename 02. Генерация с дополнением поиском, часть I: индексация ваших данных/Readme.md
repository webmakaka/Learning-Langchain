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

### :white_check_mark: Работа с векторными хранилищами


```shell
$ node ./i-pg-vector.js 
Vector store created successfully
Similarity search results: [{"pageContent":"VII.","metadata":{"loc":{"lines":{"to":13958,"from":13958}},"source":"./test.txt"},"id":"9003c79e-088f-4aec-8da4-4c001d43a12e"},{"pageContent":"VII.","metadata":{"loc":{"lines":{"to":10951,"from":10951}},"source":"./test.txt"},"id":"3b455001-3941-4b5d-99ec-789013486843"},{"pageContent":"VII.","metadata":{"loc":{"lines":{"to":4093,"from":4093}},"source":"./test.txt"},"id":"5e25dd9b-2b84-47c7-a3e9-cf9069b37266"},{"pageContent":"II.","metadata":{"loc":{"lines":{"to":1099,"from":1099}},"source":"./test.txt"},"id":"1b3d42fe-9def-46bf-b793-34e2ff16d982"}]
Adding documents to the vector store
Documents added successfully
second document deleted successfully
```

<br/>

### :white_check_mark: Отслеживание изменений в документах

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

## :white_check_mark: Оптимизация индексации

### МultiVectorRetriever

<br/>

:warning: **Сильно урезал текстовый файл на русском (test.rus.txt). Иначе на бесплатных тарифах оч. быстро лимиты oenrouter тратились (50/50) и много токенов grok (~200k) тратилось.**

```shell
$ node ./k-multi-vector-retriever.js 
summary: **Краткое содержание главы 1 «Жизнь в Древней Греции»**

- **Полис как основа общества**  
  - Город‑государство (полис) был главной политической и социальной единицей.  
  - Каждый полис имел собственные законы, форму правления и традиции, что укрепляло чувство общности и гражданскую ответственность.

- **Главные полисы**  
  - **Афины** – центр демократии; граждане‑мужчины напрямую участвовали в собраниях, обсуждали законы, войны и другие важные вопросы.  
  - **Спарта** – милитаристическое государство; двойная монархия и совет старейшин, строгая военная подготовка (агоге) с детства.

- **Социальная структура и повседневная жизнь**  
  - Общество делилось на свободных граждан, метеков (иностранцев‑жителей) и рабов.  
  - Образование, религиозные практики, экономика (земледелие, ремёсла, торговля) и культура (искусство, архитектура) тесно переплетались с политическим устройством полиса.

- **Культурное наследие**  
  - Интеллектуальные поиски, художественные инновации и архитектурные достижения Древней Греции стали фундаментом западной цивилизации.

Таким образом, жизнь в Древней Греции представляла собой сложную ткань, где полис формировал политический порядок, а разнообразные модели управления (демократия в Афинах и милитаризм в Спарте) определяли социальную структуру, образование, экономику и культурный вклад цивилизации.
summary retrieved length: 1347
multi-vector retrieved chunk length: 2107
```
