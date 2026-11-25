/**
 * Shared player for vertical shorts (1080x1920): plays one picture per narration beat,
 * word-by-word captions, and scales everything to the composition size.
 *
 * Timing JSON (written by scripts/build-<short>-audio.py):
 *   { total, beats: [{ id, start, end, words: [{ text, start, end }] }] }
 */
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { H, W, pop } from "../airpocket/kit";

export const SHORT_FPS = 30;
export type Word = { text: string; start: number; end: number };
export type TimedBeat = { id: string; start: number; end: number; words: Word[] };
export type Timing = { total: number; beats: TimedBeat[] };
/** Props every beat picture receives: t = seconds since the beat began, w(i) = when word i starts. */
export type BeatProps = { t: number; dur: number; frame: number; w: (i: number) => number };
export type BeatComp = React.FC<BeatProps>;

export const beatOf = (timing: Timing, id: string) => {
  const b = timing.beats.find((x) => x.id === id);
  if (!b) throw new Error(`no beat ${id}`);
  return b;
};
/** absolute time (s) of word i in a beat */
export const wordAt = (timing: Timing, id: string, i: number) => beatOf(timing, id).words[i].start;

const isWord = (w: string) => /[A-Za-z0-9]/.test(w);
type Chunk = { words: Word[]; start: number; end: number };
const chunk = (timing: Timing): Chunk[] => {
  const out: Chunk[] = [];
  for (const b of timing.beats) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    };
    for (const w of b.words) {
      if (!isWord(w.text)) continue;
      cur.push(w);
      if (/[.,…?!:]$/.test(w.text) || cur.length >= 3) flush();
    }
    flush();
  }
  for (let i = 0; i < out.length; i++) out[i].end = Math.min(out[i + 1]?.start ?? Infinity, out[i].end + 0.6);
  return out;
};

/** 1–3 words at a time; the word being spoken turns yellow. */
const Captions: React.FC<{ chunks: Chunk[]; top: number }> = ({ chunks, top }) => {
  const t = useCurrentFrame() / SHORT_FPS;
  const c = chunks.find((k) => t >= k.start - 0.04 && t < k.end);
  if (!c) return null;
  const k = pop(t, c.start - 0.04, 0.18);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 26px",
      transform: `scale(${0.85 + 0.15 * k})`, transformOrigin: "50% 50%" }}>
      {c.words.map((w, i) => (
        <span key={i} style={{
          fontFamily: "Inter", fontWeight: 900, fontSize: 104, lineHeight: 1.15, letterSpacing: -1,
          color: t >= w.start - 0.03 && t < w.end + 0.15 ? "#FFD23F" : "#FFFFFF",
          WebkitTextStroke: "16px #111", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(0,0,0,0.35)",
        }}>{w.text.replace(/[.,…—:]+$/g, "").toUpperCase()}</span>
      ))}
    </div>
  );
};

const BeatView: React.FC<{ beat: TimedBeat; Comp: BeatComp; offset: number }> = ({ beat, Comp, offset }) => {
  const frame = useCurrentFrame();
  const t = frame / SHORT_FPS;
  const w = (i: number) => (beat.words[i]?.start ?? beat.end) - offset;
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: "block" }}>
        <Comp t={t} dur={beat.end - offset} frame={frame} w={w} />
      </svg>
    </AbsoluteFill>
  );
};

/** One sound effect at an absolute time (seconds). */
export const Sfx: React.FC<{ dir: string; file: string; t: number; vol?: number; dur?: number }> = ({ dir, file, t, vol = 0.7, dur }) => (
  <Sequence from={Math.max(0, Math.round(t * SHORT_FPS))} durationInFrames={dur ? Math.max(1, Math.round(dur * SHORT_FPS)) : undefined} layout="none">
    <Audio src={staticFile(`${dir}/${file}.mp3`)} volume={vol} />
  </Sequence>
);

export const ShortPlayer: React.FC<{
  timing: Timing;
  beats: Record<string, BeatComp>;
  captions?: boolean;
  captionTop?: number;
  overlay?: React.ReactNode; // drawn above the pictures, below captions (e.g. the opening title)
  soundtrack?: React.ReactNode;
}> = ({ timing, beats, captions = true, captionTop = 1500, overlay, soundtrack }) => {
  const { width } = useVideoConfig();
  const chunks = React.useMemo(() => chunk(timing), [timing]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", width: W, height: H, transform: `scale(${width / W})`, transformOrigin: "0 0" }}>
        {timing.beats.map((beat, i) => {
          // the first picture starts at frame 0 (no silent black lead-in)
          const offset = i === 0 ? 0 : beat.start;
          const from = Math.round(offset * SHORT_FPS);
          const to = Math.round(beat.end * SHORT_FPS);
          const Comp = beats[beat.id];
          if (!Comp) throw new Error(`no picture for beat ${beat.id}`);
          return (
            <Sequence key={beat.id} from={from} durationInFrames={Math.max(1, to - from)} name={beat.id}>
              <BeatView beat={beat} Comp={Comp} offset={offset} />
            </Sequence>
          );
        })}
        {overlay}
        {captions && <Captions chunks={chunks} top={captionTop} />}
      </div>
      {soundtrack}
    </AbsoluteFill>
  );
};
