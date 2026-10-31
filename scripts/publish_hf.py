#!/usr/bin/env python3
"""Publish the Hugging Face Space and model card from huggingface/.

Needs a Hugging Face login with write access to the target organization:
  hf auth login            (or HF_TOKEN in the environment)
  python3 scripts/publish_hf.py [--org DNAi-Systems] [--name asha]
"""
from __future__ import annotations

import argparse
from pathlib import Path

from huggingface_hub import HfApi

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--org", default="DNAi-Systems")
    ap.add_argument("--name", default="asha")
    args = ap.parse_args()
    repo_id = f"{args.org}/{args.name}"
    api = HfApi()
    print("logged in as", api.whoami()["name"])

    api.create_repo(repo_id, repo_type="space", space_sdk="gradio", private=False, exist_ok=True)
    api.upload_folder(repo_id=repo_id, repo_type="space", folder_path=ROOT / "huggingface" / "space",
                      commit_message="Publish Asha API terminal from github.com/DNAiOS/asha")
    print(f"space  https://huggingface.co/spaces/{repo_id}")

    api.create_repo(repo_id, repo_type="model", private=False, exist_ok=True)
    api.upload_folder(repo_id=repo_id, repo_type="model", folder_path=ROOT / "huggingface" / "model-card",
                      commit_message="Asha model card from github.com/DNAiOS/asha")
    print(f"model  https://huggingface.co/{repo_id}")


if __name__ == "__main__":
    main()
