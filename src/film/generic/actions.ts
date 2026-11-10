/**
 * A library of deterministic body actions for the stickman rig. Each returns a
 * body pose (no face) and the pelvis height above the ground for that action.
 * `f` = frames since the scene started; `seed` offsets cycles so a crowd
 * doesn't move in lockstep.
 */
import { LYING_ON_BACK, STANDING, type StickmanPose } from "../../characters/stickman";

export type Body = Omit<StickmanPose, "face">;
export type ActionId =
  | "stand"
  | "walk"
  | "run"
  | "reap"
  | "bind"
  | "glean"
  | "kneel"
  | "pray"
  | "sit"
  | "sitBed"
  | "sitDespair"
  | "eat"
  | "spin"
  | "point"
  | "crossArms"
  | "akimbo"
  | "carry"
  | "hold"
  | "blowHorn"
  | "wave"
  | "talk"
  | "gesture"
  | "shrug"
  | "lie"
  | "crouch"
  | "drink"
  | "lead"
  | "reach";

const { face: _f, ...STAND } = STANDING;
const { face: _l, ...LIE } = LYING_ON_BACK;

export const STAND_PELVIS = 0.77;

const S = (a: number) => Math.sin(a);
const TAU = Math.PI * 2;

const withArms = (b: Body, near: Partial<Body["armNear"]>, far: Partial<Body["armFar"]>): Body => ({
  ...b,
  armNear: { ...b.armNear, ...near },
  armFar: { ...b.armFar, ...far },
});

const SIT_LEGS: Pick<Body, "legNear" | "legFar"> = {
  legNear: { hip: 92, knee: 90, ankle: -2 },
  legFar: { hip: 86, knee: 86, ankle: 0 },
};

