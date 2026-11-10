/**
 * Scene 1 — "The Soil of 1320". All timing lives here (30 fps, 450 frames = 15 s).
 *
 *   0–20     fade up from black
 *   0–80     establishing view of the dim cottage
 *   (camera: four shots, see SCENE1_SHOTS)
 *   70–220   morning light grows through the window
 *   150–200  eyes flutter open
 *   200–240  raises his head
 *   248–318  sits up on the straw mattress
 *   320–352  yawns
 *   355–415  looks around the room, tired and confused
 *   410–450  scratches his head
 */
import { animate, buildTrack, ease, lerp as mix, progress } from "../../engine/animation";
import type { Shot } from "../../engine/shots";
import {
  blink,
  LYING_ON_BACK,
  SITTING_IN_BED,
  headCenter,
  reachArm,
  type FacePose,
  type StickmanPose,
} from "../../characters/stickman";

export const SCENE1_FPS = 30;
export const SCENE1_DURATION = 450;

// ---- shots (house style: several cuts per scene) -----------------------------------
/**
 *   1 · 0–150    wide: the dim cottage, title, morning light starting
 *   2 · 150–245  close-up: his eyes open, he lifts his head
 *   3 · 245–355  medium: he sits up into the sunbeam and yawns
 *   4 · 355–450  closer: he looks around, scratches his head
 */
export const SCENE1_SHOTS: Shot[] = [
  { start: 0, from: [1.75, 1.66, 1.6], to: [1.15, 1.48, 1.05], target: [-1.25, 0.82, -1.4], targetTo: [-1.45, 0.8, -1.45], fov: 42, bokeh: 1.5, range: 2.2, ease: ease.camera },
  { start: 150, from: [-1.7, 1.2, -0.5], to: [-1.78, 1.14, -0.66], target: [-2.12, 0.62, -1.42], fov: 34, bokeh: 6, range: 0.4 },
  { start: 245, from: [-0.95, 1.02, 0.42], to: [-1.0, 1.08, 0.22], target: [-1.6, 0.95, -1.55], fov: 40, bokeh: 4, range: 0.8 },
  { start: 355, from: [-0.9, 1.24, 0.22], to: [-0.95, 1.26, 0.02], target: [-1.48, 1.18, -1.55], fov: 40, bokeh: 4.5, range: 0.55 },
];

// ---- light -------------------------------------------------------------------------

export const sunAt = (frame: number) => 0.1 + 0.9 * progress(frame, 70, 225, ease.inOut);
export const emberAt = (frame: number) => 0.85 - 0.25 * progress(frame, 0, 450, ease.linear);
export const sitUpAt = (frame: number) => progress(frame, 250, 318);
export const fadeInAt = (frame: number) => progress(frame, 0, 22, ease.out);

// ---- body ----------------------------------------------------------------------------

/** Body keyframes. Face is animated on its own track so timings can overlap. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { face: _unusedFace, ...SITTING_BODY } = SITTING_IN_BED;

const BODY = buildTrack<StickmanPose>(LYING_ON_BACK, [
  { frame: 0 },
  { frame: 200 },
  // raise the head: chin to chest, shoulders lift off the mattress a little
  { frame: 240, set: { head: -40, torso: 80, headTurn: 0.55 }, ease: ease.inOut },
  { frame: 250, set: { head: -42, torso: 79 } },
  // push up on the elbow and sit
  {
    frame: 282,
    set: { torso: 44, head: -24, armFar: { shoulder: 10, elbow: 30, wrist: 0 } },
    ease: ease.heavy,
  },
  {
    frame: 318,
    set: { ...SITTING_BODY, head: -2, torso: -4 },
    ease: ease.out,
  },
  // settle into a tired slump
  { frame: 335, set: { torso: -10, head: -8 } },
  // yawn stretches the head back a bit
  { frame: 345, set: { head: 6, torso: -6 } },
  { frame: 356, set: { head: -6, torso: -10 } },
  // look left (towards the window and the head of the bed)
  { frame: 372, set: { headTurn: -0.65, head: 4 }, ease: ease.inOut },
  { frame: 384, set: { headTurn: -0.7, head: 5 } },
  // look right, across the room
  { frame: 400, set: { headTurn: 0.9, head: -3 }, ease: ease.inOut },
  { frame: 410, set: { headTurn: 0.85, head: -2 } },
  // back towards us, puzzled
  { frame: 424, set: { headTurn: 0.25, head: 6, torso: -8 }, ease: ease.inOut },
  { frame: 450, set: { headTurn: 0.2, head: 8 } },
]);

/** Weight (0..1) of the near arm's IK targets. */
const pushWeight = (f: number) => progress(f, 246, 262) * (1 - progress(f, 300, 322));
const scratchWeight = (f: number) => progress(f, 408, 428);

