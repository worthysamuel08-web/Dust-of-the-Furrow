/**
 * Costume pieces and hand props for the silhouette rig. Everything is a flat
 * shape coloured from the SilContext, so it also appears in the rim pass.
 */
import { DIMENSIONS as D } from "../rig";
import { Fill, Stroke, ellipsePts, quadPts, smoothClosed, type P2 } from "../shapes2d";
import { useSil } from "./materials";

export type Headwear = "veil" | "coif" | "hood" | "hat" | "none";
export type Costume = {
  /** Long kirtle or cassock down to the ankles instead of the knee-length tunic. */
  gown?: boolean;
  headwear?: Headwear;
  apron?: boolean;
};

export type PropId =
  | "sickle"
  | "cup"
  | "tally"
  | "horn"
  | "spindle"
  | "staff"
  | "bucket"
  | "bowl"
  | "sack"
  | "coins"
  | "baby"
  | "rope"
  | "sheaf"
  | "seal"
  | "linen";

const R = D.headRadius;

// ---- headwear (head-local space, head centre = origin) ----------------------------
const VEIL_BACK: P2[] = smoothClosed([[-R * 1.08, R * 0.2], [-R * 0.4, R * 1.12], [R * 0.6, R * 1.1], [R * 1.08, R * 0.35], [R * 0.95, -R * 1.5], [-R * 1.2, -R * 1.55]], 2);
const VEIL_BAND: P2[] = smoothClosed([[-R * 0.96, R * 0.45], [-R * 0.3, R * 0.98], [R * 0.5, R * 0.95], [R * 0.98, R * 0.48], [R * 0.86, R * 0.62], [R * 0.3, R * 0.8], [-R * 0.4, R * 0.82], [-R * 0.86, R * 0.6]], 2);
const WIMPLE: P2[] = smoothClosed([[-R * 0.85, -R * 0.55], [R * 0.85, -R * 0.55], [R * 0.7, -R * 1.25], [-R * 0.7, -R * 1.25]], 2);
const COIF: P2[] = smoothClosed([[-R * 1.03, R * 0.05], [-R * 0.75, R * 0.85], [0, R * 1.08], [R * 0.75, R * 0.85], [R * 1.03, R * 0.05], [R * 0.75, R * 0.45], [0, R * 0.62], [-R * 0.75, R * 0.45]], 2);
const HOOD: P2[] = smoothClosed([[-R * 1.2, -R * 0.9], [-R * 1.22, R * 0.4], [-R * 0.6, R * 1.25], [R * 0.35, R * 1.25], [R * 1.12, R * 0.55], [R * 1.12, -R * 0.2], [R * 1.25, -R * 1.25], [-R * 1.35, -R * 1.3]], 2);
const HAT_BRIM: P2[] = smoothClosed([[-R * 1.45, R * 0.62], [R * 1.45, R * 0.62], [R * 1.4, R * 0.8], [-R * 1.4, R * 0.8]], 1);
const HAT_CROWN: P2[] = smoothClosed([[-R * 0.85, R * 0.7], [-R * 0.75, R * 1.35], [R * 0.75, R * 1.35], [R * 0.85, R * 0.7]], 1);

/** Pieces drawn BEHIND the head disc. */
export const HeadwearBack: React.FC<{ kind: Headwear }> = ({ kind }) => {
  const m = useSil();
  if (kind === "veil") return <Fill pts={VEIL_BACK} material={m.headwear} z={-0.003} />;
  if (kind === "hood") return <Fill pts={HOOD} material={m.cloth} z={-0.003} />;
  return null;
};

/** Pieces drawn IN FRONT of the head disc (but behind the face features). */
export const HeadwearFront: React.FC<{ kind: Headwear }> = ({ kind }) => {
  const m = useSil();
  if (kind === "veil")
    return (
      <group>
        <Fill pts={VEIL_BAND} material={m.headwear} z={0.0012} />
        <Fill pts={WIMPLE} material={m.headwear} z={0.0012} />
      </group>
    );
  if (kind === "coif") return <Fill pts={COIF} material={m.headwear} z={0.0012} />;
  if (kind === "hood")
    return <Stroke pts={quadPts([-R * 0.98, R * 0.35], [0, R * 1.32], [R * 1.0, R * 0.42], 14)} width={R * 0.16} material={m.cloth} z={0.0012} />;
  if (kind === "hat")
    return (
      <group>
        <Fill pts={HAT_CROWN} material={m.headwear} z={0.0012} />
        <Fill pts={HAT_BRIM} material={m.headwear} z={0.0013} />
      </group>
    );
  return null;
};