export const actionPose = (action: ActionId, f: number, seed = 0): { body: Body; pelvis: number } => {
  const ph = seed * 1.7;
  const breathe = S(f / 70 * TAU + ph);
  const base: Body = { ...STAND, breath: breathe * 0.6, torso: STAND.torso + breathe * 0.4 };
  switch (action) {
    case "stand":
      return { body: base, pelvis: STAND_PELVIS };
    case "walk":
    case "lead":
    case "run": {
      const run = action === "run";
      const P = run ? 16 : 26;
      const a = (f / P) * TAU + ph;
      const amp = run ? 34 : 24;
      const body: Body = {
        ...base,
        torso: run ? -14 : -4,
        legNear: { hip: amp * S(a), knee: 8 + (run ? 45 : 30) * Math.max(0, S(a - 1.4)), ankle: -6 * S(a) },
        legFar: { hip: -amp * S(a), knee: 8 + (run ? 45 : 30) * Math.max(0, S(a + Math.PI - 1.4)), ankle: 6 * S(a) },
        armNear:
          action === "lead"
            ? { shoulder: 55, elbow: 20, wrist: 0 }
            : { shoulder: -(run ? 40 : 22) * S(a), elbow: run ? 70 : 18, wrist: 0 },
        armFar: { shoulder: (run ? 40 : 22) * S(a), elbow: run ? 70 : 18, wrist: 0 },
      };
      return { body, pelvis: STAND_PELVIS - 0.02 * Math.abs(S(a)) - (run ? 0.03 : 0) };
    }
    case "reap": {
      const a = (f / 40) * TAU + ph;
      const body: Body = {
        ...base,
        torso: -38 + 6 * S(a),
        head: 18,
        legNear: { hip: 22, knee: 28, ankle: -10 },
        legFar: { hip: -16, knee: 22, ankle: 6 },
        armFar: { shoulder: 85 + 12 * S(a + 1), elbow: 25, wrist: 0 },
        armNear: { shoulder: 55 + 45 * S(a), elbow: 35 + 20 * S(a + 1.2), wrist: 20 },
      };
      return { body, pelvis: 0.7 };
    }
    case "bind": {
      const a = (f / 34) * TAU + ph;
      const body: Body = {
        ...base,
        torso: -55 + 4 * S(a),
        head: 25,
        legNear: { hip: 28, knee: 32, ankle: -10 },
        legFar: { hip: -10, knee: 26, ankle: 4 },
        armNear: { shoulder: 70 + 10 * S(a), elbow: 45 + 20 * S(a * 2), wrist: 0 },
        armFar: { shoulder: 80 - 10 * S(a), elbow: 40 + 15 * S(a * 2 + 1), wrist: 0 },
      };
      return { body, pelvis: 0.66 };
    }
    case "glean":
    case "reach": {
      const a = (f / 46) * TAU + ph;
      const body: Body = {
        ...base,
        torso: -72 + 6 * S(a),
        head: 30,
        legNear: { hip: 30, knee: 38, ankle: -10 },
        legFar: { hip: -12, knee: 30, ankle: 4 },
        armNear: { shoulder: 72 + 18 * S(a), elbow: 15, wrist: 0 },
        armFar: { shoulder: 60 + 10 * S(a + 2), elbow: 60, wrist: 0 },
      };
      return { body, pelvis: 0.62 };
    }
    case "kneel":
    case "pray": {
      const body: Body = {
        ...base,
        torso: -4 + breathe * 0.5,
        head: action === "pray" ? -14 : -4,
        legNear: { hip: 2, knee: 92, ankle: 0 },
        legFar: { hip: -4, knee: 88, ankle: 0 },
        armNear: action === "pray" ? { shoulder: 48, elbow: 105, wrist: 30 } : { shoulder: 35, elbow: 60, wrist: 0 },
        armFar: action === "pray" ? { shoulder: 44, elbow: 100, wrist: 30 } : { shoulder: 30, elbow: 55, wrist: 0 },
      };
      return { body, pelvis: 0.42 };
    }
    case "sit":
    case "eat":
    case "spin":
    case "sitDespair": {
      let body: Body = { ...base, ...SIT_LEGS, torso: -6 + breathe * 0.5 };
      body = withArms(body, { shoulder: 28, elbow: 62, wrist: -10 }, { shoulder: 22, elbow: 55, wrist: -10 });
      if (action === "eat") {
        const a = (f / 52) * TAU + ph;
        const up = Math.max(0, S(a));
        body = withArms(body, { shoulder: 35 + 35 * up, elbow: 70 + 65 * up, wrist: 10 }, { shoulder: 40, elbow: 75 });
      }
      if (action === "spin") {
        const a = (f / 20) * TAU + ph;
        body = withArms(body, { shoulder: 25, elbow: 85 + 6 * S(a), wrist: 25 * S(a) }, { shoulder: 115, elbow: 50, wrist: 0 });
      }
      if (action === "sitDespair") {
        body = { ...body, torso: -28, head: -22 };
        body = withArms(body, { shoulder: 58, elbow: 118 }, { shoulder: 54, elbow: 114 });
      }
      return { body, pelvis: 0.48 };
    }
    case "sitBed": {
      const body: Body = {
        ...withArms(base, { shoulder: 30, elbow: 60, wrist: -20 }, { shoulder: 26, elbow: 58, wrist: -15 }),
        torso: -8 + breathe * 0.5,
        legFar: { hip: 86, knee: 88, ankle: 2 },
        legNear: { hip: 92, knee: 84, ankle: -8 },
      };
      return { body, pelvis: 0.66 };
    }
    case "lie":
      return { body: { ...LIE, breath: breathe * 0.8, torso: LIE.torso + breathe * 0.8 }, pelvis: 0 };
    case "crouch":
      return {
        body: withArms({ ...base, torso: -25, legNear: { hip: 95, knee: 120, ankle: 20 }, legFar: { hip: 80, knee: 115, ankle: 20 } }, { shoulder: 70, elbow: 40 }, { shoulder: 55, elbow: 60 }),
        pelvis: 0.4,
      };
    case "point":
      return { body: withArms(base, { shoulder: 92, elbow: 2, wrist: 0 }, { shoulder: 4, elbow: 12 }), pelvis: STAND_PELVIS };
    case "crossArms":
      return { body: withArms(base, { shoulder: 28, elbow: 128, wrist: 10 }, { shoulder: 32, elbow: 122, wrist: 10 }), pelvis: STAND_PELVIS };
    case "akimbo":
      return { body: withArms(base, { shoulder: -25, elbow: 105, wrist: 20 }, { shoulder: -20, elbow: 100, wrist: 20 }), pelvis: STAND_PELVIS };
    case "carry":
      return { body: withArms(base, { shoulder: 48, elbow: 72, wrist: 0 }, { shoulder: 44, elbow: 68 }), pelvis: STAND_PELVIS };
    case "hold":
      return { body: withArms(base, { shoulder: 36, elbow: 98, wrist: 10 }, { shoulder: 30, elbow: 90, wrist: 10 }), pelvis: STAND_PELVIS };
    case "drink":
      return { body: withArms({ ...base, head: 10 }, { shoulder: 62, elbow: 132, wrist: 25 }, { shoulder: 6, elbow: 14 }), pelvis: STAND_PELVIS };
    case "blowHorn":
      return { body: withArms({ ...base, head: 14, torso: 4 }, { shoulder: 58, elbow: 136, wrist: 30 }, { shoulder: 10, elbow: 20 }), pelvis: STAND_PELVIS };
    case "wave": {
      const a = (f / 14) * TAU + ph;
      return { body: withArms(base, { shoulder: 158 + 14 * S(a), elbow: 22, wrist: 10 * S(a) }, { shoulder: 6, elbow: 12 }), pelvis: STAND_PELVIS };
    }
    case "talk": {
      const a = (f / 32) * TAU + ph;
      return {
        body: withArms({ ...base, head: 3 * S(a * 1.3) }, { shoulder: 32 + 14 * S(a), elbow: 70 + 22 * S(a + 1), wrist: 10 }, { shoulder: 10, elbow: 25 }),
        pelvis: STAND_PELVIS,
      };
    }
    case "gesture": {
      const a = (f / 22) * TAU + ph;
      return {
        body: withArms({ ...base, head: 6 * S(a) }, { shoulder: 115 + 30 * S(a), elbow: 30, wrist: 0 }, { shoulder: 95 + 25 * S(a + 2), elbow: 40 }),
        pelvis: STAND_PELVIS,
      };
    }
    case "shrug": {
      const a = Math.max(0, S((f / 60) * TAU + ph));
      return {
        body: withArms({ ...base, head: -6 * a }, { shoulder: 25 + 15 * a, elbow: 95 + 10 * a, wrist: -30 }, { shoulder: 22 + 12 * a, elbow: 92, wrist: -30 }),
        pelvis: STAND_PELVIS + 0.01 * a,
      };
    }
  }
};
