#!/usr/bin/env python3
"""Build all audio for the short "Air Pocket" (Harrison's three days under the sea).

1. Speaks every beat of NARRATION with Piper, lays the parts out with their pauses
   -> public/airpocket/voice.mp3 (one track for the whole short).
2. Measures every spoken word with faster-whisper (for the word-by-word captions).
3. Synthesises the music bed and the sound effects with ffmpeg (no downloads)
   -> public/airpocket/*.mp3
4. Writes src/shorts/airpocket/timing.json: per beat its start/end (seconds) and
   words [{text, start, end}], plus the total length.

Usage:  HF_HUB_DISABLE_XET=1 /home/user/tts/venv/bin/python3 scripts/build-airpocket-audio.py
"""
import difflib
import json
import math
import os
import pathlib
import re
import subprocess
import tempfile
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "airpocket"
TIMING = ROOT / "src" / "shorts" / "airpocket" / "timing.json"
PIPER = os.environ.get("PIPER_BIN", "/home/user/tts/venv/bin/piper")
VOICES = pathlib.Path(os.environ.get("VOICES_DIR", "/home/user/tts/voices"))
MODEL = VOICES / "en_US-ryan-high.onnx"
SR = 48000
LEAD = 0.6   # silence before the first word
TAIL = 2.2   # after the last word (end card)

# One entry per beat (= one picture). Each part: (text shown in captions, pause after it in seconds).
# Optional "say" overrides how a part is pronounced.
NARRATION = [
    ("hook",      [("Imagine being stuck at the bottom of the sea…", 0.3), ("for three days.", 0.55)]),
    ("cook",      [("This really happened to a cook named Harrison.", 0.45)]),
    ("bathroom",  [("He was just in the bathroom.", 0.35)]),
    ("boom",      [("Then — BOOM.", 0.25), ("A giant wave flips his boat over.", 0.4)]),
    ("sinks",     [("And it sinks.", 0.2), ("All the way down.", 0.5)]),
    ("trapped",   [("Now he's trapped.", 0.2), ("It's dark.", 0.2), ("The water is freezing.", 0.25),
                   ("And he's only in his underwear.", 0.45)]),
    ("dark",      [("His flashlight dies.", 0.25), ("He can't see anything.", 0.3), ("He just keeps praying.", 0.55)]),
    ("breathe",   [("And here's the crazy part…", 0.45), ("he can still breathe.", 0.5)]),
    ("airpocket", [("When the boat flipped, a little bit of air got stuck at the top.", 0.3)]),
    ("cup",       [("Kind of like when you push a cup upside down in water.", 0.25), ("The air stays in.", 0.55)]),
    ("knock",     [("Three days later, he hears something.", 0.35), ("Knock…", 0.5), ("knock.", 0.6)]),
    ("knockback", [("He knocks back as hard as he can.", 0.45)]),
    ("diver",     [("A diver comes in, thinking everyone's gone…", 0.45), ("and sees a hand.", 0.6)]),
    ("bends",     [("But even then, he can't just swim up.", 0.25), ("Coming up too fast could hurt his body.", 0.45)]),
    ("chamber",   [("So they keep him in a special room for almost three more days,", 0.15),
                   ("slowly bringing him back.", 0.55)]),
    ("never",     [("After all that, he said he'd never go near the sea again.", 0.0)]),
]
SAY = {"Then — BOOM.": "Then... BOOM!", "Knock…": "Knock.", "knock.": "Knock."}


