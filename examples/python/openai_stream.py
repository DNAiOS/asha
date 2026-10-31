"""Stream an Asha answer token by token with the OpenAI Python SDK.

pip install openai
export ASHA_API_KEY=dnai_a2a_...
python openai_stream.py
"""
import os

from openai import OpenAI

client = OpenAI(base_url="https://api.askasha.org/v1", api_key=os.environ["ASHA_API_KEY"])

stream = client.chat.completions.create(
    model="asha",
    stream=True,
    messages=[{"role": "user", "content": "Red flags for a fever in a 2-year-old?"}],
    metadata={"audience": "caregiver", "verbosity": "brief"},
)

for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()
