"""Run every recipe against the API and record pass or fail.

Run: ASHA_API_KEY=... python cookbook/run_all.py [--out results.json] [--only 01,05]

A recipe passes when it exits 0. Each run uses about 9 answers plus a few tool
calls from the key's allowance (recipe 10 sends one answer twice; the replay is
not billed).
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out")
    ap.add_argument("--only", help="comma-separated recipe numbers")
    ap.add_argument("--timeout", type=int, default=420)
    args = ap.parse_args()
    if not os.environ.get("ASHA_API_KEY"):
        sys.exit("set ASHA_API_KEY")
    only = set(args.only.split(",")) if args.only else None
    recipes = sorted(p for p in HERE.glob("[0-9][0-9]_*.py") if not only or p.name[:2] in only)

    results = []
    for path in recipes:
        start = time.monotonic()
        try:
            proc = subprocess.run([sys.executable, str(path)], capture_output=True, text=True, timeout=args.timeout)
            code, out, err = proc.returncode, proc.stdout, proc.stderr
        except subprocess.TimeoutExpired as e:
            code, out, err = -1, str(e.stdout or ""), f"timeout after {args.timeout}s"
        secs = round(time.monotonic() - start, 1)
        status = "pass" if code == 0 else "fail"
        tail = (out.strip().splitlines() or [""])[-1][:240]
        results.append({"recipe": path.name, "status": status, "exit": code, "seconds": secs,
                        "last_line": tail, "stderr_tail": err.strip()[-600:] if code else ""})
        print(f"{status.upper():4}  {path.name:40} {secs:6.1f}s  {tail}")
        print(out)
        if err.strip():
            print(err.strip()[-2000:], file=sys.stderr)

    summary = {
        "run_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "base_url": os.environ.get("ASHA_BASE_URL", "https://api.askasha.org"),
        "passed": sum(r["status"] == "pass" for r in results),
        "total": len(results),
        "results": results,
    }
    if args.out:
        Path(args.out).write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(f"\n{summary['passed']}/{summary['total']} passed")
    return 0 if summary["passed"] == summary["total"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
