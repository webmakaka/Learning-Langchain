from langchain_openai.chat_models import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(
    model="auto",
    temperature=0,
    base_url="https://vireonix.ai/v1",
    api_key="not-needed"
);
prompt = [HumanMessage("Какой город является столицей Франции?")]

response = llm.invoke(prompt)
print(response.content)
