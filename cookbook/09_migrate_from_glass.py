"""Migrate from Glass: translate a Glass-style request and read the answer back in the same shape.

The field mapping is in MIGRATE_FROM_GLASS.md. This script converts a request
in the Glass API shape (as documented by glass.health when captured on
2026-09-12) to `/v1/messages`, then maps Asha's response back to the fields a
Glass integration reads (`text`, `references`, `usage.inputTokens`), so the rest
of your code changes later, one field at a time.

Run: ASHA_API_KEY=... python cookbook/09_migrate_from_glass.py
"""

import json
from typing import Any, Dict

from askasha import Asha

# Glass "version" values map to dated Asha snapshots; unknown versions use the floating alias.
VERSION_TO_MODEL = {"5.5-2026-03-31": "asha-base-2026-12-01"}


def glass_request_to_asha(req: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "model": VERSION_TO_MODEL.get(req.get("version", ""), "asha-base"),
        "messages": [{"role": m["role"], "content": m["content"]} for m in req["messages"]],
        "metadata": {**(req.get("metadata") or {}), "memory": "off"},
    }


def asha_response_to_glass(resp: Any) -> Dict[str, Any]:
    refs = resp.asha.references if resp.asha else []
    usage = resp.message.usage
    return {
        "id": resp.id,
        "role": "assistant",
        "text": resp.text,  # Asha keeps [n] markers in the text; references[n-1] is the source
        "references": [
            {"index": r.n, "type": r.type, "title": r.title, "display": r.display,
             "locator": r.locator.model_dump(exclude_none=True) if r.locator else {}}
            for r in refs
        ],
        "usage": {"inputTokens": usage.input_tokens, "outputTokens": usage.output_tokens},
        "asha": {"receipt_id": resp.receipt_id, "safety": resp.asha.safety.model_dump() if resp.asha and resp.asha.safety else None},
    }


def main() -> int:
    glass_request = {
        "version": "5.5-2026-03-31",
        "messages": [{"role": "user", "content": "Initial management of community-acquired pneumonia in an outpatient adult?"}],
        "metadata": {"verbosity": "brief"},
    }
    client = Asha()
    resp = client.messages.create(**glass_request_to_asha(glass_request))
    out = asha_response_to_glass(resp)
    print(json.dumps({**out, "text": out["text"][:400] + " ..."}, indent=2, default=str))
    return 0 if out["text"] and out["references"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
