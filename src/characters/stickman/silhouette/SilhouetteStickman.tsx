/**
 * The silhouette look: a solid black stickman with thick limbs, white facial
 * features, flat-colour clothing and a warm rim light on the side facing the
 * key light. Same skeleton, same StickmanPose, same IK as the ink look.
 *
 * Rim light: the whole figure is drawn twice. A copy in the rim colour sits a
 * hair behind the figure, shifted towards the light, so a thin glowing edge
 * shows along the lit side of the silhouette only (outer edge, like the
 * reference). No lighting maths, so it costs almost nothing to render.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { deg } from "../../../engine/animation";
import { DIMENSIONS as D, type ArmPose, type LegPose, type StickmanPose } from "../rig";
import { Fill, Stroke, ellipsePts, smoothClosed, type P2 } from "../shapes2d";
import { SilContext, useSil, type SilMaterials } from "./materials";
import { SilhouetteFace } from "./SilhouetteFace";

export type SilhouettePalette = {
  body: string;
  cloth: string;
  clothDark: string;
  clothPatch: string;
  rope: string;
  feature: string;
  rim: string;
};

/** Walter: black figure, muted brown tunic, warm amber rim. */
export const WALTER_SILHOUETTE: SilhouettePalette = {
  body: "#121014",
  cloth: "#8a5c38",
  clothDark: "#6b4429",
  clothPatch: "#9c7048",
  rope: "#3a2a1c",
  feature: "#f6f1e7",
  rim: "#ffb35c",
};

export type SilhouetteStickmanProps = {
  pose: StickmanPose;
  palette?: SilhouettePalette;
  /** Brightness of the clothing fills (the black body stays black). */
  light?: number;
  tint?: string;
  /** Rim light: direction the light comes FROM in the character's 2D plane (degrees, 0 = right, 90 = above). */
  rimAngle?: number;
  /** 0 = no rim, 1 = normal, >1 glows (catches bloom). */
  rimStrength?: number;
  /** Rim thickness in metres. */
  rimWidth?: number;
  scale?: number;
  position?: [number, number, number];
  yaw?: number;
  layerGap?: number;
  nearArmBehindHead?: boolean;
};

const LIMB = 0.046;
const LEG = 0.054;

const basic = (color: string) => new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, toneMapped: false });

// ---- parts (shapes only; colours come from context) ----------------------------------

const Limb: React.FC<{ length: number; width: number }> = ({ length, width }) => {
  const m = useSil();
  return <Stroke pts={[[0, 0], [0, -length]]} width={width} material={m.body} />;
};

const Hand: React.FC = () => {
  const m = useSil();
  return (
    <group>
      <Fill pts={ellipsePts(0.004, -0.035, 0.036, 0.046, 18)} material={m.body} z={0.001} />
      <Fill pts={ellipsePts(0.036, -0.03, 0.016, 0.026, 12, -0.5)} material={m.body} z={0.001} />
    </group>
  );
};

const FOOT: P2[] = smoothClosed([[-0.04, 0.01], [0.03, 0.005], [0.12, -0.02], [0.125, -0.055], [-0.035, -0.055], [-0.05, -0.02]], 2);
const Foot: React.FC = () => {
  const m = useSil();
  return <Fill pts={FOOT} material={m.body} z={0.001} />;
};

/** A long woollen sleeve: flat cloth tube over the arm segment. */
const Sleeve: React.FC<{ length: number; w0: number; w1: number }> = ({ length, w0, w1 }) => {
  const m = useSil();
  const pts: P2[] = smoothClosed([[-w0 / 2, 0.02], [w0 / 2, 0.02], [w1 / 2, -length], [-w1 / 2, -length - 0.005]], 1);
  return <Fill pts={pts} material={m.cloth} z={0.002} />;
};

const Arm: React.FC<{ arm: ArmPose }> = ({ arm }) => (
  <group rotation-z={deg(arm.shoulder)}>
    <Limb length={D.upperArm} width={LIMB} />
    <Sleeve length={D.upperArm + 0.02} w0={0.09} w1={0.075} />
    <group position-y={-D.upperArm} rotation-z={deg(arm.elbow)}>
      <Limb length={D.forearm} width={LIMB} />
      <Sleeve length={D.forearm * 0.82} w0={0.075} w1={0.068} />
      <group position-y={-D.forearm} rotation-z={deg(arm.wrist)}>
        <Hand />
      </group>
    </group>
  </group>
);

const Leg: React.FC<{ leg: LegPose }> = ({ leg }) => (
  <group rotation-z={deg(leg.hip)}>
    <Limb length={D.thigh} width={LEG} />
    <group position-y={-D.thigh} rotation-z={deg(-leg.knee)}>
      <Limb length={D.shin} width={LEG * 0.95} />
      <group position-y={-D.shin} rotation-z={deg(leg.ankle)}>
        <Foot />
      </group>
    </group>
  </group>
);

const TUNIC: P2[] = smoothClosed(
  [
    [-0.1, 0.48], [0.08, 0.48], [0.135, 0.4], [0.14, 0.22], [0.13, 0.06], [0.16, -0.22],
    [0.0, -0.235], [-0.16, -0.22], [-0.135, 0.06], [-0.135, 0.24], [-0.145, 0.4],
  ],
  2,
);
const SHADE: P2[] = smoothClosed([[-0.13, 0.38], [-0.075, 0.41], [-0.085, 0.06], [-0.125, -0.21], [-0.15, -0.21], [-0.13, 0.06]], 2);
const PATCH: P2[] = [[0.035, 0.17], [0.095, 0.165], [0.097, 0.11], [0.037, 0.105]];

