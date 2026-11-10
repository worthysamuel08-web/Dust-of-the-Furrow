/**
 * Multi-shot camera work within one scene: a list of shots, each with its own
 * camera move, lens and depth of field. Hard cut at each shot's start frame.
 */
import { headCenter, type StickmanPose } from "../characters/stickman";
import { ease, lerp, progress, type EasingFn } from "./animation";
import type { Vec3 } from "./CameraRig";

export type Shot = {
  /** First frame of the shot (scene-relative). The shot lasts until the next one starts. */
  start: number;
  /** Camera position at the start and end of the shot. */
  from: Vec3;
  to?: Vec3;
  /** Look-at point at the start and end of the shot. */
  target: Vec3;
  targetTo?: Vec3;
  fov: number;
  /** Depth of field: blur size and in-focus depth (metres). */
  bokeh: number;
  range: number;
  ease?: EasingFn;
};

export type ShotState = { index: number; position: Vec3; target: Vec3; fov: number; bokeh: number; range: number; local: number };

const mix3 = (a: Vec3, b: Vec3 | undefined, t: number): Vec3 => (b ? (a.map((v, i) => lerp(v, b[i], t)) as Vec3) : a);

export const shotAt = (shots: Shot[], frame: number, sceneEnd: number): ShotState => {
  let index = 0;
  for (let i = 0; i < shots.length; i++) if (frame >= shots[i].start) index = i;
  const s = shots[index];
  const end = shots[index + 1]?.start ?? sceneEnd;
  const t = progress(frame, s.start, end, s.ease ?? ease.inOut);
  return {
    index,
    position: mix3(s.from, s.to, t),
    target: mix3(s.target, s.targetTo, t),
    fov: s.fov,
    bokeh: s.bokeh,
    range: s.range,
    local: frame - s.start,
  };
};

/** Yaw that keeps a flat 2D character's plane turned partly towards the camera. */
export const faceCameraYaw = (camera: Vec3, at: { x: number; z: number }, amount = 0.55, max = 0.35) => {
  const toCam = Math.atan2(camera[0] - at.x, camera[2] - at.z);
  return Math.max(-max, Math.min(max, toCam * amount));
};

/** World position of a character's head centre (for focusing the lens on the face). */
export const headWorld = (pose: StickmanPose, at: { x: number; y: number; z: number }, yaw: number, scale = 1): Vec3 => {
  const [hx, hy] = headCenter(pose);
  const x = (pose.rootX + hx) * scale;
  return [at.x + x * Math.cos(yaw), at.y + (pose.rootY + hy) * scale, at.z - x * Math.sin(yaw)];
};
