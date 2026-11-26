"""EHR summary for a downstream agent.

Turns a synthetic, de-identified visit note into a typed summary (JSON Schema),
then runs the extracted medication list through the deterministic med-check.
The result is one handoff object a downstream agent can act on, with the
receipt id for audit. PHI mode is closed: send de-identified data only.

Run: ASHA_API_KEY=... python cookbook/04_ehr_summary_for_agent.py
"""

import json

from askasha import Asha

NOTE = """SYNTHETIC NOTE (de-identified).
CC: follow-up, atrial fibrillation and new cough.
HPI: 72-year-old on warfarin for AF (last INR 2.6), started clarithromycin 3 days ago at urgent care for bronchitis.
Also takes metoprolol succinate 50 mg daily, atorvastatin 40 mg nightly, and omeprazole 20 mg daily.
Allergies: penicillin (hives). Labs: creatinine 1.3, eGFR 55. Plan pending: INR recheck."""

SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["problems", "medications", "allergies", "recent_results", "open_questions"],
    "properties": {
        "problems": {"type": "array", "items": {"type": "object", "additionalProperties": False,
                                                "required": ["name", "status"],
                                                "properties": {"name": {"type": "string"}, "status": {"type": "string"}}}},
        "medications": {"type": "array", "items": {"type": "object", "additionalProperties": False,
                                                   "required": ["name", "dose", "frequency"],
                                                   "properties": {"name": {"type": "string"}, "dose": {"type": "string"},
                                                                  "frequency": {"type": "string"}}}},
        "allergies": {"type": "array", "items": {"type": "string"}},
        "recent_results": {"type": "array", "items": {"type": "string"}},
        "open_questions": {"type": "array", "items": {"type": "string"}},
    },
}


def main() -> int:
    client = Asha()
    summary = client.chat.create(
        model="asha-base",
        instructions="Summarize the note for a downstream software agent. Extract only what the note states.",
        messages=[{"role": "user", "content": NOTE}],
        metadata={"audience": "clinician", "memory": "off"},
        response_format={"type": "json_schema", "json_schema": {"name": "ehr_summary", "schema": SCHEMA, "strict": True}},
    )
    data = summary.json()
    meds = [{"name": m["name"], "dose": m.get("dose") or None} for m in data.get("medications", [])]
    check = client.clinical.med_check(
        [{k: v for k, v in m.items() if v} for m in meds],
        age=72, egfr=55, allergies=data.get("allergies") or None, audience="clinician",
    ) if meds else None

    handoff = {
        "summary": data,
        "medication_check": None if check is None else {
            "findings_text": check.findings_text,
            "findings": [{"severity": f.severity, "title": f.title, "medications": f.medications, "source": f.source}
                         for f in check.alerts if f.kind != "insufficient_data"],
            "not_checked": [u.check or u.name for u in check.unchecked],
            "rule_table_version": check.rule_table_version,
        },
        "audit": {"receipt_id": summary.receipt_id, "request_id": summary.meta.request_id},
    }
    print(json.dumps(handoff, indent=2))
    return 0 if data.get("medications") else 1


if __name__ == "__main__":
    raise SystemExit(main())