const Tunic: React.FC<{ breath: number }> = ({ breath }) => {
  const m = useSil();
  return (
    <group scale={[1 + breath * 0.025, 1, 1]}>
      <Fill pts={TUNIC} material={m.cloth} />
      <Fill pts={SHADE} material={m.clothDark} z={0.0004} />
      <Fill pts={PATCH} material={m.clothPatch} z={0.0008} />
      {/* rope belt and knot */}
      <Stroke pts={[[-0.137, 0.065], [0.0, 0.052], [0.133, 0.065]]} width={0.022} material={m.rope} z={0.0012} />
      <Stroke pts={[[0.045, 0.052], [0.055, -0.02], [0.05, -0.07]]} width={0.013} material={m.rope} z={0.0014} />
    </group>
  );
};

const HEAD_DISC = ellipsePts(0, 0, D.headRadius, D.headRadius, 56);

const Head: React.FC<{ pose: StickmanPose; withFace: boolean }> = ({ pose, withFace }) => {
  const m = useSil();
  return (
    <group position={[0.01, D.headRadius, 0]}>
      <Fill pts={HEAD_DISC} material={m.body} />
      {withFace ? (
        <group position-z={0.002}>
          <SilhouetteFace face={pose.face} turn={pose.headTurn} />
        </group>
      ) : null}
    </group>
  );
};

/** The full figure (one pass). */
const Figure: React.FC<{ pose: StickmanPose; layerGap: number; nearArmBehindHead: boolean; withFace: boolean }> = ({
  pose,
  layerGap,
  nearArmBehindHead,
  withFace,
}) => {
  const m = useSil();
  const z = (layer: number) => layer * layerGap;
  return (
    <group position={[pose.rootX, pose.rootY, 0]} rotation-z={deg(pose.rootRot)}>
      <group position-z={z(0)}>
        <Leg leg={pose.legFar} />
      </group>
      <group position-z={z(1)}>
        <Leg leg={pose.legNear} />
      </group>
      <group rotation-z={deg(pose.torso)}>
        <group position={[0, D.shoulderY, z(2)]}>
          <Arm arm={pose.armFar} />
        </group>
        <group position-z={z(3)}>
          <Tunic breath={pose.breath} />
        </group>
        <group position={[0, D.torsoLength - 0.01, z(4)]}>
          <Stroke pts={[[0, 0.0], [0, D.neck + 0.05]]} width={0.065} material={m.body} z={-0.008} />
          <group position-y={D.neck} rotation-z={deg(pose.head)}>
            <Head pose={pose} withFace={withFace} />
          </group>
        </group>
        <group position={[0.01, D.shoulderY, nearArmBehindHead ? z(3.6) : z(6)]}>
          <Arm arm={pose.armNear} />
        </group>
      </group>
    </group>
  );
};

export const SilhouetteStickman: React.FC<SilhouetteStickmanProps> = ({
  pose,
  palette = WALTER_SILHOUETTE,
  light = 1,
  tint = "#ffffff",
  rimAngle = 120,
  rimStrength = 1,
  rimWidth = 0.014,
  scale = 1,
  position = [0, 0, 0],
  yaw = 0,
  layerGap = 0.006,
  nearArmBehindHead = false,
}) => {
  const mats = useMemo(
    () => ({
      body: basic(palette.body),
      cloth: basic(palette.cloth),
      clothDark: basic(palette.clothDark),
      clothPatch: basic(palette.clothPatch),
      rope: basic(palette.rope),
      feature: basic(palette.feature),
      pupil: basic(palette.body),
      rim: basic(palette.rim),
    }),
    [palette],
  );
  // clothing picks up the scene light; the black body and white features stay graphic
  const t = new THREE.Color(tint);
  for (const k of ["cloth", "clothDark", "clothPatch", "rope"] as const) {
    mats[k].color.set(palette[k]).multiply(t).multiplyScalar(light);
  }
  mats.rim.color.set(palette.rim).multiplyScalar(rimStrength);

  const main: SilMaterials = mats;
  const rimMats: SilMaterials = useMemo(
    () => ({ body: mats.rim, cloth: mats.rim, clothDark: mats.rim, clothPatch: mats.rim, rope: mats.rim, feature: mats.rim, pupil: mats.rim }),
    [mats],
  );

  // rim offset in the character plane, towards the light
  const a = (rimAngle * Math.PI) / 180;
  const rimOffset: [number, number, number] = [Math.cos(a) * rimWidth, Math.sin(a) * rimWidth, -layerGap * 8];

  return (
    <group position={position} rotation-y={yaw} scale={scale}>
      {rimStrength > 0 ? (
        <SilContext.Provider value={rimMats}>
          <group position={rimOffset}>
            <Figure pose={pose} layerGap={layerGap} nearArmBehindHead={nearArmBehindHead} withFace={false} />
          </group>
        </SilContext.Provider>
      ) : null}
      <SilContext.Provider value={main}>
        <Figure pose={pose} layerGap={layerGap} nearArmBehindHead={nearArmBehindHead} withFace />
      </SilContext.Provider>
    </group>
  );
};