def sh(*args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def read_wav(path):
    with wave.open(str(path)) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            a = a.reshape(-1, 2).mean(axis=1)
    return a


def speak(text, tmp):
    spoken = SAY.get(text, text).replace("…", ",").replace("—", ",")
    raw, out = tmp / "raw.wav", tmp / "part.wav"
    subprocess.run([PIPER, "-m", str(MODEL), "-f", str(raw), "--length-scale", "1.04", "--sentence-silence", "0.2"],
                   input=spoken, text=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    sh("ffmpeg", "-y", "-i", str(raw), "-af",
       "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
       f"equalizer=f=150:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-15:TP=-1.5:LRA=6,aresample={SR}",
       "-ac", "1", str(out))
    a = read_wav(out)
    fade = int(0.012 * SR)  # no clicks at the joins
    a[:fade] *= np.linspace(0, 1, fade)
    a[-fade:] *= np.linspace(1, 0, fade)
    return a


def write_mp3(a, path, kbps="160k"):
    with tempfile.TemporaryDirectory() as t:
        wav = pathlib.Path(t) / "s.wav"
        with wave.open(str(wav), "w") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
        sh("ffmpeg", "-y", "-i", str(wav), "-ac", "2", "-b:a", kbps, str(path))


def synth(path, expr, seconds, filters=""):
    cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"aevalsrc={expr}:s=48000:d={seconds}"]
    if filters:
        cmd += ["-af", filters]
    sh(*cmd, "-ac", "2", "-b:a", "128k", str(path))


def noise(path, color, seconds, filters, seed):
    sh("ffmpeg", "-y", "-f", "lavfi", "-i", f"anoisesrc=color={color}:sample_rate=48000:duration={seconds}:seed={seed}:amplitude=0.6",
       "-af", filters, "-ac", "2", "-b:a", "128k", str(path))


def build_sfx(total):
    # tense, pulsing bed in D minor: low drone + a ticking-clock pulse (the film automates its level)
    notes = [(36.71, 0.32), (73.42, 0.22), (110.0, 0.12), (146.83, 0.08), (174.61, 0.06), (220.0, 0.035)]
    parts = [f"{a}*(0.7+0.3*sin(2*PI*t/{9 + i * 4.7:.1f}+{i}))*sin(2*PI*{f}*t+0.4*sin(2*PI*0.13*t))" for i, (f, a) in enumerate(notes)]
    pulse = "0.12*sin(2*PI*55*t)*pow(max(0,sin(PI*t/0.9)),24)"
    synth(OUT / "music.mp3", f"'{'+'.join(parts)}+{pulse}'", math.ceil(total) + 2,
          f"lowpass=f=1100,afade=t=in:d=2,afade=t=out:st={total - 2.5:.2f}:d=2.5,volume=0.7")
    # underwater room tone: muffled rumble that breathes slowly
    noise(OUT / "underwater.mp3", "brown", 30, "lowpass=f=300,volume='0.8+0.35*sin(2*PI*t/5.5)':eval=frame,afade=t=in:d=1.5,afade=t=out:st=28:d=2", 5)
    # storm: wind + rain hiss
    noise(OUT / "storm.mp3", "pink", 12, "highpass=f=120,lowpass=f=5000,volume='0.45+0.3*sin(2*PI*t/2.3)':eval=frame,afade=t=in:d=0.5,afade=t=out:st=10.5:d=1.5", 9)
    # BOOM: a deep hit with a long wash
    synth(OUT / "boom.mp3", "'0.95*sin(2*PI*(32*t+(60/9)*(1-exp(-9*t))))*exp(-2.2*t)'", 3.0, "lowpass=f=500")
    noise(OUT / "crash.mp3", "pink", 3.0, "lowpass=f=2500,volume='1.2*exp(-1.4*t)':eval=frame", 13)
    # metal groan of the hull (slow pitch bend)
    synth(OUT / "creak.mp3", "'0.4*sin(2*PI*(70*t+12*sin(2*PI*0.7*t)))*sin(PI*t/2.5)+0.15*sin(2*PI*(141*t+20*sin(2*PI*0.5*t)))*sin(PI*t/2.5)'",
          2.5, "lowpass=f=900,aecho=0.6:0.5:120:0.4")
    # knock on steel underwater: dull thud + short metallic ring
    synth(OUT / "knock.mp3", "'0.95*sin(2*PI*(90*t+(120/30)*(1-exp(-30*t))))*exp(-18*t)+0.18*sin(2*PI*610*t)*exp(-22*t)+0.1*sin(2*PI*1290*t)*exp(-30*t)'",
          0.7, "lowpass=f=1800,aecho=0.5:0.4:60:0.3")
    # bubbles: short rising blips
    blips = "+".join(f"0.25*sin(2*PI*({f}*(t-{s})+{f * 1.6}*(t-{s})*(t-{s})))*exp(-40*(t-{s}))*gte(t,{s})"
                     for f, s in [(520, 0.0), (680, 0.13), (450, 0.27), (790, 0.36), (600, 0.52), (720, 0.66), (500, 0.8)])
    synth(OUT / "bubbles.mp3", f"'{blips}'", 1.2, "lowpass=f=2400,aecho=0.5:0.3:40:0.3")
    # flashlight click and a fizz-out
    synth(OUT / "click.mp3", "'0.6*sin(2*PI*2200*t)*exp(-80*t)+0.4*sin(2*PI*900*t)*exp(-60*t)'", 0.25, "")
    # heartbeat (lub-dub)
    synth(OUT / "heart.mp3", "'0.9*sin(2*PI*55*t)*exp(-25*t)+0.7*sin(2*PI*50*(t-0.22))*exp(-28*(t-0.22))*gte(t,0.22)'", 0.8, "lowpass=f=200")
    # decompression hiss
    noise(OUT / "hiss.mp3", "white", 3.0, "highpass=f=2500,volume='0.35*min(1,t*3)*min(1,(3-t)*1.5)':eval=frame", 21)
    # whoosh for transitions, a soft riser into the reveal
    noise(OUT / "whoosh.mp3", "pink", 0.8, "highpass=f=300,lowpass=f=4000,volume='0.9*sin(PI*t/0.8)^2':eval=frame,afade=t=out:st=0.6:d=0.2", 41)
    synth(OUT / "riser.mp3", "'0.3*sin(2*PI*(200*t+300*t*t/2))*(t/2)'", 2.0, "afade=t=out:st=1.8:d=0.2")
    # waves on the shore for the end
    noise(OUT / "shore.mp3", "pink", 8, "lowpass=f=1800,volume='0.15+0.6*pow(max(0,sin(2*PI*t/4)),3)':eval=frame,afade=t=in:d=1,afade=t=out:st=6.5:d=1.5", 31)


def align(track, beats):
    """Word start/end from faster-whisper, matched back to the script words."""
    from faster_whisper import WhisperModel
    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(track), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    segs, _ = model.transcribe(audio, word_timestamps=True, beam_size=5, language="en")
    clean = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
    heard = [(clean(w.word), w.start, w.end) for s in segs for w in s.words if clean(w.word)]
    script = [(w, part) for b in beats for part in b["parts"] for w in part["text"].split()]
    a, h = [clean(w) for w, _ in script], [x[0] for x in heard]
    real = [None] * len(script)
    blocks = difflib.SequenceMatcher(None, a, h, autojunk=False).get_matching_blocks()
    for blk in blocks:
        for k in range(blk.size):
            real[blk.a + k] = heard[blk.b + k][1:]
    for i, r in enumerate(real):  # words the recogniser missed: spread inside their own part
        if r:
            continue
        p = script[i][1]
        prev = next((real[j][1] for j in range(i - 1, -1, -1) if real[j] and script[j][1] is p), p["start"])
        nxt = next((real[j][0] for j in range(i + 1, len(script)) if real[j] and script[j][1] is p), p["end"])
        span = [j for j in range(i, len(script)) if not real[j] and script[j][1] is p]
        step = (nxt - prev) / (len(span) + 1)
        real[i] = (prev + step * 0.5, prev + step)
    for i in range(len(real)):  # inside the part's audio, in order, never zero length
        p = script[i][1]
        s0 = min(max(real[i][0], p["start"], real[i - 1][0] if i else 0.0), p["end"] - 0.05)
        real[i] = (s0, min(max(real[i][1], s0 + 0.08), p["end"] + 0.05))
    matched = sum(b.size for b in blocks)
    print(f"aligned: {matched}/{len(script)} words heard")
    k = 0
    for b in beats:
        b["words"] = []
        for part in b["parts"]:
            for w in part["text"].split():
                b["words"].append({"text": w, "start": round(real[k][0], 3), "end": round(real[k][1], 3)})
                k += 1


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    TIMING.parent.mkdir(parents=True, exist_ok=True)
    clips, beats, t0 = [], [], LEAD
    with tempfile.TemporaryDirectory() as t:
        tmp = pathlib.Path(t)
        for beat_id, parts in NARRATION:
            beat = {"id": beat_id, "start": round(t0, 3), "parts": []}
            for text, pause in parts:
                a = speak(text, tmp)
                clips.append((t0, a))
                beat["parts"].append({"text": text, "start": round(t0, 3), "end": round(t0 + len(a) / SR, 3)})
                t0 += len(a) / SR + pause
            beats.append(beat)
    speech_end = beats[-1]["parts"][-1]["end"]
    total = speech_end + TAIL
    buf = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for start, a in clips:
        i = int(start * SR)
        buf[i:i + len(a)] += a
    write_mp3(buf[: int(total * SR)], OUT / "voice.mp3")
    for i, b in enumerate(beats):  # each picture lasts until the next beat starts
        b["end"] = beats[i + 1]["start"] if i + 1 < len(beats) else round(total, 3)
    align(OUT / "voice.mp3", beats)
    build_sfx(total)
    TIMING.write_text(json.dumps({"total": round(total, 3), "beats": beats}, indent=1) + "\n")
    for b in beats:
        print(f"{b['id']:10s} {b['start']:6.2f}–{b['end']:6.2f}  {' '.join(p['text'] for p in b['parts'])}")
    print(f"TOTAL {total:.1f}s")


if __name__ == "__main__":
    main()
