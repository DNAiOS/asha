#!/usr/bin/env python3
"""Check this repository against the live Asha API. No key needed.

Fails (exit 1) when the benchmark register in spec/ no longer matches the
published one, or when the API is down. Prints a warning when the OpenAPI
snapshot has drifted from the live document.

Run: python3 scripts/verify.py
"""
from __future__ import annotations

import hashlib
import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.askasha.org"


def get(url: str) -> tuple[int, bytes]:
    req = urllib.request.Request(url, headers={"User-Agent": "asha-repo-verify/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def main() -> int:
    failures = 0

    local_sha = hashlib.sha256((ROOT / "spec" / "benchmarks.json").read_bytes()).hexdigest()
    status, body = get(f"{API}/api/benchmarks/verify")
    live = json.loads(body) if status == 200 else {}
    live_sha = live.get("register_sha256")
    mirror_ok = (live.get("static_mirror") or {}).get("matches")
    if live_sha == local_sha and mirror_ok:
        print(f"ok    register {local_sha[:16]}… matches the API and dnai.systems/benchmarks.json")
    else:
        failures += 1
        print(f"FAIL  register: local {local_sha[:16]}…, API {str(live_sha)[:16]}…, mirror match {mirror_ok}. "
              "Refresh spec/benchmarks.json, the README tables and the figures.")

    status, body = get(f"{API}/a2a/v1/health")
    if status == 200:
        print(f"ok    A2A health: {json.loads(body).get('status')}")
    else:
        failures += 1
        print(f"FAIL  A2A health returned {status}")

    status, body = get(f"{API}/openapi.json")
    if status == 200:
        live_paths = set(json.loads(body).get("paths", {}))
        snap_paths = set(json.loads((ROOT / "spec" / "openapi.json").read_text(encoding="utf-8")).get("paths", {}))
        added, removed = sorted(live_paths - snap_paths), sorted(snap_paths - live_paths)
        if added or removed:
            print(f"warn  OpenAPI drift: added {added}, removed {removed}. Refresh spec/openapi.json.")
        else:
            print(f"ok    OpenAPI snapshot matches the live document ({len(live_paths)} paths)")
    else:
        print(f"warn  OpenAPI fetch returned {status}")

    status, body = get(f"{API}/.well-known/agent-card.json?agent_id=asha")
    if status == 200 and json.loads(body).get("url") == f"{API}/a2a/v1":
        print("ok    agent card points at /a2a/v1")
    else:
        print(f"warn  agent card returned {status}")

    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