const FACE = buildTrack<FacePose>(LYING_ON_BACK.face, [
  { frame: 0 },
  { frame: 150 },
  // first flutter: a slit, then shut again
  { frame: 160, set: { eyeOpenL: 0.3, eyeOpenR: 0.3, browRaiseL: 0.2, browRaiseR: 0.2, mouthOpen: 0 }, ease: ease.out },
  { frame: 170, set: { eyeOpenL: 0, eyeOpenR: 0 } },
  // properly open, heavy-lidded
  { frame: 192, set: { eyeOpenL: 0.6, eyeOpenR: 0.55, browTiltL: 0.35, browTiltR: 0.35, mouthSmile: -0.15 }, ease: ease.out },
  { frame: 230, set: { eyeOpenL: 0.62, eyeOpenR: 0.6, lookY: -0.6 } },
  // effort of sitting up: squint, grimace
  { frame: 275, set: { eyeOpenL: 0.35, eyeOpenR: 0.3, browRaiseL: -0.4, browRaiseR: -0.4, browTiltL: -0.3, browTiltR: -0.3, mouthSmile: -0.45, mouthWidth: 0.36, lookY: 0 } },
  { frame: 315, set: { eyeOpenL: 0.6, eyeOpenR: 0.6, browRaiseL: 0.05, browRaiseR: 0.05, browTiltL: 0.35, browTiltR: 0.35, mouthSmile: -0.2, mouthWidth: 0.28 } },
  // yawn
  { frame: 324 },
  { frame: 338, set: { eyeOpenL: 0, eyeOpenR: 0, browRaiseL: 0.7, browRaiseR: 0.7, browTiltL: 0.5, browTiltR: 0.5, mouthOpen: 1, mouthWidth: 0.3 }, ease: ease.inOut },
  { frame: 346 },
  { frame: 358, set: { eyeOpenL: 0.55, eyeOpenR: 0.5, browRaiseL: 0.1, browRaiseR: 0.1, browTiltL: 0.4, browTiltR: 0.4, mouthOpen: 0, mouthSmile: -0.2 } },
  // eyes lead the head: glance left, squint at the bright window
  { frame: 364, set: { lookX: -0.9 } },
  { frame: 380, set: { eyeOpenL: 0.4, eyeOpenR: 0.38, browRaiseL: -0.25, browRaiseR: -0.25, browTiltL: -0.1, browTiltR: -0.1 } },
  // glance right
  { frame: 392, set: { lookX: 0.9, eyeOpenL: 0.62, eyeOpenR: 0.6, browRaiseL: 0.15, browRaiseR: 0.15, browTiltL: 0.3, browTiltR: 0.3 } },
  // confused: one brow up, mouth pulled to the side, slightly open
  { frame: 418, set: { lookX: 0.1, lookY: 0.15, eyeOpenL: 0.78, eyeOpenR: 0.7, browRaiseL: 0.75, browRaiseR: -0.1, browTiltL: 0.5, browTiltR: -0.25, mouthSmile: -0.35, mouthOpen: 0.12, mouthWidth: 0.2 } },
  { frame: 450, set: { lookY: 0.25 } },
]);

const BLINKS = [228, 300, 389, 436];

export const characterPoseAt = (frame: number): StickmanPose => {
  const body = animate(frame, BODY);
  const face = animate(frame, FACE);

  // breathing: slow and deep asleep, quicker once awake
  const asleep = 1 - progress(frame, 185, 240);
  const breath = Math.sin((frame / (asleep > 0.5 ? 120 : 95)) * Math.PI * 2);
  body.breath = breath * (0.5 + asleep * 0.5);
  body.torso += breath * 0.8 * asleep;
  body.head += breath * 0.6 * asleep;

  // near arm: plant the hand on the mattress behind the hips while sitting up
  body.armNear = reachArm(body.torso, body.armNear, [-0.27, -0.02], pushWeight(frame), 60);
  // scratching the back of his head
  const scratch = scratchWeight(frame);
  if (scratch > 0) {
    const [hx, hy] = headCenter(body);
    const wiggle = frame > 426 ? Math.sin(frame * 0.9) * 0.018 : 0;
    body.armNear = reachArm(body.torso, body.armNear, [hx - 0.16 + wiggle, hy + 0.13 + wiggle * 0.4], scratch, 200 + wiggle * 500, -1);
    body.headTurn = mix(body.headTurn, body.headTurn - 0.1, scratch);
    body.head += scratch * 4;
  }

  const b = blink(frame, BLINKS);
  return {
    ...body,
    face: { ...face, eyeOpenL: face.eyeOpenL * b, eyeOpenR: face.eyeOpenR * b },
  };
};

/** The scratching arm goes behind the head; swapped while the hand is still in his lap. */
export const nearArmBehindHeadAt = (frame: number) => frame >= 409;

/** Flat-shaded character brightness: dim before dawn, brighter as he rises into the sunbeam. */
export const characterLightAt = (frame: number) => {
  const sun = sunAt(frame);
  const inBeam = progress(frame, 260, 330);
  return 0.74 + 0.16 * sun + 0.1 * inBeam;
};
