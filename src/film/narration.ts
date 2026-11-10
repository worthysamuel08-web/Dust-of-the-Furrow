/**
 * Narration script and a deterministic timing model.
 *
 * Until a voice-over is recorded, word timings are estimated from a steady
 * speaking rate plus pauses at punctuation. Scenes cue their animation from
 * these word times (e.g. "show the card when the narrator says 'reap'"), so when
 * real VO arrives only this file needs to change — swap the estimate for the
 * recording's measured timings and every cue follows.
 *
 * Text is copied verbatim from docs/storyboard.md.
 */

export const SPEECH_WPS = 2.5; // ~150 words per minute
const PAUSE_COMMA = 0.18; // seconds
const PAUSE_STOP = 0.4;

export type SceneNarration = {
  /** Spoken text, verbatim from the storyboard. */
  text: string;
  /** When the narrator starts speaking, in seconds from the start of the scene. */
  startSec: number;
};

export const NARRATION: Record<number, SceneNarration> = {
  1: {
    text: "England, thirteen-twenty. You wake to smoke, straw and cold. You are not a knight, a monk or a merchant. You are a villein, and this is your day.",
    startSec: 1.5, // as the "An English manor · c. 1320" title card fades in
  },
  2: {
    text: "Before this day ends, you'll reap another man's harvest, be summoned to his court, and see what happens to a neighbour who said no.",
    startSec: 0.35,
  },
};

export type TimedWord = { word: string; start: number; end: number };

/** Estimated start/end time (seconds, scene-relative) of every word. */
export const wordTimings = (n: SceneNarration): TimedWord[] => {
  const words = n.text.split(/\s+/);
  let t = n.startSec;
  return words.map((word) => {
    const start = t;
    t += 1 / SPEECH_WPS;
    const end = t;
    if (/[.!?:]["”]?$/.test(word)) t += PAUSE_STOP;
    else if (/[,;]$/.test(word)) t += PAUSE_COMMA;
    return { word, start, end };
  });
};

const clean = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");

/** Frame at which `word` (the nth occurrence) starts being spoken. */
export const wordFrame = (n: SceneNarration, word: string, fps: number, occurrence = 1): number => {
  let seen = 0;
  for (const w of wordTimings(n)) {
    if (clean(w.word) === clean(word) && ++seen === occurrence) return Math.round(w.start * fps);
  }
  throw new Error(`Narration has no word "${word}" (occurrence ${occurrence})`);
};

/** Frame at which the narration finishes. */
export const narrationEndFrame = (n: SceneNarration, fps: number) => {
  const words = wordTimings(n);
  return Math.round(words[words.length - 1].end * fps);
};

export type CaptionChunk = { text: string; start: number; end: number };

/** Subtitle-sized chunks, broken at punctuation (max ~8 words). */
export const captionChunks = (n: SceneNarration, maxWords = 8): CaptionChunk[] => {
  const words = wordTimings(n);
  const chunks: CaptionChunk[] = [];
  let cur: TimedWord[] = [];
  const flush = () => {
    if (!cur.length) return;
    chunks.push({ text: cur.map((w) => w.word).join(" "), start: cur[0].start, end: cur[cur.length - 1].end });
    cur = [];
  };
  for (const w of words) {
    cur.push(w);
    const breakHere = /[.!?:;]["”]?$/.test(w.word) || (/,$/.test(w.word) && cur.length >= 3);
    if (breakHere || cur.length >= maxWords) flush();
  }
  flush();
  return chunks;
};
