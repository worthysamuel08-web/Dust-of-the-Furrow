/**
 * <Stickman> — reusable 2D cartoon character, rigged with forward kinematics.
 *
 * It is drawn entirely with flat shapes in its local XY plane, so it stays a
 * genuine 2D cartoon while being placed (and depth-sorted) inside a 3D scene.
 * Pass a full StickmanPose every frame; build poses with the keyframe helpers
 * in engine/animation.ts and the presets/helpers in rig.ts.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { deg } from "../../engine/animation";
import { Face } from "./Face";
import { DIMENSIONS as D, type ArmPose, type LegPose, type StickmanPose } from "./rig";
import { Fill, InkContext, Outlined, Stroke, ellipsePts, smoothClosed, useInk, type InkMaterials, type P2 } from "./shapes2d";

export type StickmanPalette = {
  line: string;
  skin: string;
  cloth: string;
  clothDark: string;
  clothPatch: string;
  rope: string;
};

export const PEASANT_PALETTE: StickmanPalette = {
  line: "#141210",
  skin: "#f4f1ea",
  cloth: "#7a5d40",
  clothDark: "#5c4530",
  clothPatch: "#8e7352",
  rope: "#4d3c27",
};

export type StickmanProps = {
  pose: StickmanPose;
  palette?: StickmanPalette;
  /** Brightness multiplier for the flat fills (lets the 2D character sit in the scene's lighting). */
  light?: number;
  /** Colour tint for the fills, e.g. warm morning light. */
  tint?: string;
  /** Uniform scale (1 = ~1.7 m tall standing). */
  scale?: number;
  position?: [number, number, number];
  /** Y rotation of the character's drawing plane (radians). */
  yaw?: number;
  /** Draw order layers are separated by this much depth. */
  layerGap?: number;
  /** Draw the near arm behind the head (hand behind / on top of the head). */
  nearArmBehindHead?: boolean;
};

const mat = (color: string) =>
  new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, toneMapped: false });

const useInkMaterials = (palette: StickmanPalette, light: number, tint: string): InkMaterials => {
  const mats = useMemo(
    () => ({
      line: mat(palette.line),
      skin: mat(palette.skin),
      cloth: mat(palette.cloth),
      clothDark: mat(palette.clothDark),
      clothPatch: mat(palette.clothPatch),
      rope: mat(palette.rope),
      shine: mat("#ffffff"),
      stubble: mat("#b7b0a3"),
    }),
    [palette],
  );
  // apply lighting every render (cheap: just colour uniforms)
  const t = new THREE.Color(tint);
  const apply = (m: THREE.MeshBasicMaterial, base: string) =>
    m.color.set(base).multiply(t).multiplyScalar(light);
  apply(mats.skin, palette.skin);
  apply(mats.cloth, palette.cloth);
  apply(mats.clothDark, palette.clothDark);
  apply(mats.clothPatch, palette.clothPatch);
  apply(mats.rope, palette.rope);
  apply(mats.shine, "#ffffff");
  apply(mats.stubble, "#b7b0a3");
  return mats;
};

// ---- body parts ---------------------------------------------------------------

/** A straight limb segment from the joint (origin) pointing down -Y, with a rounded joint. */
const Bone: React.FC<{ length: number; width?: number }> = ({ length, width = D.limbWidth }) => {
  const ink = useInk();
  return <Stroke pts={[[0, 0], [0, -length]]} width={width} material={ink.line} />;
};

const Hand: React.FC = () => {
  const ink = useInk();
  const palm = ellipsePts(0.004, -0.04, 0.03, 0.043, 18);
  return (
    <group>
      <Outlined pts={palm} material={ink.skin} line={D.outline * 0.85} z={0.001} />
      {/* thumb */}
      <Outlined
        pts={smoothClosed([[0.02, -0.02], [0.05, -0.035], [0.052, -0.05], [0.03, -0.045]], 2)}
        material={ink.skin}
        line={D.outline * 0.75}
        z={0.0025}
      />
      {/* finger line */}
      <Stroke pts={[[-0.008, -0.06], [-0.002, -0.074]]} width={D.outline * 0.55} material={ink.line} z={0.004} />
    </group>
  );
};

const Foot: React.FC = () => {
  const ink = useInk();
  const pts = smoothClosed(
    [[-0.035, 0.005], [0.02, 0.0], [0.11, -0.025], [0.115, -0.05], [-0.03, -0.05], [-0.045, -0.02]],
    2,
  );
  return <Outlined pts={pts} material={ink.skin} line={D.outline * 0.85} z={0.001} />;
};

const Arm: React.FC<{ arm: ArmPose; sleeve: boolean }> = ({ arm, sleeve }) => {
  const ink = useInk();
  const sleevePts: P2[] = smoothClosed(
    [[-0.04, 0.03], [0.04, 0.03], [0.042, -0.13], [-0.036, -0.15]],
    1,
  );
  return (
    <group rotation-z={deg(arm.shoulder)}>
      <Bone length={D.upperArm} />
      {sleeve ? <Outlined pts={sleevePts} material={ink.cloth} line={D.outline} z={0.002} /> : null}
      <group position-y={-D.upperArm} rotation-z={deg(arm.elbow)}>
        <Bone length={D.forearm} />
        <group position-y={-D.forearm} rotation-z={deg(arm.wrist)}>
          <Hand />
        </group>
      </group>
    </group>
  );
};

