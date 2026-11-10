#!/usr/bin/env python3
"""Build every audio asset for the film, deterministically.

1. Narration: reads all 56 narrations from docs/storyboard.md, speaks them with
   the Piper neural TTS voice, loudness-normalises them, saves
   public/audio/narration/sNN.mp3, and records each clip's real length.
2. Timing: each scene's final length = max(storyboard length, narration start +
   clip + tail), except the hand-built Scenes 1–2, which keep their length.
   Writes src/film/narration-timing.json (read by the film at render time).
3. Music bed and ambience loops, synthesised with ffmpeg (no downloads):
   public/audio/music/bed.mp3, public/audio/sfx/*.mp3

Usage:  python3 scripts/build-audio.py
Needs:  Piper (pip install piper-tts) and a voice model; set PIPER and VOICE below
        or via the PIPER_BIN / PIPER_VOICE environment variables.
"""
import json
import math
import os
import pathlib
import re
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
STORY = ROOT / "docs" / "storyboard.md"
OUT_N = ROOT / "public" / "audio" / "narration"
OUT_M = ROOT / "public" / "audio" / "music"
OUT_S = ROOT / "public" / "audio" / "sfx"
TIMING = ROOT / "src" / "film" / "narration-timing.json"

PIPER = os.environ.get("PIPER_BIN", "/home/user/tts/venv/bin/piper")
VOICE = os.environ.get("PIPER_VOICE", "/home/user/tts/voices/en_GB-northern_english_male-medium.onnx")
LENGTH_SCALE = 1.35  # slower than default: calm documentary pace (~2.5 words/s)
SENTENCE_SILENCE = 0.4

FPS = 30
FIXED = {1: 15.0, 2: 12.0}  # built scenes keep their length
START = {1: 1.5, 2: 0.35}  # narration start (s) for built scenes
DEFAULT_START = 0.45
TAIL = 0.7  # breathing room after the last word

# spoken forms for the TTS (numbers, Latin, names)
SAY = {
    "1381": "thirteen eighty-one",
    "nativus": "nah-TEE-voos",
    "Pater Noster": "Pah-ter Noster",
}

HEAD = re.compile(r"^#### Scene (\d+) · (.+?) — ⏱ (\d+)$", re.M)
NARR = re.compile(r'^\*\*Narration:\*\* "(.+?)"\s*$', re.M)


def sh(*args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True,
    )
    return float(out.stdout.strip())


def scenes():
    text = STORY.read_text()
    heads = list(HEAD.finditer(text))
    for i, h in enumerate(heads):
        body = text[h.end(): heads[i + 1].start() if i + 1 < len(heads) else len(text)]
        yield int(h[1]), h[2], int(h[3]), NARR.search(body)[1]


def speak(n, text):
    spoken = text
    for k, v in SAY.items():
        spoken = spoken.replace(k, v)
    with tempfile.TemporaryDirectory() as tmp:
        raw = pathlib.Path(tmp) / "raw.wav"
        subprocess.run(
            [PIPER, "-m", VOICE, "-f", str(raw), "--length-scale", str(LENGTH_SCALE), "--sentence-silence", str(SENTENCE_SILENCE)],
            input=spoken, text=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        out = OUT_N / f"s{n:02d}.mp3"
        # trim leading/trailing silence, warm it slightly, normalise loudness, 48 kHz stereo
        sh("ffmpeg", "-y", "-i", str(raw), "-af",
           "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
           "equalizer=f=180:t=q:w=1:g=2,loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000",
           "-ac", "2", "-b:a", "160k", str(out))
        return duration(out)


def synth(path, expr, seconds, filters=""):
    """Render an aevalsrc expression (deterministic) to mp3."""
    af = f"-af {filters}" if filters else ""
    cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"aevalsrc={expr}:s=48000:d={seconds}"]
    if filters:
        cmd += ["-af", filters]
    cmd += ["-ac", "2", "-b:a", "128k", str(path)]
    del af
    sh(*cmd)


