/**
 * Scene 2 — "Three Promises". 30 fps, 360 frames = 12 s (from docs/storyboard.md).
 *
 * Walter sits on the foot of the bed. As the narrator names each promise, a
 * card lands beside him; his eyes flick to it first and his head follows. On
 * the final word his brow knits. Half a second of black ends the scene.
 *
 * Every cue is derived from the narration's word timings (src/film/narration.ts),
 * so recording the real voice-over only means updating those timings.
 */
import {
  SITTING_IN_BED,
  reachArm,
  solveArmIK,
  blink,
  type FacePose,
  type StickmanPose,
} from "../../characters/stickman";
import { animate, buildTrack, ease, progress } from "../../engine/animation";
import type { Shot } from "../../engine/shots";
import { NARRATION, narrationEndFrame, wordFrame } from "../../film/narration";

export const SCENE2_FPS = 30;
export const SCENE2_DURATION = 360;

const N = NARRATION[2];
const f = (word: string) => wordFrame(N, word, SCENE2_FPS);

/** The three promises, cued on the key word of each clause. */
export const CARD_CUES = [f("reap"), f("summoned"), f("see")] as const;
/** Brow knits on the last word, "no". */
export const KNIT_FRAME = f("no");
export const NARRATION_END = narrationEndFrame(N, SCENE2_FPS);
/** Cut to black for the final half second. */
export const BLACK_FROM = SCENE2_DURATION - 15;

// ---- where Walter sits --------------------------------------------------------
/** Pelvis on the foot end of the bed; legs hang over the footboard. */
export const SEAT = { x: -0.9, y: 0.66, z: -1.5 } as const;

// ---- shots: a hard cut lands with each promise ------------------------------------
const [CUE1, CUE2, CUE3] = CARD_CUES;
export const SCENE2_SHOTS: Shot[] = [
  // medium-wide: Walter in the left third, room on the right for the cards
  { start: 0, from: [-1.2, 1.05, 0.78], to: [-1.16, 1.05, 0.6], target: [-0.42, 0.95, -1.5], fov: 40, bokeh: 3.5, range: 0.8 },
  // "another man's harvest": closer three-quarter shot
  { start: CUE1, from: [-1.1, 1.16, 0.32], to: [-1.07, 1.16, 0.18], target: [-0.38, 1.08, -1.5], fov: 38, bokeh: 4.5, range: 0.6 },
  // "summoned to his court": close-up on the worry
  { start: CUE2, from: [-1.0, 1.3, -0.3], to: [-1.0, 1.29, -0.42], target: [-0.58, 1.24, -1.5], fov: 34, bokeh: 6.5, range: 0.38 },
  // "a neighbour who said no": medium close, slow push to the knitted brow
  { start: CUE3, from: [-1.08, 1.2, 0.1], to: [-1.02, 1.2, -0.2], target: [-0.42, 1.06, -1.5], fov: 38, bokeh: 5.5, range: 0.45 },
];

/** Darkens the 3D set as the promises get heavier ("dim dawn"), keeping focus on the cards. */
export const setDimAt = (frame: number) =>
  0.08 + CARD_CUES.reduce((acc, cue) => acc + 0.075 * progress(frame, cue, cue + 20), 0);

// ---- the cards ----------------------------------------------------------------------
/** 0 → 1 entrance of card i. */
export const cardInAt = (frame: number, i: number) => progress(frame, CARD_CUES[i], CARD_CUES[i] + 12, ease.out);
/** 0 → 1 as card i moves from the "featured" position into the fan, when the next card arrives. */
export const cardSettleAt = (frame: number, i: number) =>
  i + 1 < CARD_CUES.length ? progress(frame, CARD_CUES[i + 1] - 4, CARD_CUES[i + 1] + 14, ease.inOut) : 0;

// ---- Walter ---------------------------------------------------------------------------
const { face: _sittingFace, ...SITTING_BODY } = SITTING_IN_BED;

/** Sitting on the edge: thighs forward, shins hanging, hands resting near the knees. */
const SEATED_ON_EDGE: Omit<StickmanPose, "face"> = {
  ...SITTING_BODY,
  torso: -7,
  head: -8,
  headTurn: 0.35,
  legFar: { hip: 86, knee: 88, ankle: 2 },
  legNear: { hip: 92, knee: 84, ankle: -8 },
  armFar: { shoulder: 0, elbow: 0, wrist: 0 },
  armNear: { shoulder: 0, elbow: 0, wrist: 0 },
};

