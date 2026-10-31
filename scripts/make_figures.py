#!/usr/bin/env python3
"""Rebuild the README figures from the files in this repository.

  assets/benchmarks-paired.png  every number read from spec/benchmarks.json
  assets/demo/terminal.gif      a recorded CLI answer, assets/demo/transcript-*.txt

Run: python3 scripts/make_figures.py   (needs matplotlib and Pillow)
"""
from __future__ import annotations

import hashlib
import json
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

INK, MUTED, TEAL, FIELD, RULE = "#2a2420", "#6b5f54", "#067078", "#f4efe6", "#d9d0c3"
MONTSERRAT = "/Library/Fonts/Montserrat-VariableFont_wght.ttf"
MENLO = "/System/Library/Fonts/Menlo.ttc"


def paired_chart() -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib import font_manager

    raw = (ROOT / "spec" / "benchmarks.json").read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    reg = json.loads(raw)
    rows = [c for c in reg["lift"]["comparisons"] if c.get("alone_score") is not None]

    if Path(MONTSERRAT).exists():
        font_manager.fontManager.addfont(MONTSERRAT)
        plt.rcParams["font.family"] = "Montserrat"
    plt.rcParams.update({"axes.edgecolor": RULE, "text.color": INK, "xtick.color": MUTED, "ytick.color": INK})

    fig, ax = plt.subplots(figsize=(12, 0.82 * len(rows) + 2.3), dpi=160)
    fig.patch.set_facecolor(FIELD)
    ax.set_facecolor(FIELD)

    labels = []
    for i, c in enumerate(reversed(rows)):
        y = i
        a, b = c["alone_score"], c["asha_score"]
        sig = c["significant"]
        ax.plot([a, b], [y, y], color=TEAL if sig else MUTED, lw=3, alpha=0.55, solid_capstyle="round", zorder=1)
        ax.scatter([a], [y], s=90, color=FIELD, edgecolor=MUTED, linewidth=2, zorder=2)
        ax.scatter([b], [y], s=110, color=TEAL if sig else MUTED, zorder=3)
        ax.text(a - 1.2, y, f"{a:.1f}", ha="right", va="center", fontsize=10, color=MUTED)
        ax.text(b + 1.2, y, f"{b:.1f}", ha="left", va="center", fontsize=10, color=INK, weight="bold")
        delta = f"+{c['delta_pp']:.1f} points" + ("" if sig else "\nnot significant")
        ax.annotate(f"{delta}\np = {c['p']}", xy=(1.03, y), xycoords=("axes fraction", "data"), ha="left",
                    va="center", fontsize=8.5, color=TEAL if sig else MUTED, linespacing=1.3, annotation_clip=False)
        labels.append(f"{c['benchmark']}  (n = {c['n']:,})\n{c['model_alone']} alone vs. inside Asha ({c['asha_configuration']})")

    ax.set_yticks(range(len(rows)))
    ax.set_yticklabels(labels, fontsize=9, linespacing=1.35)
    ax.set_xlim(20, 100)
    ax.set_ylim(-0.7, len(rows) - 0.3)
    ax.tick_params(axis="y", length=0)
    ax.tick_params(axis="x", labelsize=9)
    ax.grid(axis="x", color=RULE, lw=0.8)
    ax.set_axisbelow(True)
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.set_xlabel("Score, 0 to 100 (HealthBench rubric score; MedQA accuracy; psychosis-bench safe-intervention rate)",
                  fontsize=8.5, color=MUTED, labelpad=8)

    fig.text(0.015, 0.965, "The same answer-writing model, alone and inside Asha", fontsize=15, weight="bold", color=INK, va="top")
    fig.text(0.015, 0.915, "Same items, same grader for both arms.   ○ model alone", fontsize=10, color=MUTED, va="top")
    fig.text(0.355, 0.915, "●  inside Asha", fontsize=10, color=TEAL, va="top", weight="bold")
    fig.text(0.015, 0.018,
             f"Source: dnai.systems/benchmarks.json, updated {reg['updated']}, sha256 {sha[:16]}…  "
             "Limits, graders and per-item data: github.com/EndlessRay/asha-benchmarks",
             fontsize=7.5, color=MUTED)
    fig.subplots_adjust(left=0.36, right=0.84, top=0.84, bottom=0.17)
    out = ASSETS / "benchmarks-paired.png"
    fig.savefig(out, facecolor=FIELD)
    print("wrote", out.relative_to(ROOT))


