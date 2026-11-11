#!/usr/bin/env python3
"""Copy the spoken script (src/film/script.json) and the real scene lengths
(src/film/narration-timing.json) into docs/storyboard.md, so the storyboard
always matches what the film says.

Per scene it rewrites the **Narration:** line (narrator lines only), adds or
replaces a **Dialogue:** line (who says what), and sets the ⏱ duration.

Usage:  python3 scripts/sync-storyboard.py      (after scripts/build-audio.py)
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
STORY = ROOT / "docs" / "storyboard.md"
SCRIPT = json.load(open(ROOT / "src" / "film" / "script.json"))
TIMING = json.load(open(ROOT / "src" / "film" / "narration-timing.json"))

NAMES = {"walterHooded": "WALTER", "millerBoy": "MILLER'S BOY", "lordsMan": "LORD'S MAN", "villagerA": "VILLAGER", "villagerB": "REAPER",
         "villagerC": "NEIGHBOUR", "villagerD": "NEIGHBOUR", "villagerE": "VILLAGER"}

text = STORY.read_text()
heads = list(re.finditer(r"^#### Scene (\d+) · (.+?) — ⏱ \d+$", text, re.M))
out, last = [], 0
for i, h in enumerate(heads):
    n = h[1]
    end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
    body = text[h.end():end]
    lines = SCRIPT[n]
    narr = " ".join(l["text"] for l in lines if l["who"] == "narrator")
    dlg = " / ".join(f'{NAMES.get(l["who"], l["who"].upper())}: "{l["text"]}"' for l in lines if l["who"] != "narrator")
    body = re.sub(r'^\*\*Narration:\*\* ".*"\s*$', f'**Narration:** "{narr}"', body, count=1, flags=re.M)
    body = re.sub(r"^\*\*Dialogue:\*\* .*\n", "", body, flags=re.M)
    if dlg:
        body = re.sub(r'(^\*\*Narration:\*\* ".*"\s*$)', lambda m: m[1] + f"\n**Dialogue:** {dlg}", body, count=1, flags=re.M)
    secs = round(TIMING[n]["frames"] / 30)
    out.append(text[last:h.start()] + f"#### Scene {n} · {h[2]} — ⏱ {secs}" + body)
    last = end
STORY.write_text("".join(out) + text[last:])
print(f"synced {len(heads)} scenes")
