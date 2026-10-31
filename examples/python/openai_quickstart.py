"""Ask Asha through the OpenAI Python SDK.

pip install openai
export ASHA_API_KEY=dnai_a2a_...   # free key: https://askasha.org/developers
python openai_quickstart.py
"""
import os

from openai import OpenAI

client = OpenAI(base_url="https://api.askasha.org/v1", api_key=os.environ["ASHA_API_KEY"])

completion = client.chat.completions.create(
    model="asha",
    messages=[{"role": "user", "content": "Which antihypertensives are safe in pregnancy?"}],
    metadata={"audience": "clinician"},
)

print(completion.choices[0].message.content)

meta = completion.model_extra["dnai_meta"]
print(f"\n{meta['evidence_count']} sources, depth served: {meta['depth_served']}")
for citation in meta.get("citations", [])[:5]:
    print(" -", citation)
