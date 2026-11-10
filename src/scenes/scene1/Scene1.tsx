/**
 * SCENE 1 — THE SOIL OF 1320
 * A villein wakes in his cottage at dawn. House style (docs/style-guide.md):
 * black-silhouette character, stylised set, depth of field, four shots.
 */
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { SilhouetteStickman } from "../../characters/stickman";
import { lerp } from "../../engine/animation";
import { CameraRig } from "../../engine/CameraRig";
import { faceCameraYaw, headWorld, shotAt } from "../../engine/shots";
import { radialTexture } from "../../engine/textures";
import { BED, Cottage, SLEEPER } from "../../environments/cottage/Cottage";
import { CinematicFX } from "../../style/CinematicFX";
import { FilmGrain, GlowTitle, Letterbox, Vignette } from "../../style/Frame";
import {
  SCENE1_DURATION,
  SCENE1_SHOTS,
  characterLightAt,
  characterPoseAt,
  emberAt,
  fadeInAt,
  nearArmBehindHeadAt,
  sitUpAt,
  sunAt,
} from "./timeline";

/** Soft dark blob on the mattress under the body: grounds the flat character in the 3D bed. */
const ContactShadow: React.FC<{ sitUp: number; yaw: number }> = ({ sitUp, yaw }) => {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({ color: "#000000", alphaMap: radialTexture(), transparent: true, depthWrite: false, opacity: 0.5 }),
    [],
  );
  const length = 1.25 - 0.85 * sitUp;
  const centerX = -0.45 + 0.42 * sitUp;
  return (
    <group position={[SLEEPER.x, BED.mattressTop + 0.055, SLEEPER.z]} rotation-y={yaw}>
      <mesh position-x={centerX} rotation-x={-Math.PI / 2} material={mat} renderOrder={1}>
        <planeGeometry args={[length, 0.42]} />
      </mesh>
    </group>
  );
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = shotAt(SCENE1_SHOTS, frame, SCENE1_DURATION);
  const sun = sunAt(frame);
  const pose = characterPoseAt(frame);
  const yaw = faceCameraYaw(shot.position, SLEEPER);
  const focus = headWorld(pose, SLEEPER, yaw);
  const fog = new THREE.Color("#120d1a").lerp(new THREE.Color("#1d1628"), sun);
  return (
    <>
      <CameraRig position={shot.position} target={shot.target} fov={shot.fov} />
      <color attach="background" args={[fog]} />
      <fogExp2 attach="fog" args={[fog, 0.06]} />
      <Cottage frame={frame} sun={sun} ember={emberAt(frame)} look="stylized" />
      <ContactShadow sitUp={sitUpAt(frame)} yaw={yaw} />
      <SilhouetteStickman
        pose={pose}
        position={[SLEEPER.x, SLEEPER.y, SLEEPER.z]}
        yaw={yaw}
        light={characterLightAt(frame)}
        tint="#ffe2c8"
        rimAngle={140}
        rimStrength={lerp(0.35, 1.35, sun)}
        nearArmBehindHead={nearArmBehindHeadAt(frame)}
      />
      <CinematicFX focus={focus} focusRange={shot.range} bokeh={shot.bokeh} bloom={0.8} />
    </>
  );
};

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows="soft"
        dpr={1}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 42, near: 0.05, far: 30, position: SCENE1_SHOTS[0].from }}
      >
        <World />
      </ThreeCanvas>
      <Vignette strength={0.55} />
      <FilmGrain opacity={0.08} />
      <GlowTitle text="ENGLAND, 1320" from={30} to={140} y={0.24} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: 1 - fadeInAt(frame) }} />
      <Letterbox />
    </AbsoluteFill>
  );
};
