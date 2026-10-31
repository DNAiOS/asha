"""Call Asha through LiteLLM (also works behind a LiteLLM proxy).

pip install litellm
export ASHA_API_KEY=dnai_a2a_...
python asha_litellm.py

LiteLLM proxy config.yaml:
  model_list:
    - model_name: asha
      litellm_params:
        model: openai/asha
        api_base: https://api.askasha.org/v1
        api_key: os.environ/ASHA_API_KEY
"""
import os

from litellm import completion

response = completion(
    model="openai/asha",
    api_base="https://api.askasha.org/v1",
    api_key=os.environ["ASHA_API_KEY"],
    messages=[{"role": "user", "content": "First-line outpatient treatment for community-acquired pneumonia?"}],
    timeout=120,
)
print(response.choices[0].message.content)
