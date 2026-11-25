/**
 * Harrison — stickman rig drawn to match the reference sheet:
 * big round white head, messy hair tufts, black stubble beard, dot eyes,
 * white T-shirt, navy shorts, line arms and legs, round white hands.
 *
 * Origin = between the feet, y up is negative. Full height ≈ 640 units.
 * Arms are 2-bone IK chains: give each hand a target point.
 */
import React from "react";

export const INK = "#141414";
export const SKIN = "#FFFFFF";
export const SKIN_SHADE = "#E6E6E6";
export const SHIRT = "#EEF4F8";
export const SHIRT_SHADE = "#D3DEE6";
export const SHORTS = "#1D2440";
export const HAIR = "#141414";

export type Expression = "neutral" | "smile" | "scared" | "shock" | "calm" | "cold" | "tired" | "determined" | "relief" | "no";
export type Pt = { x: number; y: number };

export type HarrisonPose = {
  expression?: Expression;
  /** where the pupils look, -1..1 */
  lookX?: number;
  lookY?: number;
  /** fake head turn, -1..1 (shifts the features, hides an ear) */
  turn?: number;
  headTilt?: number;
  /** hand targets relative to the origin; omit for arms hanging */
  handL?: Pt; // character's right hand, on the viewer's left
  handR?: Pt;
  elbowUpL?: boolean;
  elbowUpR?: boolean;
  /** draw the two hands pressed together (praying) at this point */
  pray?: Pt | null;
  holdFlashlight?: boolean;
  flashlightOn?: number; // 0..1 glow at the lens
  sweat?: number; // 0..1
  blink?: number; // 0..1 (1 = closed)
  mouthOpen?: number; // 0..1 extra opening for talking/gasping
  breath?: number; // 0..1 chest rise
  shiver?: number; // jitter amount in units
  frame?: number; // for shiver noise
  /** hide everything below this y (e.g. under the water line) */
  legs?: boolean;
};

const SH_L = { x: -86, y: -398 };
const SH_R = { x: 86, y: -398 };
const UPPER = 110;
const FORE = 110;
const HEAD = { x: 0, y: -505 };

function ik(s: Pt, target: Pt, side: number, elbowUp: boolean): { e: Pt; h: Pt } {
  let dx = target.x - s.x;
  let dy = target.y - s.y;
  let d = Math.hypot(dx, dy);
  const max = UPPER + FORE - 0.5;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    d = max;
  }
  d = Math.max(d, 25);
  const a = Math.acos(Math.min(1, Math.max(-1, (UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d))));
  const base = Math.atan2(dy, dx);
  const c1 = { x: s.x + UPPER * Math.cos(base + a), y: s.y + UPPER * Math.sin(base + a) };
  const c2 = { x: s.x + UPPER * Math.cos(base - a), y: s.y + UPPER * Math.sin(base - a) };
  // elbows point outward (away from the body); prefer down unless asked for up
  const score = (p: Pt) => side * p.x * 1 + (elbowUp ? -p.y : p.y) * 0.6;
  const e = score(c1) > score(c2) ? c1 : c2;
  return { e, h: { x: s.x + dx, y: s.y + dy } };
}

/** Stick limb: a single ink line. */
const Limb: React.FC<{ pts: Pt[]; w?: number }> = ({ pts, w = 8 }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return <path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
};

/** Round white hand. */
const Fist: React.FC<{ p: Pt; r?: number }> = ({ p, r = 21 }) => (
  <circle cx={p.x} cy={p.y} r={r} fill={SKIN} stroke={INK} strokeWidth={6} />
);

