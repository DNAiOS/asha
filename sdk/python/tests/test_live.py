"""Opt-in checks against production. Run with ASHA_LIVE=1 and ASHA_API_KEY set.

Each run uses up to 3 answers or tool calls from the key's allowance.
"""

from __future__ import annotations

import os

import pytest

from askasha import Asha

pytestmark = pytest.mark.skipif(
    os.environ.get("ASHA_LIVE") != "1" or not os.environ.get("ASHA_API_KEY"),
    reason="set ASHA_LIVE=1 and ASHA_API_KEY to run live tests",
)


@pytest.fixture(scope="module")
def live() -> Asha:
    return Asha()


def test_live_models_and_med_check(live: Asha) -> None:
    ids = {m.id for m in live.models.list()}
    assert {"asha", "asha-base", "asha-med-check"} <= ids
    mc = live.clinical.med_check(["warfarin", "fluconazole"], format="fhir")
    assert mc.rule_table_version
    assert mc.interactions, "warfarin + fluconazole should match an interaction rule"
    assert mc.detected_issues


def test_live_stream_and_receipt(live: Asha) -> None:
    stream = live.chat.stream(
        model="asha-base",
        messages=[{"role": "user", "content": "What are red flags for a headache?"}],
        metadata={"verbosity": "brief"},
    ).until_done()
    assert stream.text
    assert stream.asha is not None and stream.asha.receipt_id
    receipt = live.receipts.get(stream.asha.receipt_id)
    assert receipt.answer_sha256 == (stream.asha.receipt.answer_sha256 if stream.asha.receipt else None)
