#!/usr/bin/env python3
"""Build the audio for the dialogue skit "Bro Went Dark" (two stick men, no narrator).

Each line is spoken in its character's voice (Piper), pitched up for a cartoon feel,
with bleeps for the censored word, laid out with comic pauses
-> public/browentdark/dialogue.mp3, plus sound effects.
Writes src/shorts/browentdark/timing.json: per line who/start/end, per part its caption,
start/end and a mouth envelope (30 fps) for lip-sync.

Usage:  /home/user/tts/venv/bin/python3 scripts/build-browentdark-audio.py
"""
import json
import math
import os
import pathlib
import subprocess
import tempfile
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "browentdark"
TIMING = ROOT / "src" / "shorts" / "browentdark" / "timing.json"
PIPER = os.environ.get("PIPER_BIN", "/home/user/tts/venv/bin/piper")
VOICES = pathlib.Path(os.environ.get("VOICES_DIR", "/home/user/tts/voices"))
SR = 48000
FPS = 30

# Voices: base model, pitch factor (cartoon pitch-up), final speed
CAST = {
    "purple": {"model": VOICES / "en_US-ryan-high.onnx", "pitch": 1.42, "speed": 1.12},
    "navy": {"model": VOICES / "en_US-joe-medium.onnx", "pitch": 1.55, "speed": 1.1},
}
BLEEP = "<bleep>"

# (who, [(caption, spoken text or None for silence, seconds of silence if None, pause after)])
SCRIPT = [
    ("purple", [("Bro, what's your body count?", "Bro, what's your body count?", 0, 0.45)]),
    ("navy",   [("Oh, me?", "Oh, me?", 0, 0.3), ("Dang, like...", "Dang, like...", 0, 0.25), ("30 now.", "thirty now.", 0, 0.35)]),
    ("purple", [("Oh my God,", "Oh my God,", 0, 0.1), ("you are a Ho***!", f"you are a {BLEEP}", 0, 0.45)]),
    ("navy",   [("How does that make me a Ho***?", f"How does that make me a {BLEEP}", 0, 0.35),
                ("Wait, are we talking about", "Wait, are we talking about", 0, 0.05), ("people we slept with?", "people we slept with?", 0, 0.4)]),
    ("purple", [("Yeah.", "Yeah.", 0, 0.45)]),
    ("navy",   [("Ohhh.", "Ohhh.", 0, 0.45), ("Well, I've never done that yet.", "Well, I've never done that yet.", 0, 0.5)]),
    ("purple", [("Then...", "Then...", 0, 0.2), ("why'd you say 30?", "why'd you say thirty?", 0, 0.5)]),
    ("navy",   [(".....", None, 1.3, 0.0), (".....", None, 1.1, 0.25)]),   # he just smiles… and fades away
    ("purple", [("Bro...", "Bro...", 0, 0.3), ("what does 30 mean?", "what does thirty mean?", 0, 0.0)]),
]
LEAD = 0.25
TAIL = 1.2


def sh(*args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def read_wav(path):
    with wave.open(str(path)) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            a = a.reshape(-1, 2).mean(axis=1)
    return a


def bleep(seconds=0.38):
    t = np.arange(int(seconds * SR)) / SR
    a = 0.32 * np.sin(2 * np.pi * 1000 * t)
    f = int(0.01 * SR)
    a[:f] *= np.linspace(0, 1, f)
    a[-f:] *= np.linspace(1, 0, f)
    return a.astype(np.float32)


def speak(who, text, tmp):
    v = CAST[who]
    pieces = text.split(BLEEP)
    out = []
    for k, piece in enumerate(pieces):
        if piece.strip():
            raw, part = tmp / "raw.wav", tmp / "part.wav"
            subprocess.run([PIPER, "-m", str(v["model"]), "-f", str(raw), "--sentence-silence", "0.1"], input=piece, text=True, check=True,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            with wave.open(str(raw)) as w:
                rate = w.getframerate()
            tempo = v["speed"] / v["pitch"]
            sh("ffmpeg", "-y", "-i", str(raw), "-af",
               "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
               f"asetrate={int(rate * v['pitch'])},aresample={SR},atempo={tempo:.4f},"
               f"equalizer=f=2500:t=q:w=1:g=2,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-15:TP=-1.5:LRA=6,aresample={SR}",
               "-ac", "1", str(part))
            a = read_wav(part)
            f = int(0.01 * SR)
            a[:f] *= np.linspace(0, 1, f)
            a[-f:] *= np.linspace(1, 0, f)
            out.append(a)
        if k < len(pieces) - 1:
            out.append(np.zeros(int(0.03 * SR), np.float32))
            out.append(bleep())
    return np.concatenate(out) if out else np.zeros(1, np.float32)


def envelope(a):
    hop = SR // FPS
    n = max(1, math.ceil(len(a) / hop))
    rms = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) if a[i * hop:(i + 1) * hop].size else 0 for i in range(n)])
    if rms.max() > 0:
        rms = rms / np.percentile(rms, 95)
    env = np.clip((rms - 0.15) / 0.7, 0, 1)
    return [round(float(x), 2) for x in np.convolve(env, [0.25, 0.5, 0.25], mode="same")]


