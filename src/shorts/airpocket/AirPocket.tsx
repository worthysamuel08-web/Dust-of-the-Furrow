/**
 * "Air Pocket" — a 63-second vertical short (1080x1920, 30 fps) about Harrison Okene,
 * the cook who survived ~60 hours in an air bubble inside a capsized tug (2013).
 *
 * Timing comes from src/shorts/airpocket/timing.json (written by scripts/build-airpocket-audio.py):
 * each beat's picture starts when its narration starts, and actions land on measured word times.
 */
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Loop, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BEATS } from "./beats";
import { H, W, pop } from "./kit";
import TIMING from "./timing.json";

export const AIRPOCKET_FPS = 30;
export const AIRPOCKET_DURATION = Math.ceil(TIMING.total * AIRPOCKET_FPS);

type Word = { text: string; start: number; end: number };
type BeatT = { id: string; start: number; end: number; words: Word[] };
const BEAT_LIST = TIMING.beats as BeatT[];
const beatById = (id: string) => BEAT_LIST.find((b) => b.id === id)!;
/** absolute time (s) of word i of a beat */
const at = (id: string, i: number) => beatById(id).words[i].start;

// ---------- captions: 1–3 words at a time, the spoken word in yellow ----------
const isWord = (w: string) => /[A-Za-z0-9]/.test(w);
type Chunk = { words: Word[]; start: number; end: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const b of BEAT_LIST) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    };
    for (const w of b.words) {
      if (!isWord(w.text)) continue;
      cur.push(w);
      if (/[.,…?!]$/.test(w.text) || cur.length >= 3) flush();
    }
    flush();
  }
  // each chunk stays up until the next one (but not across long silences)
  for (let i = 0; i < out.length; i++) {
    const next = out[i + 1]?.start ?? Infinity;
    out[i].end = Math.min(next, out[i].end + 0.6);
  }
  return out;
})();

const Captions: React.FC = () => {
  const t = useCurrentFrame() / AIRPOCKET_FPS;
  const c = CHUNKS.find((k) => t >= k.start - 0.04 && t < k.end);
  if (!c) return null;
  const k = pop(t, c.start - 0.04, 0.18);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1500, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 26px",
      transform: `scale(${0.85 + 0.15 * k})`, transformOrigin: "50% 50%" }}>
      {c.words.map((w, i) => {
        const active = t >= w.start - 0.03;
        const txt = w.text.replace(/[.,…—]+$/g, "").toUpperCase();
        return (
          <span key={i} style={{
            fontFamily: "Inter", fontWeight: 900, fontSize: 104, lineHeight: 1.15, letterSpacing: -1,
            color: active && t < w.end + 0.15 ? "#FFD23F" : "#FFFFFF",
            WebkitTextStroke: "16px #111", paintOrder: "stroke fill",
            textShadow: "0 8px 0 rgba(0,0,0,0.35)",
          }}>{txt}</span>
        );
      })}
    </div>
  );
};

// ---------- sound ----------
const Sfx: React.FC<{ file: string; t: number; vol?: number; dur?: number }> = ({ file, t, vol = 0.7, dur }) => (
  <Sequence from={Math.round(t * AIRPOCKET_FPS)} durationInFrames={dur ? Math.round(dur * AIRPOCKET_FPS) : undefined} layout="none">
    <Audio src={staticFile(`airpocket/${file}.mp3`)} volume={vol} />
  </Sequence>
);

