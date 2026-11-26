"""Patient-facing assistant with escalation.

Asks in the patient register, puts any escalation message above the answer,
shows the sources, and always ends with when-to-seek-care guidance. The case is
synthetic.

Run: ASHA_API_KEY=... python cookbook/01_patient_assistant.py
"""

from askasha import Asha

QUESTION = (
    "My father is 68. Twenty minutes ago one side of his face started drooping and his speech is slurred. "
    "What should we do?"
)

WHEN_TO_SEEK_CARE = (
    "When to seek care: call your local emergency number now for chest pain, trouble breathing, face drooping, "
    "arm weakness, slurred speech, severe bleeding, fainting, or thoughts of harming yourself. Contact your "
    "clinician the same day if symptoms are new, getting worse, or not improving."
)


def main() -> int:
    client = Asha()
    answer = client.chat.create(
        model="asha-base",
        messages=[{"role": "user", "content": QUESTION}],
        metadata={"audience": "patient", "verbosity": "brief", "memory": "off"},
    )
    asha = answer.asha
    if asha is None or asha.safety is None:
        print("FAIL: response carried no asha.safety object")
        return 1

    safety = asha.safety
    if safety.needs_escalation and safety.escalation:
        print("=" * 72)
        print("URGENT:", safety.escalation.message or "Get emergency help now.")
        if safety.escalation.action:
            print("Do this:", safety.escalation.action, safety.escalation.timeframe or "")
        print("=" * 72)

    print(answer.text)
    if asha.references:
        print("\nSources:")
        for ref in asha.references:
            print(f"  {ref.marker} {ref.display}")
    print("\n" + WHEN_TO_SEEK_CARE)
    print(f"\nescalation={safety.escalation.level if safety.escalation else None} "
          f"emergency={safety.emergency} audience_served={safety.audience_served} receipt={answer.receipt_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
