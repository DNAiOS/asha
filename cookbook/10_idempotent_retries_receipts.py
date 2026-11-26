"""Idempotent retries and receipts for audit.

1. Send an answer request with an Idempotency-Key you store with your job.
2. Send it again with the same key and body (what a retry after a crash does):
   the API replays the stored response (`Idempotent-Replayed: true`) without
   running or billing it again.
3. Fetch the receipt and check its answer fingerprint and corpus commitment
   against what you stored with the answer.

Run: ASHA_API_KEY=... python cookbook/10_idempotent_retries_receipts.py
"""

from askasha import Asha, idempotency_key


def main() -> int:
    client = Asha()
    key = idempotency_key()  # store this with the job record before sending
    request = dict(
        model="asha-base",
        messages=[{"role": "user", "content": "What is the recommended adult dose interval for tetanus boosters?"}],
        metadata={"verbosity": "brief", "memory": "off"},
    )

    first = client.chat.create(**request, idempotency_key=key)
    replay = client.chat.create(**request, idempotency_key=key)
    print(f"first:  id={first.id} replayed={first.meta.idempotent_replayed} receipt={first.receipt_id}")
    print(f"replay: id={replay.id} replayed={replay.meta.idempotent_replayed} receipt={replay.receipt_id}")
    same = replay.id == first.id and replay.text == first.text

    if not first.receipt_id or not first.asha or not first.asha.receipt:
        print("FAIL: answer carried no receipt")
        return 1
    receipt = client.receipts.get(first.receipt_id)
    body = receipt.receipt
    fingerprint_ok = receipt.answer_sha256 == first.asha.receipt.answer_sha256
    commitment = (body.get("corpus_commitment") or {}).get("value")
    cited = first.asha.grounding.corpus_commitment.hash if first.asha.grounding and first.asha.grounding.corpus_commitment else None
    print(f"receipt {receipt.id}: answered_at={body.get('answered_at')} tier={body.get('model_tier')} "
          f"evidence_count={body.get('evidence_count')}")
    print(f"answer fingerprint matches the answer's receipt: {fingerprint_ok}")
    print(f"corpus commitment in receipt matches the answer's grounding: {commitment == cited}")
    print(f"replay returned the stored answer: {same}")
    return 0 if same and replay.meta.idempotent_replayed and fingerprint_ok and commitment == cited else 1


if __name__ == "__main__":
    raise SystemExit(main())
