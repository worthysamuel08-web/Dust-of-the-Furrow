/** The data that describes one scene. Scenes 3–56 are written in this format. */
import type { PropId } from "../../characters/stickman/silhouette/costume";
import type { TimeOfDay } from "../../environments/outdoor/sky";
import type { ActionId } from "./actions";
import type { CastId } from "./cast";
import type { ExprTrack } from "./expressions";
import type { AnimalKind, DressingKind } from "./props3d";

export type SetId = "cottage" | "village" | "fields" | "church" | "hall" | "barn" | "stage" | "pasture";

export type ActorSpec = {
  who: CastId;
  x: number;
  z: number;
  /** Ground height under the actor (e.g. a bed). Default 0. */
  y?: number;
  /** 1 = faces +X (screen right), -1 = faces screen left. */
  face?: 1 | -1;
  act: ActionId;
  expr?: ExprTrack;
  /** Head turn override (-1..1, towards the facing side). */
  turn?: number;
  /** Extra gaze offset (-1..1). */
  look?: number;
  prop?: PropId;
  farProp?: PropId;
  /** Walking speed along X (m/s, signed) from `moveFrom` seconds. */
  vx?: number;
  moveFrom?: number;
  /** Visible only between these scene fractions. */
  show?: [number, number];
  seed?: number;
};

export type AnimalSpec = { kind: AnimalKind; x: number; z: number; y?: number; face?: 1 | -1; vx?: number; scale?: number };
export type DressingSpec = { kind: DressingKind; x: number; z: number; y?: number; rot?: number; scale?: number };

export type ShotType = "wide" | "medium" | "close" | "high" | "low" | "group" | "extreme" | "ots";
export type ShotSpec = {
  type: ShotType;
  /** Start, as a fraction of the scene (0 = first shot). */
  at: number;
  /** Index of the actor to frame (default: scene focus). */
  on?: number;
  /** Which side the camera swings to (-1, 1). */
  side?: number;
  /** Optional absolute camera (overrides the template). */
  pos?: [number, number, number];
  target?: [number, number, number];
  fov?: number;
};

type Timed = { from: number; to: number };
export type OverlaySpec =
  | ({ kind: "title"; text: string; y?: number } & Timed)
  | ({ kind: "label"; text: string; where?: "top" | "bottom" | "left" | "right" | "center" } & Timed)
  | ({ kind: "list"; items: string[] } & Timed)
  | ({ kind: "roll"; lines: string[]; caption?: string } & Timed)
  | ({ kind: "cross"; text: string } & Timed)
  | ({ kind: "calendar"; lord: number[] } & Timed)
  | ({ kind: "coins" } & Timed)
  | ({ kind: "year"; text: string } & Timed);

export type SfxId = "bell" | "horn" | "drum";

export type SceneSpec = {
  n: number;
  set: SetId;
  time?: TimeOfDay;
  /** Cottage: sunlight through the window (0..1) and hearth embers (0..1). */
  sun?: number;
  ember?: number;
  fields?: { walterReaped?: number; demesneDone?: boolean };
  actors: ActorSpec[];
  focus?: number;
  animals?: AnimalSpec[];
  dressing?: DressingSpec[];
  shots?: ShotSpec[];
  overlays?: OverlaySpec[];
  grade?: "flashback" | "vision" | "none";
  rain?: boolean;
  ambience?: "fire" | "wind" | "rain" | "none";
  sfx?: { id: SfxId; at: number }[];
  /** Fade from / to black (frames). */
  fadeIn?: number;
  fadeOut?: number;
};
