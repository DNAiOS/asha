"""Clinician assistant with an Assessment and Plan template.

Developer `instructions` carry the template; they apply as caller context below
Asha's safety layer. The case is synthetic and de-identified. The output is a
draft for a clinician to review (`asha.safety.requires_clinician_review`).

Run: ASHA_API_KEY=... python cookbook/02_clinician_ap_template.py
"""

from askasha import Asha

TEMPLATE = """Write only the Assessment and Plan, in this format:

Assessment: one paragraph naming the working problems and their status.

Plan, by problem:
# <Problem>
- Diagnostics:
- Treatment:
- Monitoring:
- Patient education:

Cite each recommendation with [n]. Mark anything that needs data not in the note as "needs: <data>"."""

CASE = (
    "Synthetic, de-identified case. 58-year-old with type 2 diabetes, last A1c 8.9%, on metformin 1000 mg twice daily. "
    "Hypertension, office BP 148/92 on lisinopril 20 mg daily. eGFR 52 mL/min/1.73m2, urine albumin-to-creatinine "
    "ratio 110 mg/g. BMI 33. No history of heart failure or cardiovascular events. Draft the A&P."
)


def main() -> int:
    client = Asha()
    answer = client.chat.create(
        model="asha-base",
        instructions=TEMPLATE,
        messages=[{"role": "user", "content": CASE}],
        metadata={"audience": "clinician", "memory": "off"},
    )
    if answer.asha is None:
        print("FAIL: no asha object")
        return 1
    print(answer.text)
    print("\nReferences:")
    for ref in answer.asha.references:
        loc = ref.locator.pmid if ref.locator and ref.locator.pmid else ref.url or ""
        print(f"  {ref.marker} [{ref.type}] {ref.display} {loc}".rstrip())
    safety = answer.asha.safety
    print(f"\nrequires_clinician_review={safety.requires_clinician_review if safety else None} "
          f"audience_served={safety.audience_served if safety else None} "
          f"missing_data={answer.asha.basis.missing_data if answer.asha.basis else []}")
    return 0 if "Plan" in answer.text or "plan" in answer.text else 1


if __name__ == "__main__":
    raise SystemExit(main())
