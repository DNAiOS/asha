"""Check claims before you show them.

Your product drafts statements (with any model). Before display, each one goes
through `/v1/verify`, which tries to refute it against the committed corpus.
Only claims the corpus supports are shown; everything else is held for review
with the reason. A supported verdict means the passages found did not refute
the claim, which is weaker than true, so the caveat travels with it.

Run: ASHA_API_KEY=... python cookbook/05_verify_before_show.py
"""

from askasha import Asha

DRAFT_CLAIMS = [
    "Metformin is first-line therapy for most adults with type 2 diabetes.",
    "Antibiotics shorten the course of uncomplicated viral upper respiratory infections.",
]

LABELS = {
    "supported": "shown (corpus passages support it; not refuted)",
    "contradicted": "held for review: corpus passages contradict it",
    "mixed": "held for review: passages point both ways",
    "insufficient_evidence": "held for review: not enough evidence in the corpus to check it",
}


def main() -> int:
    client = Asha()
    shown, held = [], []
    for claim in DRAFT_CLAIMS:
        v = client.verify(claim, top_k=10)
        (shown if v.verdict == "supported" else held).append(v)
        print(f"- {claim}\n  verdict={v.verdict}: {LABELS.get(v.verdict, v.verdict)}")
        if v.scope:
            print(f"  scope: {v.scope}")
        for e in (v.evidence_for if v.verdict == "supported" else v.evidence_against)[:2]:
            pmid = e.locator.pmid if e.locator and e.locator.pmid else None
            label = e.title or (e.snippet or "")[:120] or e.collection
            print(f"  [{e.stance}] {label}" + (f" (PMID {pmid})" if pmid else ""))
        if v.retracted_related:
            print(f"  {len(v.retracted_related)} retracted item(s) near the topic (listed, did not decide the verdict)")

    print(f"\nShown: {len(shown)}. Held for review: {len(held)}.")
    if shown:
        print(f"Caveat shown with every claim: {shown[0].caveat}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
