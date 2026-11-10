/**
 * Shared dimensions of the cottage interior (metres). Everything that needs to
 * line up — walls, window, light shaft, bed, character — reads from here.
 *
 *   +X → right gable (door)      -X → left gable
 *   -Z → back (eaves) wall       +Z → front wall (behind the camera)
 */
export const ROOM = {
  x0: -2.8,
  x1: 2.8,
  zBack: -2.2,
  zFront: 2.4,
  eave: 2.0,
  ridge: 3.6,
  ridgeZ: 0.1,
} as const;

/** Small unglazed window in the back wall, above the bed. */
export const WINDOW = { x0: -1.98, x1: -1.54, y0: 1.12, y1: 1.5 } as const;

/** Door in the right gable wall (z range, height). */
export const DOOR = { z0: 0.55, z1: 1.45, height: 1.72 } as const;

/** Rough wooden bed against the back wall, head end at -X. */
export const BED = {
  x0: -2.66,
  x1: -0.64,
  z0: -2.16,
  z1: -1.24,
  mattressTop: 0.52,
} as const;

/** Where the character lies: pelvis position and the depth of his drawing plane. */
export const SLEEPER = { x: -1.52, y: 0.555, z: -1.5 } as const;

export const HEARTH = { x: 0.95, z: 0.4, radius: 0.42 } as const;

/** Direction the morning sun travels through the window (normalised in lighting code). */
export const SUN_DIRECTION: [number, number, number] = [0.32, -0.58, 0.75];