const TIRED_FACE: FacePose = {
  ...SITTING_IN_BED.face,
  eyeOpenL: 0.6,
  eyeOpenR: 0.58,
  lookX: 0.1,
  lookY: -0.3,
  browRaiseL: 0.05,
  browRaiseR: 0.05,
  browTiltL: 0.32,
  browTiltR: 0.32,
  mouthSmile: -0.15,
  mouthOpen: 0,
  mouthWidth: 0.26,
};

const [C1, C2, C3] = CARD_CUES;

/** The head follows the eyes ~5 frames later. */
const BODY = buildTrack<Omit<StickmanPose, "face">>(SEATED_ON_EDGE, [
  { frame: 0 },
  { frame: C1 + 4 },
  { frame: C1 + 16, set: { headTurn: 0.72, head: -2 }, ease: ease.out },
  { frame: C2 - 2, set: { headTurn: 0.62, head: -4 } },
  { frame: C2 + 14, set: { headTurn: 0.8, head: 3, torso: -9 }, ease: ease.out },
  { frame: C3 - 2, set: { headTurn: 0.7, head: 1 } },
  { frame: C3 + 14, set: { headTurn: 0.85, head: 0, torso: -10 }, ease: ease.out },
  { frame: KNIT_FRAME, set: { headTurn: 0.82 } },
  { frame: KNIT_FRAME + 18, set: { head: -9, headTurn: 0.6, torso: -12 }, ease: ease.inOut },
  { frame: SCENE2_DURATION },
]);

const FACE = buildTrack<FacePose>(TIRED_FACE, [
  { frame: 0 },
  // eyes flick to card 1, then curiosity
  { frame: C1 },
  { frame: C1 + 4, set: { lookX: 1, lookY: 0.1, eyeOpenL: 0.78, eyeOpenR: 0.76 }, ease: ease.out },
  { frame: C1 + 16, set: { browRaiseL: 0.35, browRaiseR: 0.3, browTiltL: 0.2, browTiltR: 0.2 } },
  { frame: C2 - 4, set: { lookX: 0.45, lookY: -0.1 } },
  // card 2: worry
  { frame: C2 + 4, set: { lookX: 1, lookY: 0.15, eyeOpenL: 0.85, eyeOpenR: 0.82 }, ease: ease.out },
  { frame: C2 + 18, set: { browRaiseL: 0.55, browRaiseR: 0.5, browTiltL: 0.55, browTiltR: 0.55, mouthSmile: -0.3, mouthWidth: 0.22 } },
  { frame: C3 - 4, set: { lookX: 0.5, lookY: 0 } },
  // card 3: eyes widen
  { frame: C3 + 4, set: { lookX: 1, lookY: 0.05, eyeOpenL: 0.95, eyeOpenR: 0.92 }, ease: ease.out },
  { frame: C3 + 16, set: { mouthOpen: 0.08 } },
  // "...who said no." — brow knits: lowered, inner ends pulled down, eyes narrowed, mouth tight
  { frame: KNIT_FRAME },
  {
    frame: KNIT_FRAME + 12,
    set: {
      browRaiseL: -0.5,
      browRaiseR: -0.45,
      browTiltL: -0.45,
      browTiltR: -0.4,
      eyeOpenL: 0.55,
      eyeOpenR: 0.52,
      lookX: 0.7,
      lookY: -0.2,
      mouthSmile: -0.5,
      mouthOpen: 0,
      mouthWidth: 0.2,
    },
    ease: ease.out,
  },
  { frame: SCENE2_DURATION },
]);

const BLINKS = [46, C2 - 12, C3 - 12];

export const characterPoseAt = (frame: number): StickmanPose => {
  const body = animate(frame, BODY) as StickmanPose;
  const face = animate(frame, FACE);

  // awake, slightly anxious breathing
  const breath = Math.sin((frame / 84) * Math.PI * 2);
  body.breath = breath * 0.7;
  body.torso += breath * 0.5;

  // hands rest on the thighs, just behind the knees (knee sits at x≈0.37 in pelvis space)
  body.armNear = reachArm(body.torso, body.armNear, [0.27, 0.045], 1, -20);
  const far = solveArmIK(body.torso, [0.22, 0.06]);
  body.armFar = { ...far, wrist: -15 };
  // the near hand tightens on the knee when the brow knits
  body.armNear.wrist += -12 * progress(frame, KNIT_FRAME, KNIT_FRAME + 12);

  const b = blink(frame, BLINKS);
  return { ...body, face: { ...face, eyeOpenL: face.eyeOpenL * b, eyeOpenR: face.eyeOpenR * b } };
};

/** Continuity with the end of Scene 1: full morning light, the character lit to match. */
export const SUN = 1;
export const EMBER = 0.6;
export const characterLightAt = (frame: number) => 1.0 - 0.08 * progress(frame, C1, KNIT_FRAME);
