"""Use Asha as a LangChain chat model.

pip install langchain-openai
export ASHA_API_KEY=dnai_a2a_...
python asha_langchain.py
"""
import os

from langchain_openai import ChatOpenAI

asha = ChatOpenAI(
    model="asha",
    base_url="https://api.askasha.org/v1",
    api_key=os.environ["ASHA_API_KEY"],
    timeout=120,
)

reply = asha.invoke("Does ibuprofen interact with lisinopril? Answer for a pharmacist.")
print(reply.content)
