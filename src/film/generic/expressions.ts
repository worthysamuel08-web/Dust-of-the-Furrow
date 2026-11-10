/** Facial expression presets for the silhouette face, with deterministic blinks. */
import { NEUTRAL_FACE, blink, type FacePose } from "../../characters/stickman";
import { lerpDeep, smoothstep } from "../../engine/animation";

export type ExprId =
  | "neutral"
  | "tired"
  | "worried"
  | "sad"
  | "happy"
  | "smile"
  | "angry"
  | "shocked"
  | "scared"
  | "determined"
  | "sleeping"
  | "squint"
  | "confused"
  | "relieved"
  | "grimace"
  | "proud"
  | "stern"
  | "shout"
  | "dreamy";

const F = (p: Partial<FacePose>): FacePose => ({ ...NEUTRAL_FACE, eyeOpenL: 0.85, eyeOpenR: 0.85, ...p });

export const EXPRESSIONS: Record<ExprId, FacePose> = {
  neutral: F({}),
  tired: F({ eyeOpenL: 0.58, eyeOpenR: 0.56, browTiltL: 0.3, browTiltR: 0.3, mouthSmile: -0.12 }),
  worried: F({ eyeOpenL: 0.88, eyeOpenR: 0.86, browRaiseL: 0.4, browRaiseR: 0.4, browTiltL: 0.6, browTiltR: 0.6, mouthSmile: -0.35, mouthWidth: 0.24 }),
  sad: F({ eyeOpenL: 0.6, eyeOpenR: 0.58, browRaiseL: 0.15, browRaiseR: 0.15, browTiltL: 0.75, browTiltR: 0.75, mouthSmile: -0.55, lookY: -0.5 }),
  happy: F({ eyeOpenL: 0.78, eyeOpenR: 0.78, browRaiseL: 0.3, browRaiseR: 0.3, mouthSmile: 0.65, mouthWidth: 0.34 }),
  smile: F({ eyeOpenL: 0.72, eyeOpenR: 0.72, mouthSmile: 0.4 }),
  angry: F({ eyeOpenL: 0.7, eyeOpenR: 0.7, browRaiseL: -0.5, browRaiseR: -0.5, browTiltL: -0.65, browTiltR: -0.65, mouthSmile: -0.45 }),
  shocked: F({ eyeOpenL: 1.1, eyeOpenR: 1.1, browRaiseL: 0.9, browRaiseR: 0.9, mouthOpen: 0.6, mouthWidth: 0.24 }),
  scared: F({ eyeOpenL: 1.0, eyeOpenR: 1.0, browRaiseL: 0.7, browRaiseR: 0.7, browTiltL: 0.6, browTiltR: 0.6, mouthOpen: 0.25, mouthSmile: -0.4 }),
  determined: F({ eyeOpenL: 0.78, eyeOpenR: 0.78, browRaiseL: -0.25, browRaiseR: -0.25, browTiltL: -0.3, browTiltR: -0.3, mouthSmile: -0.1 }),
  sleeping: F({ eyeOpenL: 0, eyeOpenR: 0, mouthOpen: 0.08, mouthWidth: 0.2 }),
  squint: F({ eyeOpenL: 0.35, eyeOpenR: 0.33, browRaiseL: -0.3, browRaiseR: -0.3 }),
  confused: F({ eyeOpenL: 0.82, eyeOpenR: 0.72, browRaiseL: 0.75, browRaiseR: -0.1, browTiltL: 0.5, browTiltR: -0.25, mouthSmile: -0.3, mouthOpen: 0.1, mouthWidth: 0.2 }),
  relieved: F({ eyeOpenL: 0.4, eyeOpenR: 0.4, browRaiseL: 0.3, browRaiseR: 0.3, browTiltL: 0.45, browTiltR: 0.45, mouthSmile: 0.3 }),
  grimace: F({ eyeOpenL: 0.45, eyeOpenR: 0.42, browRaiseL: -0.4, browRaiseR: -0.4, browTiltL: -0.3, browTiltR: -0.3, mouthSmile: -0.6, mouthWidth: 0.36 }),
  proud: F({ eyeOpenL: 0.68, eyeOpenR: 0.68, browRaiseL: 0.1, browRaiseR: 0.1, mouthSmile: 0.35 }),
  stern: F({ eyeOpenL: 0.7, eyeOpenR: 0.7, browRaiseL: -0.35, browRaiseR: -0.35, browTiltL: -0.4, browTiltR: -0.4, mouthSmile: -0.2 }),
  shout: F({ eyeOpenL: 0.95, eyeOpenR: 0.95, browRaiseL: 0.4, browRaiseR: 0.4, mouthOpen: 0.8, mouthWidth: 0.26 }),
  dreamy: F({ eyeOpenL: 0.55, eyeOpenR: 0.55, browRaiseL: 0.35, browRaiseR: 0.35, browTiltL: 0.3, browTiltR: 0.3, mouthSmile: 0.3, lookY: 0.4 }),
};

/** An expression timeline: [fraction of the scene, expression] pairs, blended over ~10 frames. */
export type ExprTrack = ExprId | [number, ExprId][];

export const faceAt = (track: ExprTrack, frame: number, duration: number, seed: number, look = 0): FacePose => {
  const keys: [number, ExprId][] = typeof track === "string" ? [[0, track]] : track;
  let face = EXPRESSIONS[keys[0][1]];
  for (let i = 1; i < keys.length; i++) {
    const at = keys[i][0] * duration;
    const t = smoothstep(at - 5, at + 5, frame);
    if (t > 0) face = lerpDeep(face, EXPRESSIONS[keys[i][1]], t);
  }
  // blinks at seeded intervals (never while sleeping)
  const period = 95 + (seed % 5) * 17;
  const offset = (seed * 37) % period;
  const blinks = Array.from({ length: Math.ceil(duration / period) + 1 }, (_, i) => offset + i * period);
  const b = face.eyeOpenL > 0.1 ? blink(frame, blinks) : 1;
  return { ...face, lookX: face.lookX + look, eyeOpenL: face.eyeOpenL * b, eyeOpenR: face.eyeOpenR * b };
};
