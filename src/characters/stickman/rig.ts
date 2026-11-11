/**
 * Rig definition for the 2D stickman: pose type, proportions, preset poses,
 * and helpers (IK, blinking, breathing).
 *
 * Coordinate system (character-local, metres):
 *   origin = pelvis, +Y = up, +X = the direction the character faces.
 * All angles are in DEGREES, counter-clockwise positive.
 *   - Limbs hang straight down at angle 0.
 *   - shoulder / hip: rotation of the whole limb (shoulder relative to torso, hip relative to root).
 *   - elbow: positive = natural bend (forearm swings forward).
 *   - knee:  positive = natural bend (shin swings backward).
 *   - torso: 0 = upright, +90 = lying on the back with the head towards -X.
 *   - head:  rotation at the neck; negative = chin down (toward facing side).
 */
import { clamp, deg, smoothstep } from "../../engine/animation";

export type ArmPose = { shoulder: number; elbow: number; wrist: number };
export type LegPose = { hip: number; knee: number; ankle: number };

export type FacePose = {
  /** 0 = closed, 1 = wide open. Left/right = screen left/right. */
  eyeOpenL: number;
  eyeOpenR: number;
  /** Gaze offset, -1..1. */
  lookX: number;
  lookY: number;
  /** Eyebrow height, -1 (frown) .. 1 (raised). */
  browRaiseL: number;
  browRaiseR: number;
  /** Eyebrow tilt, -1 (angry, inner end down) .. 1 (worried / tired, inner end up). */
  browTiltL: number;
  browTiltR: number;
  /** -1 frown .. 1 smile */
  mouthSmile: number;
  /** 0 closed .. 1 wide (yawn) */
  mouthOpen: number;
  /** Mouth width relative to head radius (≈0.15..0.5) */
  mouthWidth: number;
  /** Silhouette look extras (optional): ^ ^ eyes, pupil size (0.2..0.75), tear streaks, sweat drop — all 0..1. */
  happyEyes?: number;
  pupil?: number;
  tears?: number;
  sweat?: number;
};

export type StickmanPose = {
  rootX: number;
  rootY: number;
  rootRot: number;
  torso: number;
  /** Subtle chest scale for breathing, ~ -1..1 */
  breath: number;
  head: number;
  /** Where the face points: -1 = 3/4 left, 0 = front, 1 = 3/4 right. Faked head turn. */
  headTurn: number;
  armFar: ArmPose;
  armNear: ArmPose;
  legFar: LegPose;
  legNear: LegPose;
  face: FacePose;
};

export const DIMENSIONS = {
  headRadius: 0.17,
  torsoLength: 0.46,
  neck: 0.035,
  shoulderY: 0.41,
  upperArm: 0.25,
  forearm: 0.23,
  thigh: 0.37,
  shin: 0.35,
  limbWidth: 0.02,
  outline: 0.011,
};

export const NEUTRAL_FACE: FacePose = {
  eyeOpenL: 1,
  eyeOpenR: 1,
  lookX: 0,
  lookY: 0,
  browRaiseL: 0,
  browRaiseR: 0,
  browTiltL: 0,
  browTiltR: 0,
  mouthSmile: 0,
  mouthOpen: 0,
  mouthWidth: 0.3,
  happyEyes: 0,
  pupil: 0.5,
  tears: 0,
  sweat: 0,
};

export const STANDING: StickmanPose = {
  rootX: 0,
  rootY: 0,
  rootRot: 0,
  torso: 0,
  breath: 0,
  head: 0,
  headTurn: 0.55,
  armFar: { shoulder: 6, elbow: 8, wrist: 0 },
  armNear: { shoulder: -4, elbow: 10, wrist: 0 },
  legFar: { hip: -4, knee: 3, ankle: 0 },
  legNear: { hip: 5, knee: 2, ankle: 0 },
  face: NEUTRAL_FACE,
};

/** Asleep on the back, head towards -X, arms resting, legs stretched to +X. */
export const LYING_ON_BACK: StickmanPose = {
  ...STANDING,
  torso: 90,
  head: -6,
  headTurn: 0.45,
  armFar: { shoulder: 2, elbow: 6, wrist: 0 },
  armNear: { shoulder: -3, elbow: 14, wrist: 8 },
  legFar: { hip: 88, knee: 4, ankle: -8 },
  legNear: { hip: 92, knee: 8, ankle: -4 },
  face: {
    ...NEUTRAL_FACE,
    eyeOpenL: 0,
    eyeOpenR: 0,
    browTiltL: 0.15,
    browTiltR: 0.15,
    mouthOpen: 0.1,
    mouthWidth: 0.22,
  },
};

