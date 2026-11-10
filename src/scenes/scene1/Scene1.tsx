/**
 * SCENE 1 — THE SOIL OF 1320
 * A villein wakes in his cottage at dawn. 2D character composited into a 3D set.
 */
import "@fontsource/eb-garamond/500.css";
import "@fontsource/eb-garamond/400-italic.css";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { clamp } from "../../engine/animation";
import { CameraRig } from "../../engine/CameraRig";
import { BED, Cottage, SLEEPER } from "../../environments/cottage/Cottage";
import { radialTexture } from "../../engine/textures";
import { useMemo } from "react";
import { Stickman } from "../../characters/stickman";
import {
  cameraAt,
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
      new THREE.MeshBasicMaterial({
        color: "#000000",
        alphaMap: radialTexture(),
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      }),
    [],
  );
  // lying: long blob under torso+head; sitting: compact blob around the hips
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
  const cam = cameraAt(frame);
  const sun = sunAt(frame);

  // Keep the flat character's drawing plane turned partly towards the camera,
  // so it never looks paper-thin while the camera arcs around it.
  const toCam = Math.atan2(cam.position[0] - SLEEPER.x, cam.position[2] - SLEEPER.z);
  const yaw = clamp(toCam * 0.55, -0.35, 0.35);

  const fogColor = new THREE.Color().setRGB(0.05 + 0.05 * sun, 0.045 + 0.04 * sun, 0.04 + 0.03 * sun);

  return (
    <>
      <CameraRig position={cam.position} target={cam.target} fov={40} />
      <color attach="background" args={[fogColor]} />
      <fogExp2 attach="fog" args={[fogColor, 0.075]} />

      <Cottage frame={frame} sun={sun} ember={emberAt(frame)} />

      <ContactShadow sitUp={sitUpAt(frame)} yaw={yaw} />
      <Stickman
        pose={characterPoseAt(frame)}
        position={[SLEEPER.x, SLEEPER.y, SLEEPER.z]}
        yaw={yaw}
        light={characterLightAt(frame)}
        tint="#ffeedd"
        nearArmBehindHead={nearArmBehindHeadAt(frame)}
      />
    </>
  );
};

const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [30, 55, 120, 145], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(frame, [30, 145], [8, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 7% 7%", opacity }}>
      <div style={{ transform: `translateY(${rise}px)`, color: "#efe4cf", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
        <div style={{ fontFamily: "EB Garamond", fontStyle: "italic", fontSize: "1.9vw", letterSpacing: "0.05em" }}>
          An English manor
        </div>
        <div style={{ fontFamily: "EB Garamond", fontWeight: 500, fontSize: "3.4vw", letterSpacing: "0.12em" }}>
          c. 1320
        </div>
      </div>
    </AbsoluteFill>
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
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 40, near: 0.05, far: 30, position: [1.95, 1.72, 1.8] }}
      >
        <World />
      </ThreeCanvas>

      {/* lens vignette (CSS: free compared to a post-processing pass) */}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 45% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }}
      />
      <TitleCard />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: 1 - fadeInAt(frame) }} />
    </AbsoluteFill>
  );
};
