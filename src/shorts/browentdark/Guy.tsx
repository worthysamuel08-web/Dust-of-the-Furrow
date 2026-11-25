/**
 * Meme-style stick guy: big round beige head, sleepy heavy-lidded eyes, hunched bean body,
 * thin arms only when gesturing. Origin = bottom centre of the body; head centre at (0,-600).
 * `facing` 1 = looks to the right, -1 = left.
 */
import React from "react";

const INK = "#1A1A1A";
const HEAD = "#D9CDBC";
const LID = "#8F8A84";

export type Mouth = "flat" | "o" | "talk" | "grin" | "teeth" | "smirk" | "frown";
export type Arm = "none" | "shrug" | "point" | "chest" | "wave";
export type GuyPose = {
  mouth?: Mouth;
  open?: number; // 0..1 how open the mouth is while talking
  lids?: number; // 0 = eyes wide open … 1 = closed (default 0.45, sleepy)
  lookX?: number; // -1..1 relative to facing (1 = where he faces)
  lookY?: number; // -1 up … 1 down
  brows?: "flat" | "up" | "angry" | "worried";
  armFront?: Arm;
  armBack?: Arm;
  lean?: number; // degrees, extra lean towards facing
};

const Hand: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <path d="M0 0 L22 -10 M0 0 L26 2 M0 0 L20 12" stroke={INK} strokeWidth={9} strokeLinecap="round" />
  </g>
);

/** arm from the shoulder (sx, sy), drawn in the guy's facing-right frame */
const ArmPath: React.FC<{ kind: Arm; side: "front" | "back" }> = ({ kind, side }) => {
  if (kind === "none") return null;
  const sx = side === "front" ? 40 : -60;
  const sy = -300;
  let pts: [number, number][] = [];
  let hand: [number, number, number] = [0, 0, 0];
  if (kind === "shrug") {
    pts = side === "front" ? [[sx, sy], [sx + 80, sy + 150], [sx + 190, sy + 60]] : [[sx, sy], [sx - 90, sy + 150], [sx - 200, sy + 60]];
    hand = side === "front" ? [sx + 190, sy + 60, -20] : [sx - 200, sy + 60, 200];
  } else if (kind === "point") {
    pts = [[sx, sy], [sx + 140, sy + 70], [sx + 300, sy + 40]];
    hand = [sx + 300, sy + 40, -5];
  } else if (kind === "chest") {
    pts = [[sx, sy], [sx + 70, sy + 150], [sx + 10, sy + 80]];
    hand = [sx + 10, sy + 80, -120];
  } else if (kind === "wave") {
    pts = [[sx, sy], [sx + 110, sy + 30], [sx + 150, sy - 120]];
    hand = [sx + 150, sy - 120, -80];
  }
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Hand x={hand[0]} y={hand[1]} a={hand[2]} />
    </g>
  );
};