/** Sitting up in bed with legs stretched forward. */
export const SITTING_IN_BED: StickmanPose = {
  ...LYING_ON_BACK,
  torso: -8,
  head: -4,
  headTurn: 0.5,
  armFar: { shoulder: 30, elbow: 40, wrist: 0 },
  armNear: { shoulder: 22, elbow: 58, wrist: -10 },
  legFar: { hip: 86, knee: 6, ankle: -10 },
  legNear: { hip: 90, knee: 10, ankle: -6 },
};

// ---- helpers ----------------------------------------------------------------

/** Rotate a 2D point by `a` degrees. */
export const rot2 = (x: number, y: number, a: number): [number, number] => {
  const r = deg(a);
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
};

/** Shoulder position in root (pelvis) space for a given torso angle. */
export const shoulderPosition = (torso: number) => rot2(0, DIMENSIONS.shoulderY, torso);

/** Head centre in root space (useful for aiming hands at the head). */
export const headCenter = (pose: Pick<StickmanPose, "torso" | "head">) => {
  const [nx, ny] = rot2(0, DIMENSIONS.torsoLength + DIMENSIONS.neck, pose.torso);
  const [hx, hy] = rot2(0.01, DIMENSIONS.headRadius, pose.torso + pose.head);
  return [nx + hx, ny + hy] as [number, number];
};

/**
 * Two-bone IK for an arm: returns shoulder (relative to torso) and elbow angles
 * that put the wrist on `target` (root space). Unreachable targets are clamped.
 */
export const solveArmIK = (
  torso: number,
  target: [number, number],
  /** 1 = elbow bends forward (normal), -1 = elbow points back/up (e.g. hand behind the head). */
  bend: 1 | -1 = 1,
): Pick<ArmPose, "shoulder" | "elbow"> => {
  const { upperArm: l1, forearm: l2 } = DIMENSIONS;
  const [sx, sy] = shoulderPosition(torso);
  const dx = target[0] - sx;
  const dy = target[1] - sy;
  const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  const base = Math.atan2(dy, dx);
  // interior angle at the shoulder (law of cosines); elbow bends "forward" (+X side)
  const a1 = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const a2 = Math.acos(clamp((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));
  const upperDir = base - bend * a1; // world direction of the upper arm
  const shoulderAbs = (upperDir * 180) / Math.PI + 90; // limb hangs down at 0
  return { shoulder: shoulderAbs - torso, elbow: bend * (180 - (a2 * 180) / Math.PI) };
};

/** Forward kinematics: wrist position (root space) for an FK arm pose. */
export const wristPosition = (torso: number, arm: Pick<ArmPose, "shoulder" | "elbow">): [number, number] => {
  const [sx, sy] = shoulderPosition(torso);
  const [ex, ey] = rot2(0, -DIMENSIONS.upperArm, torso + arm.shoulder);
  const [wx, wy] = rot2(0, -DIMENSIONS.forearm, torso + arm.shoulder + arm.elbow);
  return [sx + ex + wx, sy + ey + wy];
};

/**
 * Move the hand towards `target` with weight `w`, travelling in a straight line
 * from wherever the FK pose currently puts it (smoother than blending angles).
 */
export const reachArm = (
  torso: number,
  arm: ArmPose,
  target: [number, number],
  w: number,
  wrist = arm.wrist,
  bend: 1 | -1 = 1,
): ArmPose => {
  if (w <= 0) return arm;
  const from = wristPosition(torso, arm);
  const ik = solveArmIK(torso, [from[0] + (target[0] - from[0]) * w, from[1] + (target[1] - from[1]) * w], bend);
  return { ...ik, wrist: arm.wrist + (wrist - arm.wrist) * w };
};

/** Natural blink: returns an eye-openness multiplier (1 = no effect). */
export const blink = (frame: number, at: number[], duration = 7) => {
  let m = 1;
  for (const f of at) {
    const t = (frame - f) / duration;
    if (t >= 0 && t <= 1) m = Math.min(m, Math.abs(t * 2 - 1) ** 0.7);
  }
  return m;
};

/** Ear visibility as the head turns (hidden when facing front). */
export const earVisibility = (headTurn: number) => smoothstep(0.15, 0.45, Math.abs(headTurn));