/** Hand pressed to the face: a slightly larger mitten. */
const Palm: React.FC<{ p: Pt; side: number; angle?: number }> = ({ p, side, angle = 0 }) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(${angle}) scale(${side} 1)`}>
    <ellipse cx={0} cy={0} rx={22} ry={27} fill={SKIN} stroke={INK} strokeWidth={6} />
    <path d="M-8 -14 v16 M4 -16 v18" stroke={INK} strokeWidth={3} strokeLinecap="round" />
  </g>
);

const HC = { x: 0, y: -520 }; // head centre
const HR = 86; // head radius

function Eyes({ expression, lookX, lookY, blink, turn }: { expression: Expression; lookX: number; lookY: number; blink: number; turn: number }) {
  const cy = -522;
  const closed = expression === "calm" || blink > 0.6;
  const shock = expression === "shock";
  return (
    <g>
      {[-1, 1].map((s) => {
        const x = s * 30 + turn * 22 + (turn !== 0 && Math.sign(turn) !== s ? turn * 6 : 0);
        if (closed) {
          return <path key={s} d={`M${x - 12} ${cy} Q${x} ${cy + 9} ${x + 12} ${cy}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
        }
        if (expression === "tired") {
          return (
            <g key={s}>
              <path d={`M${x - 12} ${cy - 3} L${x + 12} ${cy - 3}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
              <ellipse cx={x + lookX * 4} cy={cy + 3} rx={6} ry={5} fill={INK} />
            </g>
          );
        }
        if (shock) {
          return (
            <g key={s}>
              <circle cx={x} cy={cy} r={17} fill="#fff" stroke={INK} strokeWidth={5} />
              <circle cx={x + lookX * 6} cy={cy + lookY * 6} r={6} fill={INK} />
            </g>
          );
        }
        const ry = expression === "scared" ? 11 : expression === "determined" ? 7 : 10;
        return <ellipse key={s} cx={x + lookX * 7} cy={cy + lookY * 6} rx={7.5} ry={ry} fill={INK} />;
      })}
    </g>
  );
}

function Brows({ expression, turn }: { expression: Expression; turn: number }) {
  const shapes: Record<Expression, [number, number]> = {
    // [lift, inner tilt (+ = inner ends up = worried, - = angry)]
    neutral: [0, 0], smile: [2, 0], scared: [6, 12], shock: [14, 4], calm: [0, 3], cold: [4, 10],
    tired: [-2, 7], determined: [-3, -11], relief: [4, 7], no: [0, -5],
  };
  const [lift, tilt] = shapes[expression];
  const y = -548 - lift;
  return (
    <g>
      {[-1, 1].map((s) => {
        const x = s * 30 + turn * 22;
        const inner = x - s * 14;
        const outer = x + s * 14;
        return (
          <path key={s} d={`M${inner} ${y - tilt * 0.5} Q${x} ${y - 5 - tilt * 0.2} ${outer} ${y + tilt * 0.35}`}
            stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        );
      })}
    </g>
  );
}

function Mouth({ expression, open, turn }: { expression: Expression; open: number; turn: number }) {
  const x = turn * 22;
  const y = -474;
  const o = Math.min(1, open);
  if (expression === "shock" || expression === "scared" || o > 0.15) {
    const h = expression === "shock" ? 13 + o * 6 : expression === "scared" ? 7 + o * 7 : 3 + o * 11;
    const w = expression === "shock" ? 10 : 14;
    return (
      <g>
        <ellipse cx={x} cy={y} rx={w} ry={h} fill="#fff" stroke={INK} strokeWidth={5} />
        {expression === "scared" && <path d={`M${x - w + 3} ${y} H${x + w - 3}`} stroke={INK} strokeWidth={3} />}
      </g>
    );
  }
  if (expression === "cold") {
    return (
      <g>
        <rect x={x - 16} y={y - 7} width={32} height={14} rx={5} fill="#fff" stroke={INK} strokeWidth={4} />
        <path d={`M${x - 5} ${y - 7} v14 M${x + 5} ${y - 7} v14 M${x - 16} ${y} h32`} stroke={INK} strokeWidth={2.5} />
      </g>
    );
  }
  const curve = expression === "smile" ? 9 : expression === "relief" ? 6 : expression === "neutral" ? 4 : expression === "tired" ? -3 : expression === "no" ? -5 : 0;
  return <path d={`M${x - 14} ${y} Q${x} ${y + curve} ${x + 14} ${y}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
}

export const HarrisonHead: React.FC<{ pose: HarrisonPose }> = ({ pose }) => {
  const e = pose.expression ?? "neutral";
  const turn = pose.turn ?? 0;
  const fx = turn * 22; // face features shift with the turn
  const a0 = (175 * Math.PI) / 180;
  const a1 = (5 * Math.PI) / 180;
  const bx = (a: number) => HC.x + Math.cos(a) * HR;
  const by = (a: number) => HC.y + Math.sin(a) * HR;
  return (
    <g transform={`rotate(${pose.headTilt ?? 0} 0 -440)`}>
      {/* round white head */}
      <circle cx={HC.x} cy={HC.y} r={HR} fill={SKIN} stroke={INK} strokeWidth={6} />
      {/* stubble beard: a band along the jaw, thicker at the chin */}
      <clipPath id="harrison-head"><circle cx={HC.x} cy={HC.y} r={HR - 2} /></clipPath>
      <g clipPath="url(#harrison-head)">
        <path d={`M${bx(a0)} ${by(a0)} A${HR} ${HR} 0 0 0 ${bx(a1)} ${by(a1)}
          C${70 + fx * 0.3} -496 ${58 + fx} -452 ${18 + fx} -452 C${10 + fx} -462 ${-10 + fx} -462 ${-18 + fx} -452 C${-58 + fx} -452 ${-70 + fx * 0.3} -496 ${bx(a0)} ${by(a0)} Z`}
          fill={HAIR} />
        {/* moustache */}
        <path d={`M${-22 + fx} -486 Q${fx} -498 ${22 + fx} -486 Q${fx} -490 ${-22 + fx} -486 Z`} fill={HAIR} stroke={HAIR} strokeWidth={6} strokeLinejoin="round" />
      </g>
      <circle cx={HC.x} cy={HC.y} r={HR} fill="none" stroke={INK} strokeWidth={6} />
      {/* messy hair tufts on top */}
      {[[-52, -586, -70, -618, -86, -626], [-26, -600, -36, -636, -52, -648], [-4, -604, 0, -640, -14, -656], [18, -602, 30, -636, 24, -652], [40, -594, 58, -620, 70, -634]].map(([x1, y1, cx, cy, x2, y2], i) => (
        <path key={i} d={`M${x1 + turn * 8} ${y1} Q${cx + turn * 8} ${cy} ${x2 + turn * 8} ${y2}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
      <Eyes expression={e} lookX={pose.lookX ?? 0} lookY={pose.lookY ?? 0} blink={pose.blink ?? 0} turn={turn} />
      <Brows expression={e} turn={turn} />
      <Mouth expression={e} open={pose.mouthOpen ?? 0} turn={turn} />
      {/* sweat drops */}
      {(pose.sweat ?? 0) > 0.05 && (
        <g opacity={Math.min(1, pose.sweat ?? 0)}>
          {[[-112, -572, -20], [114, -578, 20], [-128, -540, -35], [130, -536, 35]].map(([x, y, r], i) => (
            <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M0 -14 C8 -2 10 6 0 10 C-10 6 -8 -2 0 -14 Z" fill="#8FD3F4" stroke={INK} strokeWidth={3} />
          ))}
        </g>
      )}
    </g>
  );
};

export const Harrison: React.FC<{ pose?: HarrisonPose; x?: number; y?: number; scale?: number; flip?: boolean }> = ({
  pose = {}, x = 0, y = 0, scale = 1, flip = false,
}) => {
  const f = pose.frame ?? 0;
  const sv = pose.shiver ?? 0;
  const jx = sv ? Math.sin(f * 2.7) * sv + Math.sin(f * 5.3) * sv * 0.5 : 0;
  const jy = sv ? Math.cos(f * 3.1) * sv * 0.4 : 0;
  const breath = pose.breath ?? 0;
  const lift = -breath * 6;

  const restL = { x: -112, y: -186 };
  const restR = { x: 112, y: -186 };
  const tL = pose.pray ? { x: pose.pray.x - 8, y: pose.pray.y + 26 } : pose.handL ?? restL;
  const tR = pose.pray ? { x: pose.pray.x + 8, y: pose.pray.y + 26 } : pose.handR ?? restR;
  const shL = { x: SH_L.x, y: SH_L.y + lift };
  const shR = { x: SH_R.x, y: SH_R.y + lift };
  const aL = ik(shL, tL, -1, !!pose.elbowUpL);
  const aR = ik(shR, tR, 1, !!pose.elbowUpR);
  const handsOnFace = (p?: Pt) => !!p && p.y < -430 && Math.abs(p.x) < 120;
  const legs = pose.legs !== false;

  return (
    <g transform={`translate(${x + jx} ${y + jy}) scale(${flip ? -scale : scale} ${scale})`}>
      {legs && (
        <g>
          <Limb pts={[{ x: -40, y: -200 }, { x: -44, y: -100 }, { x: -46, y: -8 }]} />
          <Limb pts={[{ x: 40, y: -200 }, { x: 44, y: -100 }, { x: 46, y: -8 }]} />
          <Limb pts={[{ x: -46, y: -8 }, { x: -82, y: -8 }]} />
          <Limb pts={[{ x: 46, y: -8 }, { x: 82, y: -8 }]} />
          {/* shorts */}
          <path d="M-86 -262 L86 -262 L94 -148 L10 -148 L0 -196 L-10 -148 L-94 -148 Z" fill={SHORTS} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
      )}
      {/* neck */}
      <path d={`M0 -436 L0 ${-400 + lift}`} stroke={INK} strokeWidth={8} />
      {/* sleeves first (they point along the upper arm), then the shirt body over their inner ends */}
      {[{ s: shL, e: aL.e, side: -1 }, { s: shR, e: aR.e, side: 1 }].map(({ s, e, side }) => {
        const ang = (Math.atan2(e.y - s.y, e.x - s.x) * 180) / Math.PI;
        return (
          <g key={side} transform={`translate(${s.x} ${s.y}) rotate(${ang})`}>
            <path d="M-30 -32 L50 -26 L52 26 L-30 32 Z" fill={SHIRT} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          </g>
        );
      })}
      <g transform={`translate(0 ${lift})`}>
        <path d="M-90 -404 C-60 -414 -36 -416 -26 -412 C-14 -398 14 -398 26 -412 C36 -416 60 -414 90 -404 L96 -250 L-96 -250 Z"
          fill={SHIRT} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M-26 -412 C-14 -394 14 -394 26 -412" stroke={INK} strokeWidth={5} fill="none" />
      </g>
      {/* arms come out of the sleeve openings */}
      {[{ s: shL, a: aL }, { s: shR, a: aR }].map(({ s, a }, i) => {
        const dx = a.e.x - s.x;
        const dy = a.e.y - s.y;
        const d = Math.hypot(dx, dy) || 1;
        const cuff = { x: s.x + (dx / d) * 46, y: s.y + (dy / d) * 46 };
        return <Limb key={i} pts={[cuff, a.e, a.h]} />;
      })}
      <HarrisonHead pose={pose} />
      {/* hands (after the head so hands on the face sit in front) */}
      {pose.pray ? (
        <g transform={`translate(${pose.pray.x} ${pose.pray.y})`}>
          <path d="M-22 40 C-30 10 -24 -36 -4 -62 C-2 -64 2 -64 4 -62 C24 -36 30 10 22 40 Z" fill={SKIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M0 -58 L0 38" stroke={INK} strokeWidth={4} />
        </g>
      ) : (
        <>
          {handsOnFace(pose.handL) ? <Palm p={aL.h} side={-1} angle={-8} /> : <Fist p={aL.h} />}
          {handsOnFace(pose.handR) ? <Palm p={aR.h} side={1} angle={8} /> : <Fist p={aR.h} />}
        </>
      )}
      {pose.holdFlashlight && (
        <g transform={`translate(${aR.h.x} ${aR.h.y - 6}) rotate(-28)`}>
          <rect x={-14} y={-12} width={74} height={24} rx={5} fill="#3B4250" stroke={INK} strokeWidth={5} />
          <rect x={56} y={-18} width={20} height={36} rx={4} fill="#59616F" stroke={INK} strokeWidth={5} />
          <circle cx={78} cy={0} r={13} fill={pose.flashlightOn ? `rgba(255,244,190,${0.4 + 0.6 * pose.flashlightOn})` : "#2A2F38"} />
          <Fist p={{ x: 0, y: 6 }} r={22} />
        </g>
      )}
    </g>
  );
};

/** Hand target presets */
export const HANDS_ON_FACE = { handL: { x: -78, y: -478 }, handR: { x: 78, y: -478 } };
export const ARMS_OUT_WATER = { handL: { x: -230, y: -300 }, handR: { x: 230, y: -300 } };
