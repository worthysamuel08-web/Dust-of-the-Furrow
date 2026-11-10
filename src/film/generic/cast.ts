/**
 * The cast. Everyone shares the silhouette rig; they differ only by clothing
 * colour, costume pieces and scale (docs/storyboard.md, continuity bible).
 */
import { WALTER_SILHOUETTE, type SilhouettePalette } from "../../characters/stickman";
import type { Costume } from "../../characters/stickman/silhouette/costume";

const pal = (cloth: string, clothDark: string, headwear?: string, rope = "#3a2a1c"): SilhouettePalette => ({
  ...WALTER_SILHOUETTE,
  cloth,
  clothDark,
  clothPatch: cloth,
  rope,
  headwear,
});

export type CastMember = { palette: SilhouettePalette; costume: Costume; scale: number };

export const CAST = {
  walter: { palette: WALTER_SILHOUETTE, costume: {}, scale: 1 },
  walterHooded: { palette: WALTER_SILHOUETTE, costume: { headwear: "hood" }, scale: 1 },
  alice: { palette: pal("#5f6a86", "#47506a", "#ece3d2"), costume: { gown: true, headwear: "veil", apron: true }, scale: 0.95 },
  joan: { palette: pal("#9a4e34", "#7a3a26", "#ece3d2"), costume: { gown: true, headwear: "coif" }, scale: 0.9 },
  hugh: { palette: pal("#7d6a45", "#5f5034"), costume: {}, scale: 0.7 },
  agnes: { palette: pal("#8a6a7a", "#6c5260", "#ece3d2"), costume: { gown: true, headwear: "coif" }, scale: 0.58 },
  gilbert: { palette: pal("#4f6b3c", "#3c5230"), costume: { headwear: "hood" }, scale: 1 },
  hayward: { palette: pal("#6b6b6b", "#525252"), costume: { headwear: "hood" }, scale: 1.02 },
  miller: { palette: pal("#cfc6b4", "#a9a08f", "#e8e2d4"), costume: { headwear: "coif", apron: true }, scale: 1.05 },
  millerBoy: { palette: pal("#b9ae98", "#958b77"), costume: {}, scale: 0.9 },
  priest: { palette: pal("#1f1c22", "#141216"), costume: { gown: true }, scale: 1 },
  matilda: { palette: pal("#7a5a3a", "#5e4430", "#ece3d2"), costume: { gown: true, headwear: "veil", apron: true }, scale: 0.95 },
  taster: { palette: pal("#5a3f5e", "#45304a"), costume: { headwear: "hat" }, scale: 1 },
  john: { palette: pal("#6e6a63", "#55514b"), costume: {}, scale: 1 },
  emma: { palette: pal("#2c2a30", "#1f1d22", "#3a363f"), costume: { gown: true, headwear: "veil" }, scale: 0.95 },
  steward: { palette: pal("#3c2f5c", "#2c2346", "#2a2238"), costume: { gown: true, headwear: "hat" }, scale: 1.03 },
  clerk: { palette: pal("#2f3d52", "#24303f"), costume: { gown: true, headwear: "coif" }, scale: 0.98 },
  lordsMan: { palette: pal("#6a2a2a", "#4e1f1f"), costume: { headwear: "hat" }, scale: 1.06 },
  purveyor: { palette: pal("#7a1f2a", "#5a1720", "#2a2238"), costume: { headwear: "hat" }, scale: 1.06 },
  pedlar: { palette: pal("#3f6f6a", "#2f5450"), costume: { headwear: "hood" }, scale: 0.98 },
  smith: { palette: pal("#3a3330", "#2a2422", "#5a4a40"), costume: { apron: true }, scale: 1.04 },
  villagerA: { palette: pal("#7a6a4a", "#5d5038"), costume: { headwear: "hood" }, scale: 1 },
  villagerB: { palette: pal("#5a6a5a", "#465246"), costume: {}, scale: 0.97 },
  villagerC: { palette: pal("#6a4a5a", "#523946", "#ece3d2"), costume: { gown: true, headwear: "veil" }, scale: 0.94 },
  villagerD: { palette: pal("#8a7050", "#6b563d", "#ece3d2"), costume: { gown: true, headwear: "coif" }, scale: 0.93 },
  villagerE: { palette: pal("#4a5a72", "#394658"), costume: { headwear: "hood" }, scale: 1.02 },
  child: { palette: pal("#7a6050", "#5e4a3d"), costume: {}, scale: 0.62 },
} satisfies Record<string, CastMember>;

export type CastId = keyof typeof CAST;
