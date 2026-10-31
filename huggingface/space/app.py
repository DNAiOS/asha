"""Asha API terminal on Hugging Face Spaces.

Bring your own key (free at askasha.org/developers). The key is sent from
this Space's server to api.askasha.org for each message and is never stored
or logged here.
"""
from __future__ import annotations

import gradio as gr
from openai import APIError, AuthenticationError, OpenAI, RateLimitError

API_BASE = "https://api.askasha.org/v1"
SIGNUP = "https://askasha.org/developers/"

EXAMPLES = [
    "Which antihypertensives are safe in pregnancy?",
    "Does ibuprofen interact with lisinopril?",
    "My mother has dementia and has stopped eating much. What should I watch for?",
    "First-line outpatient treatment for community-acquired pneumonia in an adult with no comorbidities?",
    "Help me prepare questions for my follow-up after a knee replacement.",
]


def _sources_block(meta: dict) -> str:
    cites = meta.get("citations") or []
    lines = [f"\n\n---\n**{meta.get('evidence_count', len(cites))} sources** · depth served: `{meta.get('depth_served', 'base')}`"]
    for c in cites[:8]:
        c = str(c)
        if c.upper().startswith("PMID:"):
            pmid = c.split(":", 1)[1].strip()
            lines.append(f"- [PMID {pmid}](https://pubmed.ncbi.nlm.nih.gov/{pmid}/)")
        else:
            lines.append(f"- {c}")
    return "\n".join(lines)


def ask(message: str, history: list[dict], api_key: str, audience: str, verbosity: str):
    api_key = (api_key or "").strip()
    if not api_key.startswith("dnai_a2a_"):
        yield f"Paste an Asha API key (it starts with `dnai_a2a_`). A free key takes one minute: {SIGNUP}"
        return

    client = OpenAI(base_url=API_BASE, api_key=api_key, timeout=180)
    messages = [{"role": m["role"], "content": m["content"]} for m in history if m.get("role") in ("user", "assistant")]
    messages.append({"role": "user", "content": message})
    metadata = {"verbosity": verbosity, "memory": "off"}
    if audience != "auto":
        metadata["audience"] = audience

    text, meta = "", {}
    try:
        stream = client.chat.completions.create(model="asha", messages=messages, stream=True, metadata=metadata)
        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                text += chunk.choices[0].delta.content
                yield text
            extra = getattr(chunk, "model_extra", None) or {}
            if extra.get("dnai_meta"):
                meta = extra["dnai_meta"]
    except AuthenticationError:
        yield f"That key was not accepted. Check it, or create a new one at {SIGNUP}"
        return
    except RateLimitError as e:
        yield f"Limit reached for this key: {e.message}"
        return
    except APIError as e:
        yield (text + "\n\n" if text else "") + f"The API returned an error: {e.message}"
        return

    yield text + (_sources_block(meta) if meta else "")


with gr.Blocks(title="Asha API", theme=gr.themes.Soft(primary_hue="teal")) as demo:
    gr.Markdown(
        "# Asha API\n"
        "Medical answers with their sources, from the same API your product would call "
        "(`https://api.askasha.org/v1`, OpenAI-compatible). "
        f"[Get a free key]({SIGNUP}) · [Docs](https://askasha.org/developers/docs/overview) · "
        "[GitHub](https://github.com/DNAiOS/asha) · [Benchmarks](https://dnai.systems/benchmarks)\n\n"
        "Send de-identified questions only. Answers are information; a licensed clinician decides. "
        "In an emergency, call your local emergency number."
    )
    with gr.Row():
        key = gr.Textbox(label="Asha API key", type="password", placeholder="dnai_a2a_...", scale=3)
        audience = gr.Dropdown(["auto", "patient", "caregiver", "clinician", "nurse", "pharmacist", "physician"],
                               value="auto", label="Audience", scale=1)
        verbosity = gr.Dropdown(["brief", "standard", "detailed"], value="standard", label="Length", scale=1)
    gr.ChatInterface(
        fn=ask,
        type="messages",
        additional_inputs=[key, audience, verbosity],
        examples=[[q] for q in EXAMPLES],
        cache_examples=False,
    )
    gr.Markdown(
        "Your key goes from this Space's server to api.askasha.org with each message and is not stored here. "
        "Each message uses one query from your plan. Calls run with `memory: off`."
    )

if __name__ == "__main__":
    demo.launch()
