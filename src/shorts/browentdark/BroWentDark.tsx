/**
 * "Bro Went Dark" — a ~21 s two-character dialogue skit (no narrator), vertical 1080x1920.
 * Layout like the meme format: black bars, a white panel, the line being said at the top of the panel,
 * the speaker in shot (cut on every line), mouths driven by the voice.
 *
 * Timing + mouth envelopes: src/shorts/browentdark/timing.json (scripts/build-browentdark-audio.py).
 */
import "@fontsource/comic-neue/400.css";
import "@fontsource/comic-neue/700.css";
import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Guy, type GuyPose } from "./Guy";
import TIMING_JSON from "./timing.json";

type Part = { text: string; start: number; end: number; env: number[] };
type Line = { who: "purple" | "navy"; start: number; end: number; parts: Part[] };
const TIMING = TIMING_JSON as { total: number; lines: Line[] };

export const BWD_FPS = 30;
export const BWD_DURATION = Math.ceil(TIMING.total * BWD_FPS);
const W = 1080;
const H = 1920;
const PANEL_TOP = 432;
const PANEL_BOTTOM = 1408;
const COLORS = { purple: "#5B5070", navy: "#252C45" };

/** Who stands where in each line's shot, and the pose for each part of the line. */
type Shot = { x: number; facing: 1 | -1; poses: GuyPose[]; fadeLast?: boolean };
const SHOTS: Shot[] = [
  { x: 330, facing: 1, poses: [{ mouth: "teeth", lookX: 1, brows: "flat" }] },
  { x: 740, facing: -1, poses: [{ mouth: "o", lids: 0.35, lookX: -0.6, lookY: -0.4 }, { mouth: "talk", lids: 0.4, lookX: -1, lookY: -0.6 }, { mouth: "flat", lids: 0.5, armFront: "shrug" }] },
  { x: 330, facing: 1, poses: [{ mouth: "talk", lids: 0.25, brows: "up", armFront: "chest" }, { mouth: "teeth", lids: 0.4, brows: "angry", armFront: "point" }] },
  { x: 720, facing: -1, poses: [{ mouth: "teeth", lids: 0.45, brows: "angry", armFront: "shrug" }, { mouth: "talk", lids: 0.3, brows: "up" }, { mouth: "talk", lids: 0.35, lookY: -0.3 }] },
  { x: 420, facing: 1, poses: [{ mouth: "talk", lids: 0.5 }] },
  { x: 760, facing: -1, poses: [{ mouth: "o", lids: 0.3, brows: "up" }, { mouth: "flat", lids: 0.55, lookX: 0.2 }] },
  { x: 360, facing: 1, poses: [{ mouth: "flat", lids: 0.45, armFront: "shrug" }, { mouth: "talk", lids: 0.4, armFront: "shrug", brows: "worried" }] },
  { x: 700, facing: -1, poses: [{ mouth: "grin", lids: 0.5, lookX: -0.2 }, { mouth: "grin", lids: 0.55, lookX: -0.2 }], fadeLast: true },
  { x: 540, facing: 1, poses: [{ mouth: "flat", lids: 0.4, brows: "worried", armFront: "shrug", armBack: "shrug" }, { mouth: "talk", lids: 0.35, brows: "worried", armFront: "shrug", armBack: "shrug" }] },
];

const Skull: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ verticalAlign: "-0.12em", marginLeft: 10 }}>
    <path d="M20 3 C9 3 4 10 4 18 C4 24 7 27 10 28 L10 34 L30 34 L30 28 C33 27 36 24 36 18 C36 10 31 3 20 3 Z" fill="#F2F2F2" />
    <circle cx={13.5} cy={18} r={4.5} fill="#111" />
    <circle cx={26.5} cy={18} r={4.5} fill="#111" />
    <path d="M20 22 L17.5 27 L22.5 27 Z" fill="#111" />
    <path d="M15 30 v4 M20 30 v4 M25 30 v4" stroke="#111" strokeWidth={1.6} />
  </svg>
);

const LineShot: React.FC<{ line: Line; shot: Shot; offset: number }> = ({ line, shot, offset }) => {
  const frame = useCurrentFrame();
  const t = frame / BWD_FPS + offset; // absolute seconds
  // current part (keep the last one that has started)
  let pi = 0;
  line.parts.forEach((p, i) => { if (t >= p.start - 0.05) pi = i; });
  const part = line.parts[pi];
  const pose = shot.poses[Math.min(pi, shot.poses.length - 1)];
  const k = Math.round((t - part.start) * BWD_FPS);
  const open = part.env.length && k >= 0 && k < part.env.length ? part.env[k] : 0;
  const talking = part.env.length > 0 && t <= part.end;
  const fade = shot.fadeLast && pi === line.parts.length - 1 ? interpolate(t, [part.start, part.end], [1, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const bob = Math.sin(t * 2.4) * 4;
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <clipPath id="panel"><rect x={0} y={PANEL_TOP} width={W} height={PANEL_BOTTOM - PANEL_TOP} /></clipPath>
        <g clipPath="url(#panel)">
          <Guy x={shot.x} y={PANEL_BOTTOM + 70} color={COLORS[line.who]} facing={shot.facing} scale={0.98} bob={bob} opacity={fade}
            pose={{ ...pose, mouth: talking && pose.mouth !== "grin" ? (open > 0.12 ? "talk" : pose.mouth === "talk" ? "flat" : pose.mouth) : pose.mouth, open: talking ? open : 0 }} />
        </g>
      </svg>
      <div style={{ position: "absolute", top: PANEL_TOP + 40, left: 60, right: 60, textAlign: "center", fontFamily: "Comic Neue", fontWeight: 700, fontSize: 64, color: "#111", lineHeight: 1.15 }}>
        {part.text}
      </div>
    </AbsoluteFill>
  );
};

export const BroWentDark: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const { width } = useVideoConfig();
  const L = TIMING.lines;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", width: W, height: H, transform: `scale(${width / W})`, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", top: PANEL_TOP, left: 0, width: W, height: PANEL_BOTTOM - PANEL_TOP, background: "#FFFFFF" }} />
        {L.map((line, i) => {
          const offset = i === 0 ? 0 : line.start;
          const from = Math.round(offset * BWD_FPS);
          return (
            <Sequence key={i} from={from} durationInFrames={Math.max(1, Math.round(line.end * BWD_FPS) - from)} name={`${line.who} ${i}`}>
              <LineShot line={line} shot={SHOTS[i]} offset={offset} />
            </Sequence>
          );
        })}
        <div style={{ position: "absolute", top: PANEL_TOP - 92, left: 0, right: 0, textAlign: "center", fontFamily: "Comic Neue", fontWeight: 700, fontSize: 54, color: "#F2F2F2" }}>
          Bro went Dark<Skull size={58} />
        </div>
      </div>
      {audio && (
        <>
          <Audio src={staticFile("browentdark/dialogue.mp3")} />
          {L.slice(1).map((line, i) => (
            <Sequence key={i} from={Math.round(line.start * BWD_FPS)} layout="none"><Audio src={staticFile("browentdark/pop.mp3")} volume={0.25} /></Sequence>
          ))}
          <Sequence from={Math.round(L[7].start * BWD_FPS)} layout="none"><Audio src={staticFile("browentdark/crickets.mp3")} volume={0.35} /></Sequence>
          <Sequence from={Math.round(L[7].parts[1].start * BWD_FPS)} layout="none"><Audio src={staticFile("browentdark/fade.mp3")} volume={0.4} /></Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};