const Soundtrack: React.FC = () => {
  const b = beatById;
  // same hit times as the KnockBack picture
  const kb = b("knockback");
  const kbFirst = at("knockback", 1);
  const knocks = [0, 0.3, 0.55, 0.8].map((f) => kbFirst + (kb.end - kbFirst) * f);
  const uwFrom = b("sinks").start;
  const uwTo = b("bends").start;
  return (
    <>
      <Audio src={staticFile("airpocket/voice.mp3")} volume={1} />
      <Audio src={staticFile("airpocket/music.mp3")} volume={(f) => interpolate(f / AIRPOCKET_FPS, [0, 1, b("never").start, TIMING.total], [0.22, 0.2, 0.2, 0.05], { extrapolateRight: "clamp" })} />
      {/* opening: under the sea */}
      <Sfx file="underwater" t={0} vol={0.45} dur={b("cook").start} />
      <Sfx file="bubbles" t={0.4} vol={0.35} />
      <Sfx file="whoosh" t={b("cook").start - 0.15} vol={0.35} />
      {/* the storm and the capsize */}
      <Sfx file="storm" t={b("bathroom").start} vol={0.4} dur={b("sinks").start - b("bathroom").start} />
      <Sfx file="boom" t={at("boom", 2)} vol={0.9} />
      <Sfx file="crash" t={at("boom", 2) + 0.05} vol={0.7} />
      <Sfx file="creak" t={at("boom", 6)} vol={0.6} />
      {/* sinking + trapped: one long underwater bed */}
      <Sequence from={Math.round(uwFrom * AIRPOCKET_FPS)} durationInFrames={Math.round((uwTo - uwFrom) * AIRPOCKET_FPS)} layout="none">
        <Loop durationInFrames={28 * AIRPOCKET_FPS} layout="none">
          <Audio src={staticFile("airpocket/underwater.mp3")} volume={0.4} />
        </Loop>
      </Sequence>
      <Sfx file="bubbles" t={b("sinks").start} vol={0.5} />
      <Sfx file="creak" t={b("sinks").start + 1.0} vol={0.45} />
      {/* flashlight dies, heartbeat in the dark */}
      <Sfx file="click" t={at("dark", 2)} vol={0.8} />
      <Sequence from={Math.round(at("dark", 3) * AIRPOCKET_FPS)} durationInFrames={Math.round((at("dark", 7) - at("dark", 3)) * AIRPOCKET_FPS)} layout="none">
        <Loop durationInFrames={Math.round(0.85 * AIRPOCKET_FPS)} layout="none">
          <Audio src={staticFile("airpocket/heart.mp3")} volume={0.8} />
        </Loop>
      </Sequence>
      <Sfx file="riser" t={b("breathe").start} vol={0.35} />
      <Sfx file="whoosh" t={b("airpocket").start - 0.15} vol={0.35} />
      <Sfx file="bubbles" t={b("airpocket").start + 1.2} vol={0.35} />
      <Sfx file="whoosh" t={b("cup").start - 0.15} vol={0.35} />
      {/* knock… knock — and his answer */}
      <Sfx file="knock" t={at("knock", 6)} vol={1} />
      <Sfx file="knock" t={at("knock", 7)} vol={1} />
      {knocks.map((k, i) => <Sfx key={i} file="knock" t={k} vol={0.9} />)}
      <Sfx file="bubbles" t={b("diver").start} vol={0.4} />
      <Sfx file="boom" t={at("diver", 10)} vol={0.35} />
      <Sfx file="whoosh" t={b("bends").start - 0.15} vol={0.35} />
      <Sfx file="hiss" t={b("chamber").start + 0.1} vol={0.45} />
      <Sfx file="hiss" t={at("chamber", 13)} vol={0.35} />
      <Sfx file="shore" t={b("never").start} vol={0.5} />
    </>
  );
};

/** One beat on its own (seconds from its start). */
const BeatView: React.FC<{ beat: BeatT }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const t = frame / AIRPOCKET_FPS;
  const Comp = BEATS[beat.id];
  const w = (i: number) => (beat.words[i]?.start ?? beat.end) - beat.start;
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: "block" }}>
        <Comp t={t} dur={beat.end - beat.start} frame={frame} w={w} />
      </svg>
    </AbsoluteFill>
  );
};

export const AirPocket: React.FC<{ captions?: boolean; audio?: boolean }> = ({ captions = true, audio = true }) => {
  const { fps, width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", width: W, height: H, transform: `scale(${width / W})`, transformOrigin: "0 0" }}>
      {BEAT_LIST.map((beat, i) => {
        const from = i === 0 ? 0 : Math.round(beat.start * fps);
        const to = Math.round(beat.end * fps);
        return (
          <Sequence key={beat.id} from={from} durationInFrames={Math.max(1, to - from)} name={beat.id}>
            <BeatView beat={{ ...beat, start: i === 0 ? 0 : beat.start, words: beat.words.map((w) => ({ ...w })) }} />
          </Sequence>
        );
      })}
      {captions && <Captions />}
      </div>
      {audio && <Soundtrack />}
    </AbsoluteFill>
  );
};
