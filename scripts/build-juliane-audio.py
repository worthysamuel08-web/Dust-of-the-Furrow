#!/usr/bin/env python3
"""Build all audio for the short "The Girl Who Fell From the Sky" (Juliane Koepcke, LANSA 508, 1971).

1. Speaks every beat of NARRATION with Piper, lays the parts out with their pauses
   -> public/juliane/voice.mp3 (one track for the whole short).
2. Measures every spoken word with faster-whisper (for the word-by-word captions).
3. Synthesises the music bed and the sound effects with ffmpeg (no downloads)
   -> public/juliane/*.mp3
4. Writes src/shorts/juliane/timing.json: per beat its start/end (seconds) and
   words [{text, start, end}], plus the total length.

Usage:  HF_HUB_DISABLE_XET=1 /home/user/tts/venv/bin/python3 scripts/build-juliane-audio.py
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
OUT = ROOT / "public" / "juliane"
TIMING = ROOT / "src" / "shorts" / "juliane" / "timing.json"
PIPER = os.environ.get("PIPER_BIN", "/home/user/tts/venv/bin/piper")
VOICES = pathlib.Path(os.environ.get("VOICES_DIR", "/home/user/tts/voices"))
MODEL = VOICES / "en_US-ryan-high.onnx"
SR = 48000
LEAD = 0.6   # silence before the first word
TAIL = 1.4   # short tail: the ending loops back into the first frame

# One entry per beat (= one picture). Each part: (text shown in captions, pause after it in seconds).
# Optional "say" overrides how a part is pronounced.
NARRATION = [
    # STAKES (first frame: falling, title on screen)
    ("hook",     [("This seventeen-year-old fell three kilometres out of the sky.", 0.2), ("Still strapped to her seat.", 0.25), ("And she lived.", 0.45)]),
    # BIG QUESTION
    ("question", [("How do you survive that, and then eleven days alone in the jungle?", 0.4)]),
    # HEAD FAKE + RE-HOOK
    ("fake",     [("Luck got her to the ground.", 0.3), ("One rule her dad taught her got her out.", 0.5)]),
    # PAYOFF
    ("eve",      [("Christmas Eve, 1971.", 0.2), ("She's flying over the Amazon with her mom.", 0.3)]),
    ("strike",   [("Lightning hits the plane.", 0.2), ("It breaks apart in the air.", 0.3)]),
    ("fall",     [("She falls in her row of seats, spinning into the trees.", 0.45)]),
    ("wakes",    [("She wakes up alone.", 0.3), ("Her mom is gone.", 0.5)]),
    ("hurt",     [("Broken collarbone.", 0.15), ("Cut arm.", 0.15), ("One sandal.", 0.4)]),
    ("rule",     [("So she uses the rule.", 0.25), ("Find water.", 0.2), ("Follow it downstream.", 0.3)]),
    ("rivers",   [("Streams lead to rivers.", 0.2), ("Rivers lead to people.", 0.4)]),
    ("maggots",  [("Flies lay eggs in her cut.", 0.2), ("Maggots start to grow.", 0.4)]),
    ("hut",      [("Then she finds a hut, a boat, and fuel.", 0.3)]),
    ("dog",      [("Her dad once poured fuel on a sick dog's wound.", 0.25), ("So she pours it on hers.", 0.2), ("The maggots crawl out.", 0.4)]),
    ("found",    [("The next day, local men find her.", 0.4)]),
    # CLOSE (loops back to the first frame)
    ("end",      [("Ninety-one people died that day.", 0.3), ("Only one walked out of the jungle.", 0.0)]),
]
SAY = {"Christmas Eve, 1971.": "Christmas Eve, nineteen seventy-one."}


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
    # tense bed in E minor with a soft heartbeat-like pulse (the film automates its level)
    notes = [(41.2, 0.30), (82.41, 0.2), (123.47, 0.11), (164.81, 0.08), (196.0, 0.05), (246.94, 0.035)]
    parts = [f"{a}*(0.7+0.3*sin(2*PI*t/{8 + i * 5.1:.1f}+{i}))*sin(2*PI*{f}*t+0.4*sin(2*PI*0.11*t))" for i, (f, a) in enumerate(notes)]
    pulse = "0.10*sin(2*PI*62*t)*pow(max(0,sin(PI*t/0.8)),26)"
    synth(OUT / "music.mp3", f"'{'+'.join(parts)}+{pulse}'", math.ceil(total) + 2,
          f"lowpass=f=1200,afade=t=in:d=1,afade=t=out:st={total - 2:.2f}:d=2,volume=0.7")
    # rushing wind while falling
    noise(OUT / "wind.mp3", "pink", 8, "highpass=f=200,lowpass=f=3500,volume='0.6+0.35*sin(2*PI*t/1.3)':eval=frame,afade=t=in:d=0.2,afade=t=out:st=7:d=1", 3)
    # airliner cabin: four propellers droning
    synth(OUT / "props.mp3", "'0.25*sin(2*PI*92*t)+0.15*sin(2*PI*184*t)+0.08*sin(2*PI*276*t)+0.1*sin(2*PI*93.5*t)'", 6, "lowpass=f=600,afade=t=in:d=0.5,afade=t=out:st=5:d=1")
    # thunder: crack + long rumble
    noise(OUT / "thunder.mp3", "brown", 4, "lowpass=f=400,volume='1.6*exp(-0.9*t)':eval=frame", 17)
    noise(OUT / "crack.mp3", "white", 0.5, "highpass=f=1200,volume='1.2*exp(-9*t)':eval=frame", 19)
    synth(OUT / "boom.mp3", "'0.95*sin(2*PI*(32*t+(60/9)*(1-exp(-9*t))))*exp(-2.2*t)'", 3.0, "lowpass=f=500")
    # landing in the trees: leaves rustle + thud
    noise(OUT / "leaves.mp3", "pink", 1.6, "highpass=f=900,lowpass=f=6000,volume='1.0*exp(-2.2*t)*(0.6+0.4*sin(2*PI*14*t))':eval=frame", 23)
    # jungle: insects (pulsing high hiss) + bird chirps
    chirps = "+".join(f"0.18*sin(2*PI*({f}*(t-{s})+{f * 0.8}*(t-{s})*(t-{s})))*exp(-14*(t-{s}))*gte(t,{s})" for f, s in
                      [(2400, 0.7), (2900, 0.85), (2100, 3.2), (3100, 3.3), (2600, 6.1), (2300, 8.4), (3300, 8.5), (2700, 11.2), (2200, 13.9), (3000, 14.0), (2500, 16.6), (2800, 19.3)])
    synth(OUT / "birds.mp3", f"'{chirps}'", 22, "aecho=0.6:0.4:180:0.3")
    noise(OUT / "insects.mp3", "white", 22, "highpass=f=4500,lowpass=f=7500,volume='0.18*(0.6+0.4*sin(2*PI*7*t))':eval=frame,afade=t=in:d=1,afade=t=out:st=20:d=2", 29)
    # water: wading steps
    steps = "+".join(f"0.5*sin(2*PI*(180*(t-{s})+400*(t-{s})*(t-{s})))*exp(-16*(t-{s}))*gte(t,{s})" for s in [0.1, 0.75, 1.4, 2.05, 2.7, 3.35])
    synth(OUT / "wade.mp3", f"'{steps}'", 4.0, "lowpass=f=1200,aecho=0.5:0.4:50:0.3")
    noise(OUT / "stream.mp3", "pink", 10, "highpass=f=600,lowpass=f=4000,volume='0.25+0.08*sin(2*PI*t/1.7)':eval=frame,afade=t=in:d=0.5,afade=t=out:st=9:d=1", 37)
    # fly buzz
    synth(OUT / "buzz.mp3", "'0.3*sin(2*PI*(220*t+6*sin(2*PI*9*t)))*(0.6+0.4*sin(2*PI*3*t))+0.12*sin(2*PI*(440*t+12*sin(2*PI*9*t)))'", 3.0, "afade=t=in:d=0.3,afade=t=out:st=2.4:d=0.6")
    # pouring liquid
    noise(OUT / "pour.mp3", "pink", 2.2, "bandpass=f=900:w=500,volume='0.9*(0.6+0.4*sin(2*PI*11*t))':eval=frame,afade=t=in:d=0.1,afade=t=out:st=1.8:d=0.4", 43)
    # heartbeat, bell (the one survivor), whoosh, riser, sting
    synth(OUT / "heart.mp3", "'0.9*sin(2*PI*55*t)*exp(-25*t)+0.7*sin(2*PI*50*(t-0.22))*exp(-28*(t-0.22))*gte(t,0.22)'", 0.8, "lowpass=f=200")
    bell = "+".join(f"{a}*sin(2*PI*{f}*t)*exp(-{d}*t)" for f, a, d in [(523.25, 0.5, 0.8), (1046.5, 0.25, 1.2), (1318.5, 0.15, 1.6), (1568, 0.1, 2.2)])
    synth(OUT / "bell.mp3", f"'{bell}'", 3, "volume=0.8")
    noise(OUT / "whoosh.mp3", "pink", 0.8, "highpass=f=300,lowpass=f=4000,volume='0.9*sin(PI*t/0.8)^2':eval=frame,afade=t=out:st=0.6:d=0.2", 41)
    synth(OUT / "riser.mp3", "'0.3*sin(2*PI*(200*t+300*t*t/2))*(t/2)'", 2.0, "afade=t=out:st=1.8:d=0.2")
    synth(OUT / "sting.mp3", "'0.5*sin(2*PI*(55*t+(40/8)*(1-exp(-8*t))))*exp(-1.8*t)+0.2*sin(2*PI*110*t)*exp(-2*t)'", 2.5, "lowpass=f=700")


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
