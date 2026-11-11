from langchain_openai.chat_models import ChatOpenAI

llm = ChatOpenAI(
    model="auto",
    temperature=0,
    base_url="https://vireonix.ai/v1",
    api_key="not-needed"
);

response = llm.invoke("Какого цвета облака?")
print(response.content)
