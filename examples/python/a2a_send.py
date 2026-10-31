"""Ask Asha over A2A v1.0 and read the provenance artifact.

pip install requests
export ASHA_API_KEY=dnai_a2a_...
python a2a_send.py
"""
import os
import uuid

import requests

r = requests.post(
    "https://api.askasha.org/a2a/v1/message:send",
    headers={
        "Authorization": f"Bearer {os.environ['ASHA_API_KEY']}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={
        "agent_id": "asha",
        "message": {"role": "user", "parts": [{"text": "Which antihypertensives are safe in pregnancy?"}]},
        "metadata": {"audience": "clinician", "session_id": "visit-2041"},
    },
    timeout=120,
)
r.raise_for_status()
task = r.json()["task"]

answer = task["artifacts"][0]["parts"][0]["text"]
provenance = task["artifacts"][1]["parts"][0]["data"]

print(answer)
print(f"\n{provenance['evidence_count']} sources, depth served: {task['metadata']['depth_served']}")
print("collections searched:", ", ".join(provenance.get("sources", [])))
for citation in provenance.get("citations", [])[:5]:
    print(" -", citation)
