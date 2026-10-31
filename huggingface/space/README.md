---
title: Asha API
emoji: 🩺
colorFrom: green
colorTo: gray
sdk: gradio
sdk_version: 5.50.0
app_file: app.py
pinned: true
license: apache-2.0
short_description: Medical answers with sources. OpenAI-compatible API.
tags:
  - medical
  - healthcare
  - clinical
  - openai-compatible
  - a2a
  - mcp
  - rag
---

# Asha API terminal

Ask Asha, the medical AI agent from [DNAi Systems](https://dnai.systems), with your own key. The Space calls `https://api.askasha.org/v1/chat/completions` (OpenAI wire format) and lists the sources after each answer.

- Free key: [askasha.org/developers](https://askasha.org/developers/) (250 queries a month, 50 a day)
- Code, examples and specs: [github.com/DNAiOS/asha](https://github.com/DNAiOS/asha)
- Model card: [DNAi-Systems/asha](https://huggingface.co/DNAi-Systems/asha)

Your key is sent from this Space's server to the API with each message and is not stored. Send de-identified questions only.
