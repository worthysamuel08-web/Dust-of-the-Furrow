import { NARRATION, SCENE_TIMING, wordTimings } from "../narration";
import type { ActorSpec } from "../generic/spec";
import type { CastId } from "../generic/cast";
import type { ActionId } from "../generic/actions";

/** Seconds into scene `n` at which the narrator says `word` (nth occurrence). */
export const sec = (n: number, word: string, occurrence = 1): number => {
  const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
  let seen = 0;
  for (const w of wordTimings(NARRATION[n])) if (clean(w.word) === clean(word) && ++seen === occurrence) return w.start;
  throw new Error(`Scene ${n}: narration has no "${word}"`);
};

/** Scene length in seconds (from the audio build). */
export const dur = (n: number) => SCENE_TIMING[n].frames / 30;

/** Shorthand for an actor. */
export const A = (who: CastId, x: number, z: number, act: ActionId, extra: Partial<ActorSpec> = {}): ActorSpec => ({ who, x, z, act, ...extra });

// Cottage marks (see src/environments/cottage/layout.ts)
export const COT = {
  bedEdge: { x: -0.9, z: -1.5 },
  bedLie: { x: -1.52, y: 0.555, z: -1.5 },
  hearth: { x: 0.95, z: 0.4 },
  table: { x: 1.15, z: -1.4 },
  door: { x: 2.35, z: 1.0 },
  floor: { x: 0.2, z: 0.6 },
};