def terminal_gif() -> None:
    from PIL import Image, ImageDraw, ImageFont

    transcript = sorted((ASSETS / "demo").glob("transcript-*.txt"))[-1]
    text = transcript.read_text(encoding="utf-8")
    paras = [p for p in text.split("\n\n") if p.strip()]
    answer_lead = paras[0].strip()
    sources_block = next(p for p in paras if p.startswith("## My Sources")).splitlines()
    trailer = next(line for line in text.splitlines() if line.startswith("["))
    omitted = sum(1 for p in paras[1:] if not p.startswith("## My Sources") and not p.startswith("["))

    command = ['$ asha ask "Which antihypertensives are safe in pregnancy?" \\',
               "    --audience clinician --verbosity brief --depth base --no-memory"]
    width_chars = 92
    out_lines: list[tuple[str, str]] = []
    for line in textwrap.wrap(answer_lead, width_chars):
        out_lines.append((line, INK))
    out_lines.append(("", INK))
    out_lines.append((f"[excerpt: {omitted} paragraphs and sources 3-7 omitted here; full output in {transcript.name}]", MUTED))
    out_lines.append(("", INK))
    for line in sources_block[:3]:
        for w in textwrap.wrap(line, width_chars, subsequent_indent="   "):
            out_lines.append((w, INK if not line.startswith("##") else TEAL))
    out_lines.append(("", INK))
    out_lines.append((trailer, MUTED))

    font = ImageFont.truetype(MENLO, 26)
    small = ImageFont.truetype(MONTSERRAT, 22) if Path(MONTSERRAT).exists() else font
    lh, pad, top = 38, 44, 92
    W = 1720
    H = top + pad + lh * (len(out_lines) + 4) + 60

    def frame(n_lines: int, status: str) -> Image.Image:
        im = Image.new("RGB", (W, H), FIELD)
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([18, 18, W - 18, H - 18], radius=22, fill="#fbf8f3", outline=RULE, width=2)
        for i, c in enumerate(("#d9a49a", "#e3c98f", "#a9c3a0")):
            d.ellipse([48 + i * 34, 44, 68 + i * 34, 64], fill=c)
        d.text((W // 2, 54), "asha CLI  ·  recorded 2026-10-31 against api.askasha.org", font=small, fill=MUTED, anchor="mm")
        y = top
        for cmd_line in command:
            d.text((pad, y), cmd_line, font=font, fill=TEAL)
            y += lh
        y += lh
        for txt, col in out_lines[:n_lines]:
            d.text((pad, y), txt, font=font, fill=col)
            y += lh
        if status:
            d.text((pad, H - 62), status, font=small, fill=MUTED)
        return im

    frames, durations = [frame(0, "")], [900]
    frames.append(frame(0, "retrieval, verification, synthesis ... (10 s in real time, shortened here)"))
    durations.append(1600)
    for n in range(1, len(out_lines) + 1):
        frames.append(frame(n, ""))
        durations.append(220 if out_lines[n - 1][0] else 120)
    frames.append(frame(len(out_lines), "Base depth, real output, unedited text; excerpt marked above"))
    durations.append(6500)

    scale = 0.5
    frames = [f.resize((int(W * scale), int(H * scale)), Image.LANCZOS) for f in frames]
    out = ASSETS / "demo" / "terminal.gif"
    frames[0].save(out, save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=True)
    frames[-1].save(ASSETS / "demo" / "terminal.png")
    print("wrote", out.relative_to(ROOT), "and terminal.png")


if __name__ == "__main__":
    paired_chart()
    terminal_gif()
