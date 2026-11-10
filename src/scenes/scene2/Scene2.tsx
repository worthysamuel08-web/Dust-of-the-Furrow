/**
 * SCENE 2 — THREE PROMISES
 * "Before this day ends, you'll reap another man's harvest, be summoned to his
 * court, and see what happens to a neighbour who said no."
 *
 * Same cottage set and the same <Stickman> rig as Scene 1 (no changes to either).
 */
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Stickman } from "../../characters/stickman";
import { clamp, lerp } from "../../engine/animation";
import { CameraRig } from "../../engine/CameraRig";
import { Cottage } from "../../environments/cottage/Cottage";
import { CourtCard, DistraintCard, HarvestCard } from "./PromiseCards";
import {
  BLACK_FROM,
  CARD_CUES,
  EMBER,
  SEAT,
  SUN,
  cameraAt,
  cardInAt,
  cardSettleAt,
  characterLightAt,
  characterPoseAt,
  setDimAt,
} from "./timeline";

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);
  // keep the flat character's plane turned partly towards the camera (as in Scene 1)
  const toCam = Math.atan2(cam.position[0] - SEAT.x, cam.position[2] - SEAT.z);
  const yaw = clamp(toCam * 0.55, -0.35, 0.35);
  const fogColor = new THREE.Color().setRGB(0.05 + 0.05 * SUN, 0.045 + 0.04 * SUN, 0.04 + 0.03 * SUN);
  return (
    <>
      <CameraRig position={cam.position} target={cam.target} fov={40} />
      <color attach="background" args={[fogColor]} />
      <fogExp2 attach="fog" args={[fogColor, 0.075]} />
      <Cottage frame={frame + 450} sun={SUN} ember={EMBER} />
      <Stickman
        pose={characterPoseAt(frame)}
        position={[SEAT.x, SEAT.y, SEAT.z]}
        yaw={yaw}
        light={characterLightAt(frame)}
        tint="#ffeedd"
      />
    </>
  );
};

// ---- card layout (fractions of the frame) -------------------------------------------
type Slot = { x: number; y: number; scale: number; rot: number };
const FEATURED: Slot = { x: 0.735, y: 0.5, scale: 1, rot: 1.5 };
const LAST: Slot = { x: 0.755, y: 0.585, scale: 0.92, rot: 1 };
const PINNED: Slot[] = [
  { x: 0.585, y: 0.215, scale: 0.5, rot: -6 },
  { x: 0.735, y: 0.2, scale: 0.5, rot: 4 },
];
const CARD_WIDTH = 0.21; // of frame width, at scale 1
const CARDS = [HarvestCard, CourtCard, DistraintCard];

const PromiseCardsOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      {CARDS.map((Card, i) => {
        const appear = cardInAt(frame, i);
        if (appear <= 0) return null;
        const settle = cardSettleAt(frame, i);
        const home = i === CARDS.length - 1 ? LAST : FEATURED;
        const target = PINNED[i] ?? home;
        const x = lerp(home.x, target.x, settle);
        const y = lerp(home.y, target.y, settle);
        // lands slightly big and tilted, then settles
        const scale = lerp(home.scale, target.scale, settle) * lerp(1.14, 1, appear);
        const rot = lerp(home.rot, target.rot, settle) + (1 - appear) * (i % 2 ? -5 : 5);
        const w = CARD_WIDTH * width;
        const h = w * (380 / 300);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x * width - w / 2,
              top: y * height - h / 2,
              width: w,
              height: h,
              opacity: appear,
              transform: `scale(${scale}) rotate(${rot}deg)`,
              filter: `drop-shadow(0 ${height * 0.012}px ${height * 0.02}px rgba(0,0,0,0.6)) brightness(${lerp(1.25, 1, appear)})`,
              zIndex: i === CARDS.length - 1 ? 3 : 1 + (1 - settle),
            }}
          >
            <Card />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Scene2: React.FC = () => {
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
        camera={{ fov: 40, near: 0.05, far: 30, position: [-1.15, 1.05, 0.85] }}
      >
        <World />
      </ThreeCanvas>

      {/* the set dims as the promises get heavier; the cards stay bright above it */}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: setDimAt(frame) }} />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 35% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)" }}
      />
      <PromiseCardsOverlay />

      {/* three low drum hits, one per card */}
      {CARD_CUES.map((cue) => (
        <Sequence key={cue} from={cue} durationInFrames={45} layout="none">
          <Audio src={staticFile("sfx/drum-hit.wav")} volume={0.9} />
        </Sequence>
      ))}

      {/* cut to black for the final half second */}
      {frame >= BLACK_FROM ? <AbsoluteFill style={{ backgroundColor: "#000", zIndex: 100 }} /> : null}
    </AbsoluteFill>
  );
};
