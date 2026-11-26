"""Clinical subagent that returns JSON Schema output.

An orchestrating agent hands Asha a structured task and gets back JSON that
matches the schema (validated server-side, one repair pass, else 422
`schema_unsatisfied` with the raw text). References still arrive in the `asha`
object, so the orchestrator can cite them. The case is synthetic.

Run: ASHA_API_KEY=... python cookbook/03_clinical_subagent_json.py
"""

import json

from askasha import Asha, UnprocessableEntityError

SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["summary", "differential", "red_flags", "escalate_now"],
    "properties": {
        "summary": {"type": "string"},
        "differential": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["diagnosis", "likelihood", "key_findings", "next_step"],
                "properties": {
                    "diagnosis": {"type": "string"},
                    "likelihood": {"type": "string", "enum": ["high", "moderate", "low"]},
                    "key_findings": {"type": "array", "items": {"type": "string"}},
                    "next_step": {"type": "string"},
                },
            },
        },
        "red_flags": {"type": "array", "items": {"type": "string"}},
        "escalate_now": {"type": "boolean"},
    },
}

TASK = (
    "Synthetic case for a triage subagent. 34-year-old, 3 days of fever to 38.6 C, dysuria, right flank pain, "
    "one episode of vomiting. No pregnancy. Heart rate 104, BP 118/76. Return the differential."
)


def main() -> int:
    client = Asha()
    try:
        answer = client.chat.create(
            model="asha-base",
            messages=[{"role": "user", "content": TASK}],
            metadata={"audience": "clinician", "memory": "off"},
            response_format={"type": "json_schema", "json_schema": {"name": "triage_ddx", "schema": SCHEMA, "strict": True}},
        )
    except UnprocessableEntityError as e:
        print(f"Schema not met after repair ({e.code}); raw text is in e.body. request_id={e.request_id}")
        return 1
    data = answer.json()
    missing = [k for k in SCHEMA["required"] if k not in data]
    print(json.dumps(data, indent=2))
    refs = answer.asha.references if answer.asha else []
    print(f"\n{len(data.get('differential', []))} diagnoses, escalate_now={data.get('escalate_now')}, "
          f"{len(refs)} references, receipt={answer.receipt_id}")
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
