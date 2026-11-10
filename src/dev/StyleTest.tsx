/**
 * STYLE TEST — the new house look (black silhouette characters, flat stylised
 * set, purple/amber light, depth of field, bloom, letterbox, grain, glow titles),
 * in three hard-cut shots. Uses Scene 2's poses; changes no existing scene.
 */
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { SilhouetteStickman } from "../characters/stickman/silhouette/SilhouetteStickman";
import { headCenter } from "../characters/stickman";
import { clamp, lerp, progress, ease } from "../engine/animation";
import { CameraRig, type Vec3 } from "../engine/CameraRig";
import { Cottage } from "../environments/cottage/Cottage";
import { characterPoseAt, SEAT } from "../scenes/scene2/timeline";
import { CinematicFX } from "../style/CinematicFX";
import { FilmGrain, GlowTitle, Letterbox, Vignette } from "../style/Frame";

export const STYLE_TEST_SHOT = 75; // frames per shot
export const STYLE_TEST_DURATION = STYLE_TEST_SHOT * 3;

type Shot = { from: Vec3; to: Vec3; target: Vec3; fov: number; poseFrame: number; bokeh: number; range: number };
const SHOTS: Shot[] = [
  // 1 · wide establishing, slow drift
  { from: [1.75, 1.65, 1.6], to: [1.6, 1.62, 1.45], target: [-0.95, 0.95, -1.4], fov: 42, poseFrame: 30, bokeh: 2, range: 1.6 },
  // 2 · medium, slow push
  { from: [-1.2, 1.05, 0.75], to: [-1.15, 1.05, 0.55], target: [-0.45, 0.95, -1.5], fov: 40, poseFrame: 150, bokeh: 4, range: 0.7 },
  // 3 · close-up on the face, background melts away
  { from: [-0.55, 1.28, -0.5], to: [-0.58, 1.27, -0.62], target: [-0.82, 1.22, -1.5], fov: 32, poseFrame: 300, bokeh: 7, range: 0.35 },
];

const World: React.FC<{ fx: string }> = ({ fx }) => {
  const frame = useCurrentFrame();
  const shotIndex = Math.min(SHOTS.length - 1, Math.floor(frame / STYLE_TEST_SHOT));
  const shot = SHOTS[shotIndex];
  const local = frame - shotIndex * STYLE_TEST_SHOT;
  const t = progress(local, 0, STYLE_TEST_SHOT, ease.inOut);
  const position = shot.from.map((v, i) => lerp(v, shot.to[i], t)) as Vec3;

  const pose = characterPoseAt(shot.poseFrame + Math.round(local * 0.6));
  const toCam = Math.atan2(position[0] - SEAT.x, position[2] - SEAT.z);
  const yaw = clamp(toCam * 0.55, -0.35, 0.35);
  const [hx, hy] = headCenter(pose);
  const head: Vec3 = [SEAT.x + hx * Math.cos(yaw), SEAT.y + hy, SEAT.z - hx * Math.sin(yaw)];

  const fog = new THREE.Color("#1d1628");
  return (
    <>
      <CameraRig position={position} target={shot.target} fov={shot.fov} />
      <color attach="background" args={[fog]} />
      <fogExp2 attach="fog" args={[fog, 0.06]} />
      <Cottage frame={frame + 600} sun={1} ember={0.7} look="stylized" />
      <SilhouetteStickman
        pose={pose}
        position={[SEAT.x, SEAT.y, SEAT.z]}
        yaw={yaw}
        light={0.95}
        tint="#ffe2c8"
        rimAngle={140}
        rimStrength={1.35}
      />
      <CinematicFX focus={head} focusRange={shot.range} bokeh={shot.bokeh} bloom={0.8} enabled={fx !== "none"} />
    </>
  );
};

export const StyleTest: React.FC<{ fx?: string }> = ({ fx = "all" }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows="soft"
        dpr={1}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 42, near: 0.05, far: 30, position: SHOTS[0].from }}
      >
        <World fx={fx} />
      </ThreeCanvas>
      <Vignette strength={0.55} />
      <FilmGrain opacity={0.08} />
      <GlowTitle text="ENGLAND, 1320" from={8} to={STYLE_TEST_SHOT - 4} y={0.24} />
      <Letterbox />
    </AbsoluteFill>
  );
};