const Leg: React.FC<{ leg: LegPose }> = ({ leg }) => (
  <group rotation-z={deg(leg.hip)}>
    <Bone length={D.thigh} width={D.limbWidth * 1.1} />
    <group position-y={-D.thigh} rotation-z={deg(-leg.knee)}>
      <Bone length={D.shin} width={D.limbWidth * 1.1} />
      <group position-y={-D.shin} rotation-z={deg(leg.ankle)}>
        <Foot />
      </group>
    </group>
  </group>
);

const TUNIC: P2[] = smoothClosed(
  [
    [-0.095, 0.475],
    [0.075, 0.475],
    [0.125, 0.4],
    [0.13, 0.22],
    [0.12, 0.06],
    [0.15, -0.21],
    [0.0, -0.225],
    [-0.15, -0.21],
    [-0.125, 0.06],
    [-0.125, 0.24],
    [-0.135, 0.4],
  ],
  2,
);

const Tunic: React.FC<{ breath: number }> = ({ breath }) => {
  const ink = useInk();
  return (
    <group scale={[1 + breath * 0.025, 1, 1]}>
      <Outlined pts={TUNIC} material={ink.cloth} line={D.outline} />
      {/* darker side panel for a bit of volume */}
      <Fill
        pts={smoothClosed([[-0.12, 0.38], [-0.07, 0.4], [-0.08, 0.06], [-0.12, -0.2], [-0.14, -0.2], [-0.12, 0.06]], 2)}
        material={ink.clothDark}
        z={0.0003}
      />
      {/* sewn-on patch */}
      <Outlined
        pts={[[0.03, 0.17], [0.09, 0.165], [0.092, 0.11], [0.032, 0.105]]}
        material={ink.clothPatch}
        line={D.outline * 0.55}
        z={0.0008}
      />
      {/* neckline */}
      <Stroke pts={[[-0.04, 0.47], [0.0, 0.425], [0.04, 0.47]]} width={D.outline * 0.8} material={ink.line} z={0.001} />
      {/* rope belt with hanging knot */}
      <Stroke pts={[[-0.127, 0.06], [0.0, 0.05], [0.123, 0.06]]} width={0.018} material={ink.rope} z={0.0012} />
      <Stroke pts={[[0.04, 0.05], [0.05, -0.02], [0.045, -0.06]]} width={0.011} material={ink.rope} z={0.0014} />
      {/* hem folds */}
      <Stroke pts={[[-0.05, -0.05], [-0.06, -0.2]]} width={D.outline * 0.5} material={ink.line} z={0.001} />
      <Stroke pts={[[0.06, -0.06], [0.07, -0.2]]} width={D.outline * 0.5} material={ink.line} z={0.001} />
    </group>
  );
};

const Head: React.FC<{ pose: StickmanPose }> = ({ pose }) => {
  const ink = useInk();
  const R = D.headRadius;
  const disc = useMemo(() => ellipsePts(0, 0, R, R, 48), [R]);
  return (
    <group position={[0.01, R, 0]}>
      <Outlined pts={disc} material={ink.skin} line={D.outline * 1.15} />
      <group position-z={0.002}>
        <Face face={pose.face} turn={pose.headTurn} />
      </group>
    </group>
  );
};

// ---- assembled character ----------------------------------------------------

export const Stickman: React.FC<StickmanProps> = ({
  pose,
  palette = PEASANT_PALETTE,
  light = 1,
  tint = "#ffffff",
  scale = 1,
  position = [0, 0, 0],
  yaw = 0,
  layerGap = 0.006,
  nearArmBehindHead = false,
}) => {
  const ink = useInkMaterials(palette, light, tint);
  const z = (layer: number) => layer * layerGap;
  return (
    <InkContext.Provider value={ink}>
      <group position={position} rotation-y={yaw} scale={scale}>
        <group position={[pose.rootX, pose.rootY, 0]} rotation-z={deg(pose.rootRot)}>
          {/* back to front: far leg, near leg, far arm, tunic, neck+head, near arm */}
          <group position-z={z(0)}>
            <Leg leg={pose.legFar} />
          </group>
          <group position-z={z(1)}>
            <Leg leg={pose.legNear} />
          </group>
          <group rotation-z={deg(pose.torso)}>
            <group position={[0, D.shoulderY, z(2)]}>
              <Arm arm={pose.armFar} sleeve />
            </group>
            <group position-z={z(3)}>
              <Tunic breath={pose.breath} />
            </group>
            <group position={[0, D.torsoLength - 0.01, z(4)]}>
              <Stroke pts={[[0, 0], [0, D.neck + 0.03]]} width={D.limbWidth} material={ink.line} z={-0.004} />
              <group position-y={D.neck} rotation-z={deg(pose.head)}>
                <Head pose={pose} />
              </group>
            </group>
            <group position={[0.01, D.shoulderY, nearArmBehindHead ? z(3.6) : z(6)]}>
              <Arm arm={pose.armNear} sleeve />
            </group>
          </group>
        </group>
      </group>
    </InkContext.Provider>
  );
};
