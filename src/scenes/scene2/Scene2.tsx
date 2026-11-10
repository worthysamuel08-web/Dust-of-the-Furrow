/**
 * SCENE 2 — THREE PROMISES
 * "Before this day ends, you'll reap another man's harvest, be summoned to his
 * court, and see what happens to a neighbour who said no."
 *
 * House style (docs/style-guide.md): silhouette Walter, stylised cottage,
 * four shots cut on the promises, depth of field, letterbox.
 */
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { SilhouetteStickman } from "../../characters/stickman";
import { lerp } from "../../engine/animation";
import { CameraRig } from "../../engine/CameraRig";
import { faceCameraYaw, headWorld, shotAt } from "../../engine/shots";
import { Cottage } from "../../environments/cottage/Cottage";
import { CinematicFX } from "../../style/CinematicFX";
import { FilmGrain, Letterbox, Vignette } from "../../style/Frame";
import { CourtCard, DistraintCard, HarvestCard } from "./PromiseCards";
import {
  BLACK_FROM,
  CARD_CUES,
  EMBER,
  SCENE2_DURATION,
  SCENE2_SHOTS,
  SEAT,
  SUN,
  cardInAt,
  cardSettleAt,
  characterLightAt,
  characterPoseAt,
  setDimAt,
} from "./timeline";

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = shotAt(SCENE2_SHOTS, frame, SCENE2_DURATION);
  const pose = characterPoseAt(frame);
  const yaw = faceCameraYaw(shot.position, SEAT);
  const fog = new THREE.Color("#1d1628");
  return (
    <>
      <CameraRig position={shot.position} target={shot.target} fov={shot.fov} />
      <color attach="background" args={[fog]} />
      <fogExp2 attach="fog" args={[fog, 0.06]} />
      <Cottage frame={frame + 450} sun={SUN} ember={EMBER} look="stylized" />
      <SilhouetteStickman
        pose={pose}
        position={[SEAT.x, SEAT.y, SEAT.z]}
        yaw={yaw}
        light={characterLightAt(frame)}
        tint="#ffe2c8"
        rimAngle={140}
        rimStrength={1.35}
      />
      <CinematicFX focus={headWorld(pose, SEAT, yaw)} focusRange={shot.range} bokeh={shot.bokeh} bloom={0.8} />
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
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 40, near: 0.05, far: 30, position: SCENE2_SHOTS[0].from }}
      >
        <World />
      </ThreeCanvas>

      {/* the set dims as the promises get heavier; the cards stay bright above it */}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: setDimAt(frame) }} />
      <Vignette strength={0.55} centerX={38} />
      <FilmGrain opacity={0.08} />
      <PromiseCardsOverlay />

      {/* three low drum hits, one per card */}
      {CARD_CUES.map((cue) => (
        <Sequence key={cue} from={cue} durationInFrames={45} layout="none">
          <Audio src={staticFile("sfx/drum-hit.wav")} volume={0.9} />
        </Sequence>
      ))}

      {/* cut to black for the final half second */}
      {frame >= BLACK_FROM ? <AbsoluteFill style={{ backgroundColor: "#000", zIndex: 100 }} /> : null}
      <Letterbox />
    </AbsoluteFill>
  );
};