def write_mp3(a, path):
    with tempfile.TemporaryDirectory() as t:
        wav = pathlib.Path(t) / "s.wav"
        with wave.open(str(wav), "w") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
        sh("ffmpeg", "-y", "-i", str(wav), "-ac", "2", "-b:a", "160k", str(path))


def synth(path, expr, seconds, filters=""):
    cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"aevalsrc={expr}:s=48000:d={seconds}"]
    if filters:
        cmd += ["-af", filters]
    sh(*cmd, "-ac", "2", "-b:a", "128k", str(path))


def build_sfx():
    # vine-boom style hit for the punchline, a soft "pop" for cuts, a cricket chirp for the awkward silence, a fade "whoosh"
    synth(OUT / "boom.mp3", "'0.95*sin(2*PI*(38*t+(90/7)*(1-exp(-7*t))))*exp(-2.6*t)+0.25*sin(2*PI*76*t)*exp(-4*t)'", 2.2, "lowpass=f=700,aecho=0.5:0.4:80:0.3")
    synth(OUT / "pop.mp3", "'0.4*sin(2*PI*(500*t-1200*t*t))*exp(-30*t)'", 0.2, "")
    chirps = "+".join(f"0.25*sin(2*PI*4200*t)*(0.5+0.5*sin(2*PI*45*t))*gte(t,{s})*lte(t,{s + 0.12})" for s in [0.1, 0.35, 0.9, 1.15])
    synth(OUT / "crickets.mp3", f"'{chirps}'", 1.5, "highpass=f=2000")
    sh("ffmpeg", "-y", "-f", "lavfi", "-i", "anoisesrc=color=pink:sample_rate=48000:duration=1.0:seed=7:amplitude=0.6",
       "-af", "highpass=f=400,lowpass=f=5000,volume='0.7*sin(PI*t)^2':eval=frame", "-ac", "2", "-b:a", "128k", str(OUT / "fade.mp3"))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    TIMING.parent.mkdir(parents=True, exist_ok=True)
    clips, lines, t0 = [], [], LEAD
    with tempfile.TemporaryDirectory() as t:
        tmp = pathlib.Path(t)
        for who, parts in SCRIPT:
            line = {"who": who, "start": round(t0, 3), "parts": []}
            for caption, spoken, silence, pause in parts:
                if spoken is None:
                    line["parts"].append({"text": caption, "start": round(t0, 3), "end": round(t0 + silence, 3), "env": []})
                    t0 += silence + pause
                    continue
                a = speak(who, spoken, tmp)
                clips.append((t0, a))
                line["parts"].append({"text": caption, "start": round(t0, 3), "end": round(t0 + len(a) / SR, 3), "env": envelope(a)})
                t0 += len(a) / SR + pause
            lines.append(line)
    total = lines[-1]["parts"][-1]["end"] + TAIL
    for i, l in enumerate(lines):
        l["end"] = lines[i + 1]["start"] if i + 1 < len(lines) else round(total, 3)
    buf = np.zeros(int(total * SR) + SR, np.float32)
    for s, a in clips:
        i = int(s * SR)
        buf[i:i + len(a)] += a
    write_mp3(buf[: int(total * SR)], OUT / "dialogue.mp3")
    build_sfx()
    TIMING.write_text(json.dumps({"total": round(total, 3), "lines": lines}) + "\n")
    for l in lines:
        print(f"{l['who']:6s} {l['start']:5.2f}-{l['end']:5.2f}  " + " | ".join(p["text"] for p in l["parts"]))
    print(f"TOTAL {total:.1f}s")


if __name__ == "__main__":
    main()
