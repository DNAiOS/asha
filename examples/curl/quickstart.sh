#!/usr/bin/env sh
# The four calls a new integration makes. Needs: curl.
#   ASHA_API_KEY=dnai_a2a_... sh quickstart.sh
set -eu
BASE="https://api.askasha.org"

# 0. A free key (shown once): 250 queries a month, 50 a day, 20 per minute.
#    curl -X POST "$BASE/api/a2a/signup" -H "Content-Type: application/json" \
#      -d '{"email": "you@company.com", "name": "Your product", "product": "asha"}'

# 1. OpenAI wire format
curl -sS "$BASE/v1/chat/completions" \
  -H "Authorization: Bearer $ASHA_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "asha", "messages": [{"role": "user", "content": "Red flags for pediatric fever?"}]}'
echo

# 2. A2A v1.0: the full task, with a provenance artifact
curl -sS -X POST "$BASE/a2a/v1/message:send" \
  -H "Authorization: Bearer $ASHA_API_KEY" -H "Content-Type: application/json" \
  -d '{"agent_id": "asha",
       "message": {"role": "user", "parts": [{"text": "Which antihypertensives are safe in pregnancy?"}]},
       "metadata": {"audience": "clinician"}}'
echo

# 3. Streamed, as server-sent events
curl -sS -N -X POST "$BASE/a2a/v1/message:stream" \
  -H "Authorization: Bearer $ASHA_API_KEY" -H "Content-Type: application/json" \
  -d '{"agent_id": "asha", "message": {"role": "user", "parts": [{"text": "Red flags for pediatric fever?"}]}}'

# 4. Usage and limits for your key
curl -sS "$BASE/api/a2a/usage" -H "Authorization: Bearer $ASHA_API_KEY"
echo
