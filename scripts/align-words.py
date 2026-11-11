#!/usr/bin/env python3
"""Measure when each scripted word is really spoken.

Transcribes every scene voice track (public/audio/voice/sNN.mp3) with
faster-whisper word timestamps, aligns the result to src/film/script.json and
writes src/film/word-timing.json: {scene: [[startSec, endSec], ...]} with one
entry per script word, in order (gaps the recogniser missed are interpolated).
Also prints how far the old even-spread estimate was off.

Usage:  HF_HUB_DISABLE_XET=1 /home/user/tts/venv/bin/python3 scripts/align-words.py
"""
import difflib, json, pathlib, re, subprocess
import numpy as np
from faster_whisper import WhisperModel

ROOT = pathlib.Path(__file__).resolve().parent.parent
TIMING = json.load(open(ROOT / "src/film/narration-timing.json"))
clean = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())
model = WhisperModel("small.en", device="cpu", compute_type="int8")

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

def estimate(lines):  # same as wordTimings() in narration.ts
    out = []
    for l in lines:
        ws = l["text"].split(); wt = [len(re.sub(r"[^\w']", "", w)) + 2 for w in ws]; t = l["start"]
        for w, k in zip(ws, wt):
            d = (l["end"] - l["start"]) * k / sum(wt); out.append((w, t, t + d, l)); t += d
    return out

result, report = {}, []
for n in sorted(TIMING, key=int):
    lines = TIMING[n]["lines"]
    est = estimate(lines)
    off = TIMING[n]["startSec"]  # track starts this far into the scene
    segs, _ = model.transcribe(load(ROOT / f"public/audio/voice/s{int(n):02d}.mp3"), word_timestamps=True, beam_size=1, language="en")
    heard = [(clean(w.word), w.start + off, w.end + off) for s in segs for w in s.words if clean(w.word)]
    a, b = [clean(w) for w, *_ in est], [h[0] for h in heard]
    real = [None] * len(est)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size): real[blk.a + k] = heard[blk.b + k][1:]
    # fill misses: keep inside their own line, interpolate between matched neighbours
    for i, r in enumerate(real):
        if r: continue
        l = est[i][3]; prev = next((real[j][1] for j in range(i - 1, -1, -1) if real[j] and est[j][3] is l), l["start"])
        nxt = next((real[j][0] for j in range(i + 1, len(est)) if real[j] and est[j][3] is l), l["end"])
        span = [j for j in range(i, len(est)) if not real[j] and est[j][3] is l]
        step = (nxt - prev) / (len(span) + 1); real[i] = (prev + step * 0.5, prev + step)
    for i in range(len(real)):  # keep words in order and never zero-length
        s0 = max(real[i][0], real[i - 1][0] if i else 0.0)
        real[i] = (s0, max(real[i][1], s0 + 0.03))
    err = [abs(e[1] - r[0]) for e, r in zip(est, real)]
    matched = sum(1 for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks() for _ in range(blk.size))
    report.append((int(n), len(est), matched, float(np.mean(err)), float(np.max(err))))
    result[n] = [[round(s, 3), round(e, 3)] for s, e in real]
    print(f"scene {n:>2}: {matched}/{len(est)} words heard, estimate off by avg {np.mean(err):.2f}s, max {np.max(err):.2f}s", flush=True)
json.dump(result, open(ROOT / "src/film/word-timing.json", "w"))
print("worst scenes:", sorted(report, key=lambda r: -r[4])[:8])
