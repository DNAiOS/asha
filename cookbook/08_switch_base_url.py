"""Switch from OpenAI or Anthropic by changing base_url.

No Asha package needed: the official SDKs work as they are. Change the base
URL and the key; the `asha` object rides along as an extra field.

Run: pip install openai anthropic && ASHA_API_KEY=... python cookbook/08_switch_base_url.py
"""

import os

from anthropic import Anthropic
from openai import OpenAI

KEY = os.environ["ASHA_API_KEY"]
QUESTION = "What are the first-line treatments for uncomplicated urinary tract infection in non-pregnant adults?"


def main() -> int:
    # OpenAI SDK: was OpenAI(api_key=...)
    oai = OpenAI(base_url="https://api.askasha.org/v1", api_key=KEY)
    c = oai.chat.completions.create(
        model="asha-base",
        messages=[{"role": "user", "content": QUESTION}],
        extra_body={"metadata": {"verbosity": "brief", "memory": "off"}},
    )
    asha = c.model_extra["asha"]
    print("OpenAI wire:", c.choices[0].message.content[:300], "...")
    print("  references:", [r["display"] for r in asha["references"]][:3], "receipt:", asha["receipt_id"])

    # Anthropic SDK: was Anthropic(api_key=...)
    ant = Anthropic(base_url="https://api.askasha.org", api_key=KEY)
    m = ant.messages.create(
        model="asha-base",
        max_tokens=1024,
        messages=[{"role": "user", "content": QUESTION}],
        extra_body={"metadata": {"verbosity": "brief", "memory": "off"}},
    )
    text = "".join(b.text for b in m.content if b.type == "text")
    cites = [ci.title for b in m.content if b.type == "text" for ci in (b.citations or [])]
    print("Anthropic wire:", text[:300], "...")
    print("  citations:", cites[:3], "receipt:", m.model_extra["asha"]["receipt_id"])
    return 0 if asha["references"] and text else 1


if __name__ == "__main__":
    raise SystemExit(main())
