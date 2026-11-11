#!/usr/bin/env python3
"""Build every audio asset for the film, deterministically.

1. Voices: reads src/film/script.json (narration + dialogue, per scene), speaks
   each line with Piper in its speaker's voice, normalises it, and lays the
   lines out on each scene's timeline with their pauses ->
   public/audio/voice/sNN.mp3 (one clip per scene).
2. Timing: writes src/film/narration-timing.json with, per scene, every line's
   speaker, text, start/end, and a mouth envelope (30 fps, 0..1) for lip-sync.
   Scene length = lines + tail (Scenes 1–2 keep their built length).
3. Music bed and sound effects, synthesised with ffmpeg (no downloads):
   public/audio/music/bed.mp3, public/audio/sfx/*.mp3

Usage:  python3 scripts/build-audio.py
Needs:  Piper (pip install piper-tts) and the voice models below
        (PIPER_BIN / VOICES_DIR environment variables override the paths).
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
SCRIPT = ROOT / "src" / "film" / "script.json"
OUT_V = ROOT / "public" / "audio" / "voice"
OUT_M = ROOT / "public" / "audio" / "music"
OUT_S = ROOT / "public" / "audio" / "sfx"
TIMING = ROOT / "src" / "film" / "narration-timing.json"

PIPER = os.environ.get("PIPER_BIN", "/home/user/tts/venv/bin/piper")
VOICES = pathlib.Path(os.environ.get("VOICES_DIR", "/home/user/tts/voices"))
NARRATOR_MODEL = VOICES / "en_GB-northern_english_male-medium.onnx"
CAST_MODEL = VOICES / "en_GB-vctk-medium.onnx"
SR = 48000
FPS = 30

# Narrator: slow and deliberate (≈2 words/s), with breathing room between sentences.
NARRATOR = {"model": NARRATOR_MODEL, "speaker": None, "length": 1.42, "silence": 0.5, "gain_db": 0.0}
# Cast: VCTK speakers chosen by pitch (low → high); conversational pace.
CAST = {
    "walter": "p247", "walterHooded": "p247",
    "gilbert": "p251", "john": "p286", "pedlar": "p255", "millerBoy": "p255",
    "priest": "p237", "steward": "p254", "miller": "p334", "hayward": "p245", "lordsMan": "p256",
    "purveyor": "p284", "clerk": "p326", "taster": "p347", "smith": "p281",
    "villagerA": "p316", "villagerB": "p245", "villagerE": "p256",
    "alice": "p239", "joan": "p240", "matilda": "p228", "emma": "p230", "villagerC": "p250", "villagerD": "p264",
    "hugh": "p310", "agnes": "p317", "child": "p310",
}
FIXED = {1: 15.0, 2: 12.0}  # hand-built scenes keep their length
START = {1: 1.5, 2: 0.35}
DEFAULT_START = 0.5
TAIL = 0.7
SAY = {"1381": "thirteen eighty-one", "Nativus": "Nah-tee-vus", "Pater Noster, qui es in caelis": "Pah-ter noster, kwee ess in chay-lees"}


def sh(*args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def read_wav(path):
    with wave.open(str(path)) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            a = a.reshape(-1, 2).mean(axis=1)
    return a


def speak(who, text, tmp):
    spoken = text
    for k, v in SAY.items():
        spoken = spoken.replace(k, v)
    if who == "narrator":
        v = NARRATOR
        args = ["--length-scale", str(v["length"]), "--sentence-silence", str(v["silence"])]
        model = v["model"]
    else:
        model = CAST_MODEL
        speakers = json.load(open(str(CAST_MODEL) + ".json"))["speaker_id_map"]
        args = ["-s", str(speakers[CAST[who]]), "--length-scale", "1.05", "--sentence-silence", "0.3"]
    raw = tmp / "raw.wav"
    subprocess.run([PIPER, "-m", str(model), "-f", str(raw), *args], input=spoken, text=True, check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    out = tmp / "line.wav"
    # trim silence at both ends, warm the narrator slightly, normalise loudness, 48 kHz mono
    eq = "equalizer=f=160:t=q:w=1:g=2.5," if who == "narrator" else ""
    loud = "-16" if who == "narrator" else "-17"
    sh("ffmpeg", "-y", "-i", str(raw), "-af",
       "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
       f"{eq}loudnorm=I={loud}:TP=-1.5:LRA=7,aresample={SR}", "-ac", "1", str(out))
    return read_wav(out)


def envelope(a):
    """Mouth openness per video frame (0..1), smoothed, from the line's loudness."""
    hop = SR // FPS
    n = max(1, math.ceil(len(a) / hop))
    rms = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) if a[i * hop:(i + 1) * hop].size else 0 for i in range(n)])
    if rms.max() > 0:
        rms = rms / np.percentile(rms, 95)
    env = np.clip((rms - 0.12) / 0.75, 0, 1)
    sm = np.convolve(env, [0.25, 0.5, 0.25], mode="same")
    return [round(float(x), 2) for x in sm]


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


def noise(path, color, seconds, filters, seed):
    sh("ffmpeg", "-y", "-f", "lavfi", "-i", f"anoisesrc=color={color}:sample_rate=48000:duration={seconds}:seed={seed}:amplitude=0.6",
       "-af", filters, "-ac", "2", "-b:a", "128k", str(path))


