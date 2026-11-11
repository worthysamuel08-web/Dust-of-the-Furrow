#!/usr/bin/env python3
"""Validate docs/storyboard.md and regenerate its timings.

- Derives every scene's duration from its narration (≤ 2.2 words/s + 1 s breath),
  except Scene 1 (already built: 15 s) and Scene 56 (+5 s end-card hold).
- Writes the ⏱ figure into each scene heading and regenerates the runtime table.
- Fails (exit 1) if a scene is missing a field, the count isn't 56, or the total
  falls outside the 10–12 minute target.

Usage:  python3 docs/check-storyboard.py          # check + rewrite timings
        python3 docs/check-storyboard.py --check  # check only, no rewrite
"""
import math
import pathlib
import re
import sys

PATH = pathlib.Path(__file__).with_name("storyboard.md")
WPS = 2.2  # maximum speaking rate, words per second
BREATH = 1  # seconds of air after each line
FIXED = {1: 15}  # built scenes keep their real length
EXTRA = {56: 5}  # end-card hold
TARGET = (600, 720)  # 10–12 minutes
FIELDS = ["Narration", "Action / expression", "Environment", "Camera", "Lighting", "Sound"]

SECTIONS = [
    ("1 · Dawn at home", 1, 9),
    ("2 · The manor's rules", 10, 19),
    ("3 · The lord's harvest", 20, 29),
    ("4 · Life beyond the fields", 30, 39),
    ("5 · The unexpected reality", 40, 48),
    ("6 · Nightfall", 49, 56),
]

# When the audio has been built, scene lengths come from the real voice track.
_timing = PATH.parent.parent / "src" / "film" / "narration-timing.json"
REAL = __import__("json").load(open(_timing)) if _timing.exists() else None

HEAD = re.compile(r"^#### Scene (\d+) · (.+?) — ⏱ \d+$", re.M)
NARR = re.compile(r'^\*\*Narration:\*\* "(.+?)"\s*$', re.M)


def fmt(s: int) -> str:
    return f"{s // 60}:{s % 60:02d}"


def main() -> int:
    check_only = "--check" in sys.argv
    text = PATH.read_text()
    heads = list(HEAD.finditer(text))
    errors = []
    if [int(h[1]) for h in heads] != list(range(1, 57)):
        errors.append(f"expected scenes 1..56 in order, found {len(heads)}")

    scenes = {}
    out, last = [], 0
    for i, h in enumerate(heads):
        n, title = int(h[1]), h[2]
        end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
        body = text[h.end():end]
        for f in FIELDS:
            if f"**{f}:**" not in body:
                errors.append(f"scene {n}: missing {f}")
        m = NARR.search(body)
        words = len(m[1].split()) if m else 0
        dur = FIXED.get(n, max(5, math.ceil(words / WPS) + BREATH)) + EXTRA.get(n, 0)
        if REAL:  # the film's real scene lengths, from the audio build
            dur = round(REAL[str(n)]["frames"] / 30)
        scenes[n] = (title, words, dur)
        out.append(text[last:h.start()] + f"#### Scene {n} · {title} — ⏱ {dur}" + body)
        last = end
    text = "".join(out) + text[last:]

    total = sum(d for _, _, d in scenes.values())
    words = sum(w for _, w, _ in scenes.values())
    durs = [d for _, _, d in scenes.values()]
    rows = []
    for name, lo, hi in SECTIONS:
        sec = [scenes[k][2] for k in range(lo, hi + 1) if k in scenes]
        rows.append(f"| {name} | {lo}–{hi} | {len(sec)} | {min(sec)}–{max(sec)} s | {fmt(sum(sec))} |")
    table = (
        "<!-- RUNTIME-TABLE -->\n"
        "| Section | Scenes | Count | Scene lengths | Duration |\n|---|---|---|---|---|\n"
        + "\n".join(rows)
        + f"\n| **Total** | **1–56** | **{len(scenes)}** | **{min(durs)}–{max(durs)} s** | **{fmt(total)} ({total} s)** |\n\n"
        f"Narrated words: **{words}** (dialogue is listed per scene). Shortest scene {min(durs)} s, longest {max(durs)} s.\n"
        "<!-- /RUNTIME-TABLE -->"
    )
    text = re.sub(r"<!-- RUNTIME-TABLE -->.*?(<!-- /RUNTIME-TABLE -->|$)", table, text, count=1, flags=re.S | re.M) \
        if "<!-- /RUNTIME-TABLE -->" in text else text.replace("<!-- RUNTIME-TABLE -->", table, 1)

    if not TARGET[0] <= total <= TARGET[1]:
        errors.append(f"total {fmt(total)} outside {fmt(TARGET[0])}–{fmt(TARGET[1])}")
    for n, (_, w, d) in scenes.items():
        spoken = d - (2 if n == 1 else 0) - EXTRA.get(n, 0)
        if not REAL and w / spoken > WPS + 0.05:
            errors.append(f"scene {n}: {w} words in {spoken} s is too fast")

    if not check_only:
        PATH.write_text(text)
    print("\n".join(rows))
    print(f"TOTAL {fmt(total)} ({total} s) · {len(scenes)} scenes · {words} words · scenes {min(durs)}–{max(durs)} s")
    for e in errors:
        print("ERROR:", e)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
