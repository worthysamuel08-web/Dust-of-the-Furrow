/**
 * Deterministic animation utilities.
 *
 * Everything here is a pure function of the frame number, so Remotion can
 * render any frame in any order (and in parallel) and get identical results.
 * Never use Date.now(), performance.now(), Math.random() or r3f's useFrame()
 * to drive animation.
 */
import { Easing } from "remotion";

export type EasingFn = (t: number) => number;

export const ease = {
  linear: (t: number) => t,
  /** Default: smooth start and stop. */
  inOut: Easing.bezier(0.45, 0, 0.55, 1),
  /** Very gentle, long-tailed ease — good for camera moves. */
  camera: Easing.bezier(0.35, 0, 0.15, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
  /** Heavy body movement: slow start, slight drag at the end. */
  heavy: Easing.bezier(0.6, 0, 0.3, 1),
} satisfies Record<string, EasingFn>;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const clamp01 = (v: number) => clamp(v, 0, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const deg = (d: number) => (d * Math.PI) / 180;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/** 0→1 progress between two frames, eased. */
export const progress = (frame: number, start: number, end: number, fn: EasingFn = ease.inOut) =>
  fn(clamp01((frame - start) / (end - start)));

/** Deterministic sine oscillator: period in frames, phase in cycles. */
export const wave = (frame: number, period: number, phase = 0) =>
  Math.sin((frame / period + phase) * Math.PI * 2);

/** Smooth deterministic pseudo-noise built from incommensurate sines (range ≈ -1..1). */
export const softNoise = (frame: number, seed = 0) =>
  (Math.sin(frame * 0.071 + seed * 12.9898) * 0.5 +
    Math.sin(frame * 0.033 + seed * 78.233) * 0.3 +
    Math.sin(frame * 0.0137 + seed * 37.719) * 0.2);

/** Seeded PRNG (mulberry32). Same seed → same sequence, every render. */
export const seededRandom = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ---------------------------------------------------------------------------
// Keyframing of arbitrary numeric trees (numbers, tuples, nested objects)
// ---------------------------------------------------------------------------

export type DeepPartial<T> = T extends number
  ? number
  : T extends readonly unknown[]
    ? T
    : { [K in keyof T]?: DeepPartial<T[K]> };

/** Linear interpolation of numbers, arrays and nested objects of numbers. */
export function lerpDeep<T>(a: T, b: T, t: number): T {
  if (typeof a === "number") return lerp(a, b as number, t) as T;
  if (Array.isArray(a)) return a.map((v, i) => lerpDeep(v, (b as unknown[])[i], t)) as T;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(a as object)) {
    out[k] = lerpDeep((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], t);
  }
  return out as T;
}

export function mergeDeep<T>(base: T, patch?: DeepPartial<T>): T {
  if (patch === undefined) return base;
  if (typeof base === "number" || Array.isArray(base)) return patch as T;
  const out: Record<string, unknown> = { ...(base as object) };
  for (const k of Object.keys(patch as object)) {
    out[k] = mergeDeep((base as Record<string, unknown>)[k], (patch as Record<string, unknown>)[k] as never);
  }
  return out as T;
}

export type Keyframe<T> = { frame: number; value: T; ease?: EasingFn };

/** Sample a keyframe track. `ease` on a key controls the segment that ENDS at that key. */
export function animate<T>(frame: number, keys: Keyframe<T>[]): T {
  if (frame <= keys[0].frame) return keys[0].value;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (frame < k.frame) {
      const p = keys[i - 1];
      const t = (frame - p.frame) / (k.frame - p.frame);
      return lerpDeep(p.value, k.value, (k.ease ?? ease.inOut)(t));
    }
  }
  return keys[keys.length - 1].value;
}

/**
 * Build a full keyframe track from partial "patches": each key only lists what
 * changes, everything else is carried over from the previous key.
 */
export function buildTrack<T>(
  base: T,
  keys: { frame: number; set?: DeepPartial<T>; ease?: EasingFn }[],
): Keyframe<T>[] {
  let current = base;
  return keys.map((k) => {
    current = mergeDeep(current, k.set);
    return { frame: k.frame, value: current, ease: k.ease };
  });
}