def build_music(total):
    """A slow drone in A minor with a gentle pulse; the film automates its level."""
    OUT_M.mkdir(parents=True, exist_ok=True)
    notes = [(55.0, 0.30), (110.0, 0.22), (164.81, 0.15), (220.0, 0.11), (261.63, 0.07), (329.63, 0.06), (440.0, 0.03)]
    parts = [f"{a}*(0.75+0.25*sin(2*PI*t/{17 + i * 6.3:.1f}+{i}))*sin(2*PI*{f}*t+0.3*sin(2*PI*0.11*t))" for i, (f, a) in enumerate(notes)]
    pulse = "0.05*sin(2*PI*110*t)*pow(max(0,sin(2*PI*t/2.4)),12)"
    synth(OUT_M / "bed.mp3", f"'{'+'.join(parts)}+{pulse}'", math.ceil(total) + 2,
          f"lowpass=f=1400,afade=t=in:d=4,afade=t=out:st={total - 5:.2f}:d=5,volume=0.6")


def build_sfx():
    OUT_S.mkdir(parents=True, exist_ok=True)
    noise(OUT_S / "fire.mp3", "brown", 20, "lowpass=f=500,volume=0.5,afade=t=in:d=1,afade=t=out:st=19:d=1", 11)
    noise(OUT_S / "wind.mp3", "pink", 20, "lowpass=f=700,highpass=f=80,volume='0.35+0.25*sin(2*PI*t/7)':eval=frame,afade=t=in:d=1,afade=t=out:st=19:d=1", 23)
    noise(OUT_S / "rain.mp3", "white", 20, "highpass=f=900,lowpass=f=7000,volume=0.35,afade=t=in:d=1,afade=t=out:st=19:d=1", 37)
    bell = "+".join(f"{a}*sin(2*PI*{f}*t)*exp(-{d}*t)" for f, a, d in [(220, 0.5, 0.6), (440, 0.3, 0.9), (528, 0.25, 1.2), (660, 0.15, 1.6), (880, 0.1, 2.2)])
    synth(OUT_S / "bell.mp3", f"'{bell}'", 4, "volume=0.8")
    synth(OUT_S / "horn.mp3", "'(0.5*sin(2*PI*196*t)+0.25*sin(2*PI*392*t)+0.12*sin(2*PI*588*t))*min(1,t*3)*min(1,(2.2-t)*2)'", 2.2, "lowpass=f=1800,volume=0.8")
    synth(OUT_S / "drum.mp3", "'0.95*sin(2*PI*(48*t+(70/22)*(1-exp(-22*t))))*exp(-5.5*t)'", 1.4, "lowpass=f=900")
    # transition accents: an airy whoosh, a soft low impact, an interface blip, a counter tick
    noise(OUT_S / "whoosh.mp3", "pink", 0.8, "highpass=f=300,lowpass=f=4000,volume='0.9*sin(PI*t/0.8)^2':eval=frame,afade=t=out:st=0.6:d=0.2", 41)
    synth(OUT_S / "impact.mp3", "'0.9*sin(2*PI*(40*t+(50/18)*(1-exp(-18*t))))*exp(-7*t)'", 1.0, "lowpass=f=600")
    synth(OUT_S / "blip.mp3", "'0.35*sin(2*PI*(880*t+300*t*t))*exp(-14*t)'", 0.35, "highpass=f=300")
    synth(OUT_S / "tick.mp3", "'0.4*sin(2*PI*1500*t)*exp(-40*t)+0.3*sin(2*PI*2250*t)*exp(-50*t)'", 0.2, "")


def main():
    OUT_V.mkdir(parents=True, exist_ok=True)
    script = {int(k): v for k, v in json.load(open(SCRIPT)).items() if not k.startswith("_")}
    titles = json.load(open(TIMING)) if TIMING.exists() else {}
    timing = {}
    total = 0.0
    with tempfile.TemporaryDirectory() as t:
        tmp = pathlib.Path(t)
        for n in sorted(script):
            t0 = START.get(n, DEFAULT_START)
            clips, lines = [], []
            for line in script[n]:
                who = line["who"]
                a = speak(who, line["text"], tmp)
                clips.append((t0, a))
                lines.append({"who": who, "text": line["text"], "start": round(t0, 3), "end": round(t0 + len(a) / SR, 3),
                              "env": envelope(a) if who != "narrator" else []})
                t0 += len(a) / SR + line.get("pause", 0.5 if who == "narrator" else 0.35)
            last_end = lines[-1]["end"]
            if n in FIXED:
                length = FIXED[n]
                if last_end > length - 0.4:
                    print(f"WARNING scene {n}: speech ends at {last_end:.2f}s, too late for its fixed {length}s")
            else:
                length = max(4.0, last_end + TAIL)
            frames = math.ceil(length * FPS)
            buf = np.zeros(int(length * SR) + SR, dtype=np.float32)
            for start, a in clips:
                i = int(start * SR)
                buf[i:i + len(a)] += a[: max(0, len(buf) - i)]
            write_mp3(buf[: int(length * SR)], OUT_V / f"s{n:02d}.mp3")
            title = titles.get(str(n), {}).get("title", f"Scene {n}")
            narr = " ".join(l["text"] for l in lines)
            timing[n] = {"title": title, "text": narr, "startSec": lines[0]["start"], "audioSec": round(last_end - lines[0]["start"], 3),
                         "frames": frames, "lines": lines}
            total += frames / FPS
            words = sum(len(l["text"].split()) for l in lines)
            print(f"scene {n:2d} {frames / FPS:5.1f}s  lines {len(lines):2d}  words {words:3d}  {title}")
    TIMING.write_text(json.dumps(timing, indent=1) + "\n")
    print(f"TOTAL {int(total // 60)}:{int(total % 60):02d} ({total:.1f}s)")
    build_music(total)
    build_sfx()


if __name__ == "__main__":
    main()