const MouthShape: React.FC<{ m: Mouth; open: number }> = ({ m, open }) => {
  const x = 95;
  const y = -490;
  const o = Math.max(0, Math.min(1, open));
  if (m === "talk" || (o > 0.12 && m !== "grin" && m !== "teeth")) {
    const h = 6 + o * 26;
    return (
      <g>
        <path d={`M${x - 34} ${y - 4} Q${x} ${y - 10} ${x + 34} ${y - 4} Q${x + 20} ${y + h} ${x} ${y + h} Q${x - 22} ${y + h} ${x - 34} ${y - 4} Z`} fill="#5A1F22" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M${x - 26} ${y - 4} Q${x} ${y - 8} ${x + 26} ${y - 4} L${x + 22} ${y + 3} Q${x} ${y} ${x - 22} ${y + 3} Z`} fill="#fff" />
        {o > 0.35 && <ellipse cx={x + 2} cy={y + h - 8} rx={14} ry={6} fill="#E07A80" />}
      </g>
    );
  }
  if (m === "o") return <ellipse cx={x} cy={y} rx={10} ry={13 + o * 8} fill="#5A1F22" stroke={INK} strokeWidth={6} />;
  if (m === "grin") {
    return (
      <g>
        <path d={`M${x - 52} ${y - 14} Q${x} ${y + 4} ${x + 52} ${y - 18} Q${x + 30} ${y + 40} ${x - 4} ${y + 38} Q${x - 40} ${y + 34} ${x - 52} ${y - 14} Z`} fill="#5A1F22" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M${x - 44} ${y - 8} Q${x} ${y + 8} ${x + 44} ${y - 12} L${x + 40} ${y} Q${x} ${y + 16} ${x - 40} ${y + 4} Z`} fill="#fff" />
      </g>
    );
  }
  if (m === "teeth") {
    return (
      <g>
        <rect x={x - 32} y={y - 12} width={64} height={22} rx={8} fill="#fff" stroke={INK} strokeWidth={6} />
        <path d={`M${x - 32} ${y} h64 M${x - 16} ${y - 12} v22 M${x} ${y - 12} v22 M${x + 16} ${y - 12} v22`} stroke={INK} strokeWidth={3} />
      </g>
    );
  }
  if (m === "smirk") return <path d={`M${x - 26} ${y} Q${x + 4} ${y + 10} ${x + 30} ${y - 10}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
  if (m === "frown") return <path d={`M${x - 26} ${y + 6} Q${x} ${y - 8} ${x + 26} ${y + 6}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
  return <path d={`M${x - 26} ${y} Q${x} ${y + 4} ${x + 26} ${y}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
};

export const Guy: React.FC<{ x: number; y: number; color: string; facing?: 1 | -1; scale?: number; pose?: GuyPose; opacity?: number; bob?: number }> = ({
  x, y, color, facing = 1, scale = 1, pose = {}, opacity = 1, bob = 0,
}) => {
  const lids = pose.lids ?? 0.45;
  const lx = (pose.lookX ?? 0.6) * 16;
  const ly = (pose.lookY ?? 0) * 12;
  const brow = pose.brows ?? "flat";
  const browLift = brow === "up" ? 18 : brow === "worried" ? 8 : brow === "angry" ? -6 : 0;
  const browTilt = brow === "angry" ? 14 : brow === "worried" ? -12 : 0;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${facing * scale} ${scale})`} opacity={opacity}>
      <g transform={`rotate(${4 + (pose.lean ?? 0)} 0 0)`}>
        <ArmPath kind={pose.armBack ?? "none"} side="back" />
        {/* hunched bean body */}
        <path d="M-110 40 C-120 -120 -110 -260 -50 -360 C-20 -400 50 -400 70 -360 C120 -260 120 -100 110 40 Z" fill={color} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
        <path d="M-96 0 C-104 -130 -92 -250 -44 -340" stroke="#FFFFFF" strokeWidth={7} fill="none" opacity={0.85} strokeLinecap="round" />
        <path d="M30 -170 C40 -140 44 -110 40 -80" stroke={INK} strokeWidth={6} fill="none" opacity={0.5} strokeLinecap="round" />
        {/* head */}
        <circle cx={10} cy={-600} r={200} fill={HEAD} stroke={INK} strokeWidth={10} />
        {/* eyes (shifted to the side he faces) */}
        {[{ cx: 40, cy: -620, r: 66 }, { cx: 150, cy: -626, r: 62 }].map((e, i) => (
          <g key={i}>
            <circle cx={e.cx} cy={e.cy} r={e.r} fill="#fff" stroke={INK} strokeWidth={8} />
            <clipPath id={`lid-${i}-${color.slice(1)}`}><circle cx={e.cx} cy={e.cy} r={e.r - 4} /></clipPath>
            <circle cx={e.cx + lx + 18} cy={e.cy + ly + lids * 18} r={14} fill={INK} />
            <g clipPath={`url(#lid-${i}-${color.slice(1)})`}>
              <rect x={e.cx - e.r} y={e.cy - e.r - 10} width={e.r * 2} height={10 + e.r * 2 * lids} fill={LID} />
              <path d={`M${e.cx - e.r} ${e.cy - e.r + e.r * 2 * lids} L${e.cx + e.r} ${e.cy - e.r + e.r * 2 * lids}`} stroke={INK} strokeWidth={8} />
            </g>
            <circle cx={e.cx} cy={e.cy} r={e.r} fill="none" stroke={INK} strokeWidth={8} />
            {/* brow */}
            <path d={`M${e.cx - 44} ${e.cy - e.r - 22 - browLift + (i ? -browTilt : browTilt) * 0.5} Q${e.cx} ${e.cy - e.r - 40 - browLift} ${e.cx + 44} ${e.cy - e.r - 22 - browLift + (i ? browTilt : -browTilt) * 0.5}`}
              stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <MouthShape m={pose.mouth ?? "flat"} open={pose.open ?? 0} />
        <ArmPath kind={pose.armFront ?? "none"} side="front" />
      </g>
    </g>
  );
};