// ---- gown (torso space, pelvis = origin) ----------------------------------------
const GOWN: P2[] = smoothClosed(
  [[-0.1, 0.48], [0.08, 0.48], [0.135, 0.4], [0.14, 0.2], [0.15, -0.1], [0.24, -0.72], [0.0, -0.75], [-0.24, -0.72], [-0.15, -0.1], [-0.14, 0.2], [-0.145, 0.4]],
  2,
);
const GOWN_SHADE: P2[] = smoothClosed([[-0.13, 0.38], [-0.075, 0.41], [-0.09, -0.1], [-0.14, -0.7], [-0.22, -0.7], [-0.14, -0.1]], 2);
const APRON: P2[] = smoothClosed([[-0.1, 0.08], [0.14, 0.08], [0.2, -0.55], [-0.06, -0.58]], 2);

export const Gown: React.FC<{ breath: number; apron?: boolean }> = ({ breath, apron }) => {
  const m = useSil();
  return (
    <group scale={[1 + breath * 0.02, 1, 1]}>
      <Fill pts={GOWN} material={m.cloth} />
      <Fill pts={GOWN_SHADE} material={m.clothDark} z={0.0004} />
      {apron ? <Fill pts={APRON} material={m.headwear} z={0.0008} /> : null}
      <Stroke pts={[[-0.14, 0.08], [0.0, 0.065], [0.14, 0.08]]} width={0.02} material={m.rope} z={0.0012} />
    </group>
  );
};

// ---- hand props (wrist space: the hand hangs down -Y, fingers forward +X) -----------
export const Prop: React.FC<{ id: PropId }> = ({ id }) => {
  const m = useSil();
  const z = 0.004;
  switch (id) {
    case "sickle":
      return (
        <group position-z={z}>
          <Stroke pts={[[0, -0.01], [0, -0.13]]} width={0.028} material={m.body} />
          <Stroke pts={quadPts([0, -0.13], [0.2, -0.2], [0.17, -0.0], 10)} width={0.022} material={m.body} />
        </group>
      );
    case "cup":
      return <Fill pts={[[0.0, -0.02], [0.07, -0.02], [0.06, -0.1], [0.01, -0.1]]} material={m.body} z={z} />;
    case "tally":
      return <Stroke pts={[[0, 0.06], [0.02, -0.2]]} width={0.016} material={m.body} z={z} />;
    case "horn":
      return <Stroke pts={quadPts([0.0, -0.03], [0.12, -0.02], [0.2, -0.12], 8)} width={0.04} material={m.body} z={z} />;
    case "spindle":
      return (
        <group position-z={z}>
          <Stroke pts={[[0, 0.02], [0, -0.22]]} width={0.01} material={m.body} />
          <Fill pts={ellipsePts(0, -0.17, 0.035, 0.012, 12)} material={m.body} />
        </group>
      );
    case "staff":
      return <Stroke pts={[[0, 0.55], [0, -0.85]]} width={0.026} material={m.body} z={z} />;
    case "bucket":
      return (
        <group position-z={z}>
          <Stroke pts={quadPts([-0.06, -0.12], [0, -0.0], [0.06, -0.12], 8)} width={0.01} material={m.body} />
          <Fill pts={[[-0.08, -0.12], [0.08, -0.12], [0.07, -0.3], [-0.07, -0.3]]} material={m.body} />
        </group>
      );
    case "bowl":
      return <Fill pts={[[-0.06, -0.04], [0.1, -0.04], [0.06, -0.09], [-0.02, -0.09]]} material={m.body} z={z} />;
    case "sack":
      return <Fill pts={ellipsePts(0.02, -0.16, 0.11, 0.15, 16)} material={m.clothDark} z={z} />;
    case "coins":
      return (
        <group position-z={z}>
          {[[0.03, -0.06], [0.06, -0.08], [0.0, -0.09]].map(([x, y], i) => (
            <Fill key={i} pts={ellipsePts(x, y, 0.018, 0.018, 10)} material={m.feature} />
          ))}
        </group>
      );
    case "baby":
      return (
        <group position-z={z}>
          <Fill pts={ellipsePts(0.05, -0.04, 0.13, 0.065, 16)} material={m.headwear} />
          <Fill pts={ellipsePts(0.17, -0.02, 0.05, 0.05, 14)} material={m.body} z={0.001} />
        </group>
      );
    case "rope":
      return <Stroke pts={quadPts([0, -0.03], [0.35, -0.5], [0.7, -0.25], 12)} width={0.012} material={m.rope} z={z} />;
    case "sheaf":
      return (
        <group position-z={z}>
          {[-0.04, -0.015, 0.01, 0.035].map((x, i) => (
            <Stroke key={i} pts={[[x * 0.4, 0.15], [x, -0.25]]} width={0.018} material={m.body} />
          ))}
          <Stroke pts={[[-0.04, -0.04], [0.04, -0.04]]} width={0.02} material={m.rope} z={0.001} />
        </group>
      );
    case "seal":
      return <Fill pts={ellipsePts(0.04, -0.05, 0.028, 0.028, 12)} material={m.body} z={z} />;
    case "linen":
      return <Fill pts={[[-0.02, -0.02], [0.09, -0.01], [0.1, -0.16], [0.0, -0.14]]} material={m.headwear} z={z} />;
  }
};
