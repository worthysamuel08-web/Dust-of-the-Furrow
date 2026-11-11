/**
 * The spoken script and its timing.
 *
 * scripts/build-audio.py speaks src/film/script.json (narration + dialogue) and
 * writes src/film/narration-timing.json: for every scene, each line's speaker,
 * text, real start/end in the scene's voice track, and a mouth envelope for
 * lip-sync. scripts/align-words.py then measures when every word is really
 * spoken (speech recognition on the built tracks) into src/film/word-timing.json,
 * so scenes can cue animation exactly on a word ("show the card when the narrator
 * says 'reap'"). Rebuild both after changing the script: every cue follows.
 */
import TIMING from "./narration-timing.json";
import WORDS from "./word-timing.json";

export type SpokenLine = {
  /** "narrator" or a cast id (src/film/generic/cast.ts). */
  who: string;
  text: string;
  /** Seconds from the start of the scene. */
  start: number;
  end: number;
  /** Mouth openness per frame (30 fps, 0..1) for dialogue lines; empty for narration. */
  env: number[];
};

export type SceneNarration = {
  /** All spoken text in the scene, in order. */
  text: string;
  /** When the first line starts, in seconds from the start of the scene. */
  startSec: number;
  /** Length of the spoken part (first line start → last line end). */
  audioSec?: number;
  lines: SpokenLine[];
  /** Measured [start, end] (seconds, scene-relative) of every word, in script order. */
  words?: [number, number][];
};

export type SceneTiming = SceneNarration & { title: string; frames: number };
export const SCENE_TIMING = TIMING as unknown as Record<string, SceneTiming>;

export const NARRATION: Record<number, SceneNarration> = Object.fromEntries(
  Object.entries(SCENE_TIMING).map(([n, t]) => [Number(n), { text: t.text, startSec: t.startSec, audioSec: t.audioSec, lines: t.lines, words: (WORDS as unknown as Record<string, [number, number][]>)[n] }]),
);

/** Path (in /public) of a scene's voice track (narration + dialogue). */
export const narrationFile = (scene: number) => `audio/voice/s${String(scene).padStart(2, "0")}.mp3`;

export type TimedWord = { word: string; start: number; end: number; who: string };

/**
 * Start/end time (seconds, scene-relative) of every word: the measured times
 * when available, otherwise spread across each line by length.
 */
export const wordTimings = (n: SceneNarration): TimedWord[] => {
  const out: TimedWord[] = [];
  const all = n.lines.flatMap((l) => l.text.split(/\s+/).filter(Boolean).map((word) => ({ word, who: l.who })));
  if (n.words && n.words.length === all.length) {
    return all.map((w, i) => ({ ...w, start: n.words![i][0], end: n.words![i][1] }));
  }
  for (const line of n.lines) {
    const words = line.text.split(/\s+/).filter(Boolean);
    const weights = words.map((w) => w.replace(/[^\p{L}\p{N}']/gu, "").length + 2);
    const total = weights.reduce((a, b) => a + b, 0);
    let t = line.start;
    words.forEach((word, i) => {
      const d = ((line.end - line.start) * weights[i]) / total;
      out.push({ word, start: t, end: t + d, who: line.who });
      t += d;
    });
  }
  return out;
};

const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

/** Frame at which `word` (the nth occurrence) starts being spoken. */
export const wordFrame = (n: SceneNarration, word: string, fps: number, occurrence = 1): number => {
  let seen = 0;
  for (const w of wordTimings(n)) {
    if (clean(w.word) === clean(word) && ++seen === occurrence) return Math.round(w.start * fps);
  }
  throw new Error(`Script has no word "${word}" (occurrence ${occurrence})`);
};

/** Frame at which the last line finishes. */
export const narrationEndFrame = (n: SceneNarration, fps: number) => Math.round(n.lines[n.lines.length - 1].end * fps);

/** Mouth openness for a speaker at a given frame (0 when they aren't speaking). */
export const mouthAt = (n: SceneNarration | undefined, who: string, frame: number, fps: number): number => {
  if (!n) return 0;
  const t = frame / fps;
  for (const l of n.lines) {
    if (l.who !== who || t < l.start || t > l.end || !l.env.length) continue;
    const i = Math.min(l.env.length - 1, Math.max(0, Math.round((t - l.start) * fps)));
    return l.env[i];
  }
  return 0;
};

export type CaptionChunk = { text: string; start: number; end: number; who: string };

/** Subtitle-sized chunks: each line, split at punctuation into ≤ 8-word pieces. */
export const captionChunks = (n: SceneNarration, maxWords = 8): CaptionChunk[] => {
  const words = wordTimings(n);
  const chunks: CaptionChunk[] = [];
  let cur: TimedWord[] = [];
  const flush = () => {
    if (!cur.length) return;
    chunks.push({ text: cur.map((w) => w.word).join(" "), start: cur[0].start, end: cur[cur.length - 1].end, who: cur[0].who });
    cur = [];
  };
  words.forEach((w, i) => {
    if (cur.length && cur[0].who !== w.who) flush();
    cur.push(w);
    const lineEnds = i + 1 < words.length && words[i + 1].start - w.end > 0.2;
    const breakHere = /[.!?:;]["”]?$/.test(w.word) || (/,$/.test(w.word) && cur.length >= 3) || lineEnds;
    if (breakHere || cur.length >= maxWords) flush();
  });
  flush();
  return chunks;
};