def noise(path, color, seconds, filters, seed):
    sh("ffmpeg", "-y", "-f", "lavfi", "-i", f"anoisesrc=color={color}:sample_rate=48000:duration={seconds}:seed={seed}:amplitude=0.6",
       "-af", filters, "-ac", "2", "-b:a", "128k", str(path))


def build_music(total):
    """A slow, warm drone in A minor that breathes; fades in and out."""
    OUT_M.mkdir(parents=True, exist_ok=True)
    notes = [(55.0, 0.30), (110.0, 0.22), (164.81, 0.14), (220.0, 0.10), (261.63, 0.06), (329.63, 0.05)]
    parts = []
    for i, (f, a) in enumerate(notes):
        lfo = f"(0.75+0.25*sin(2*PI*t/{17 + i * 6.3:.1f}+{i}))"
        parts.append(f"{a}*{lfo}*sin(2*PI*{f}*t+0.3*sin(2*PI*0.11*t))")
    expr = "+".join(parts)
    synth(OUT_M / "bed.mp3", f"'{expr}'", math.ceil(total) + 2,
          f"lowpass=f=1200,afade=t=in:d=6,afade=t=out:st={total - 6:.2f}:d=6,volume=0.55")


def build_sfx():
    OUT_S.mkdir(parents=True, exist_ok=True)
    # hearth: soft rumble + crackle
    noise(OUT_S / "fire.mp3", "brown", 20, "lowpass=f=500,volume=0.5,afade=t=in:d=1,afade=t=out:st=19:d=1", 11)
    # outdoor wind: slow gusts
    noise(OUT_S / "wind.mp3", "pink", 20, "lowpass=f=700,highpass=f=80,volume='0.35+0.25*sin(2*PI*t/7)':eval=frame,afade=t=in:d=1,afade=t=out:st=19:d=1", 23)
    # rain on thatch
    noise(OUT_S / "rain.mp3", "white", 20, "highpass=f=900,lowpass=f=7000,volume=0.35,afade=t=in:d=1,afade=t=out:st=19:d=1", 37)
    # church bell: inharmonic partials with long decay
    bell = "+".join(f"{a}*sin(2*PI*{f}*t)*exp(-{d}*t)" for f, a, d in [(220, 0.5, 0.6), (440, 0.3, 0.9), (528, 0.25, 1.2), (660, 0.15, 1.6), (880, 0.1, 2.2)])
    synth(OUT_S / "bell.mp3", f"'{bell}'", 4, "volume=0.8")
    # cow horn: a rough, reedy tone with a swell
    horn = "0.5*sin(2*PI*196*t)+0.25*sin(2*PI*392*t)+0.12*sin(2*PI*588*t)"
    synth(OUT_S / "horn.mp3", f"'({horn})*min(1,t*3)*min(1,(2.2-t)*2)'", 2.2, "lowpass=f=1800,volume=0.8")
    # low drum hit (same as Scene 2's)
    synth(OUT_S / "drum.mp3", "'0.95*sin(2*PI*(48*t+(70/22)*(1-exp(-22*t))))*exp(-5.5*t)'", 1.4, "lowpass=f=900")


def main():
    OUT_N.mkdir(parents=True, exist_ok=True)
    timing = {}
    total = 0.0
    for n, title, board, text in scenes():
        clip = speak(n, text)
        start = START.get(n, DEFAULT_START)
        if n in FIXED:
            length = FIXED[n]
            if start + clip > length - 0.2:
                print(f"WARNING scene {n}: narration {clip:.2f}s does not fit its fixed {length}s")
        else:
            length = max(float(board), start + clip + TAIL)
        frames = math.ceil(length * FPS)
        timing[n] = {"title": title, "text": text, "startSec": start, "audioSec": round(clip, 3), "frames": frames}
        total += frames / FPS
        print(f"scene {n:2d}  board {board:2d}s  voice {clip:5.2f}s  → {frames / FPS:5.2f}s  {title}")
    TIMING.write_text(json.dumps(timing, indent=1) + "\n")
    print(f"TOTAL {int(total // 60)}:{int(total % 60):02d} ({total:.1f}s)")
    build_music(total)
    build_sfx()


if __name__ == "__main__":
    main()
