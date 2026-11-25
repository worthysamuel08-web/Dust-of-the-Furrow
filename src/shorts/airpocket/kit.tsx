/** Shared drawing pieces for "Air Pocket": the boat, the diver, water, light, effects, helpers. */
import React from "react";
import { Easing, interpolate } from "remotion";
import { INK, SKIN } from "./Harrison";

export const W = 1080;
export const H = 1920;

// ---------- timing helpers ----------
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 0→1 between seconds a and b (eased in-out by default) */
export const ramp = (t: number, a: number, b: number, ease: (x: number) => number = Easing.inOut(Easing.cubic)) =>
  ease(clamp01((t - a) / Math.max(1e-3, b - a)));
/** springy 0→1 pop starting at `at`, lasting `d` seconds */
export const pop = (t: number, at: number, d = 0.35) => (t < at ? 0 : Easing.out(Easing.back(2.2))(clamp01((t - at) / d)));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** decaying shake offset after a hit at `at` */
export const shake = (t: number, at: number, amp = 24, len = 0.5) => {
  if (t < at || t > at + len) return { x: 0, y: 0 };
  const k = 1 - (t - at) / len;
  return { x: Math.sin((t - at) * 90) * amp * k, y: Math.cos((t - at) * 77) * amp * k * 0.7 };
};
/** deterministic pseudo-random 0..1 */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const fadeIO = (t: number, dur: number, i = 0.12, o = 0.12) =>
  interpolate(t, [0, i, Math.max(i + 0.01, dur - o), dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ---------- the tugboat (upright; origin at the waterline, centre) ----------
export const Boat: React.FC<{ glowWindow?: number; lightsOn?: boolean }> = ({ glowWindow = 0, lightsOn = true }) => (
  <g>
    {/* hull */}
    <path d="M-390 -40 L390 -40 L350 60 Q330 130 250 140 L-290 140 Q-360 120 -390 -40 Z" fill="#B83A2E" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M-390 -40 L390 -40 L378 -6 L-384 -6 Z" fill="#20283B" stroke={INK} strokeWidth={6} />
    <path d="M-372 40 L360 40" stroke="#8E2A21" strokeWidth={8} />
    {/* tyre fenders */}
    {[-300, -150, 0, 150, 300].map((x) => (
      <ellipse key={x} cx={x} cy={18} rx={22} ry={26} fill="#1A1A1A" stroke={INK} strokeWidth={5} />
    ))}
    {/* deckhouse */}
    <rect x={-250} y={-210} width={380} height={170} rx={6} fill="#F2F2EC" stroke={INK} strokeWidth={8} />
    {[-200, -120, -40, 40].map((x, i) => (
      <circle key={x} cx={x} cy={-130} r={24} fill={i === 1 && glowWindow > 0 ? `rgba(255,226,140,${0.4 + 0.6 * glowWindow})` : lightsOn ? "#FFE7A0" : "#3B5266"} stroke={INK} strokeWidth={6} />
    ))}
    <rect x={80} y={-170} width={36} height={130} rx={4} fill="#C9CFD4" stroke={INK} strokeWidth={6} />
    {/* bridge */}
    <rect x={-170} y={-330} width={240} height={120} rx={6} fill="#F2F2EC" stroke={INK} strokeWidth={8} />
    <rect x={-150} y={-305} width={200} height={50} rx={4} fill={lightsOn ? "#9FD3EE" : "#2D4458"} stroke={INK} strokeWidth={6} />
    <path d="M-100 -305 v50 M-50 -305 v50 M0 -305 v50" stroke={INK} strokeWidth={5} />
    <rect x={-190} y={-346} width={280} height={22} rx={4} fill="#20283B" stroke={INK} strokeWidth={6} />
    {/* funnel + mast */}
    <path d="M150 -210 L170 -340 L250 -340 L240 -210 Z" fill="#E8862A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={164} y={-360} width={92} height={26} fill="#20283B" stroke={INK} strokeWidth={6} />
    <path d="M-60 -346 L-60 -470 M-100 -430 L-20 -430" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    {/* bow and stern rails */}
    <path d="M150 -40 L330 -40 M-380 -40 L-260 -40" stroke="#F2F2EC" strokeWidth={6} />
  </g>
);

// ---------- water ----------
export const waveD = (y: number, amp: number, len: number, phase: number, x0 = -200, x1 = W + 200, bottom = H + 200) => {
  let d = `M${x0} ${bottom} L${x0} ${y}`;
  for (let x = x0; x <= x1; x += 20) d += ` L${x} ${(y + Math.sin((x / len) * Math.PI * 2 + phase) * amp + Math.sin((x / (len * 0.43)) * Math.PI * 2 - phase * 1.3) * amp * 0.3).toFixed(1)}`;
  return `${d} L${x1} ${bottom} Z`;
};
/** Just the wavy surface line of waveD. */
export const waveLine = (y: number, amp: number, len: number, phase: number, x0 = -200, x1 = W + 200) => {
  let d = "";
  for (let x = x0; x <= x1; x += 20) d += `${x === x0 ? "M" : " L"}${x} ${(y + Math.sin((x / len) * Math.PI * 2 + phase) * amp + Math.sin((x / (len * 0.43)) * Math.PI * 2 - phase * 1.3) * amp * 0.3).toFixed(1)}`;
  return d;
};

/** Underwater backdrop (deep blue gradient + slow light shafts). */
export const Deep: React.FC<{ id: string; t: number; top?: string; bottom?: string; rays?: number }> = ({ id, t, top = "#11587C", bottom = "#030E18", rays = 0.18 }) => (
  <g>
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
      <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#BFF1FF" stopOpacity={rays} />
        <stop offset="1" stopColor="#BFF1FF" stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={`url(#${id}-g)`} />
    {rays > 0 && [0, 1, 2, 3].map((i) => {
      const x = 120 + i * 260 + Math.sin(t * 0.6 + i) * 40;
      return <path key={i} d={`M${x - 40} -100 L${x + 50} -100 L${x + 220} 1300 L${x - 30} 1300 Z`} fill={`url(#${id}-ray)`} />;
    })}
  </g>
);

/** Drifting specks in the water. */
export const Specks: React.FC<{ t: number; n?: number; opacity?: number }> = ({ t, n = 40, opacity = 0.5 }) => (
  <g opacity={opacity}>
    {Array.from({ length: n }, (_, i) => {
      const x = (rnd(i) * W + t * (8 + rnd(i + 9) * 14)) % W;
      const y = (rnd(i + 3) * H - t * (10 + rnd(i + 5) * 20) + H * 4) % H;
      return <circle key={i} cx={x} cy={y} r={2 + rnd(i + 7) * 3} fill="#CFEFFF" />;
    })}
  </g>
);

/** Rising bubbles from a point. */
export const Bubbles: React.FC<{ t: number; x: number; y: number; n?: number; spread?: number; speed?: number; seed?: number; rise?: number }> = ({
  t, x, y, n = 14, spread = 80, speed = 260, seed = 0, rise = 900,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const life = rise / speed;
      const born = rnd(i + seed) * life;
      const age = (t + born) % life;
      const by = y - age * speed;
      const bx = x + (rnd(i + seed + 40) - 0.5) * spread + Math.sin(age * 6 + i) * 12;
      const r = 5 + rnd(i + seed + 80) * 12;
      return <circle key={i} cx={bx} cy={by} r={r} fill="rgba(210,245,255,0.25)" stroke="#D8F6FF" strokeWidth={3} opacity={1 - age / life} />;
    })}
  </g>
);

/** Darkness with a soft hole of light. */
export const Darkness: React.FC<{ id: string; opacity: number; cx?: number; cy?: number; r?: number }> = ({ id, opacity, cx = W / 2, cy = H / 2, r = 0 }) => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id={`${id}-d`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={Math.max(1, r)}>
        <stop offset="0" stopColor="#000" stopOpacity={0} />
        <stop offset="0.55" stopColor="#000" stopOpacity={0.35} />
        <stop offset="1" stopColor="#000" stopOpacity={1} />
      </radialGradient>
    </defs>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={r > 0 ? `url(#${id}-d)` : "#000"} opacity={opacity} />
  </g>
);

/** Cone of light from (x,y) towards angle (deg, 0 = right). */
export const Beam: React.FC<{ id: string; x: number; y: number; angle: number; len?: number; spread?: number; opacity?: number; color?: string }> = ({
  id, x, y, angle, len = 900, spread = 22, opacity = 0.6, color = "#FFF2B8",
}) => {
  const a1 = ((angle - spread) * Math.PI) / 180;
  const a2 = ((angle + spread) * Math.PI) / 180;
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={opacity}>
      <defs>
        <radialGradient id={`${id}-b`} gradientUnits="userSpaceOnUse" cx={x} cy={y} r={len}>
          <stop offset="0" stopColor={color} stopOpacity={0.95} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={`M${x} ${y} L${x + Math.cos(a1) * len} ${y + Math.sin(a1) * len} L${x + Math.cos(a2) * len} ${y + Math.sin(a2) * len} Z`} fill={`url(#${id}-b)`} />
    </g>
  );
};

// ---------- the flooded upside-down room (cross-section) ----------
export const ROOM = { x0: 70, x1: 1010, y0: 260, y1: 1440, water: 760 };

/** Upside-down bathroom: the old floor is now the ceiling, the sink and toilet hang from it. */
export const FlippedRoom: React.FC<{ t: number; waterY?: number; tint?: number }> = ({ t, waterY = ROOM.water }) => {
  const { x0, x1, y0, y1 } = ROOM;
  return (
    <g>
      {/* air part of the room */}
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#5E7384" />
      {/* tiles (on the wall, upside down) */}
      {Array.from({ length: 9 }, (_, i) =>
        Array.from({ length: 6 }, (_, j) => (
          <rect key={`${i}-${j}`} x={x0 + 20 + i * 104} y={y0 + 70 + j * 104} width={96} height={96} fill="none" stroke="#4E6272" strokeWidth={4} />
        )),
      )}
      {/* old floor = ceiling, with a drain */}
      <rect x={x0} y={y0} width={x1 - x0} height={50} fill="#3E4A55" stroke={INK} strokeWidth={6} />
      <circle cx={760} cy={y0 + 25} r={12} fill="#22292F" stroke={INK} strokeWidth={4} />
      {/* sink hanging from the ceiling */}
      <g transform={`translate(240 ${y0 + 50})`}>
        <rect x={-12} y={0} width={24} height={110} fill="#C9D1D8" stroke={INK} strokeWidth={5} />
        <path d="M-90 110 L90 110 L70 170 Q0 186 -70 170 Z" fill="#EDEFF1" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </g>
      {/* toilet hanging upside down */}
      <g transform={`translate(860 ${y0 + 50})`}>
        <path d="M-60 0 L60 0 L50 70 L-50 70 Z" fill="#EDEFF1" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M-80 70 L80 70 Q78 150 0 160 Q-78 150 -80 70 Z" fill="#EDEFF1" stroke={INK} strokeWidth={6} />
        <rect x={-70} y={-0} width={140} height={14} fill="#C9D1D8" stroke={INK} strokeWidth={4} />
      </g>
      {/* door on the left wall, upside down: handle near the top */}
      <rect x={x0} y={y0 + 300} width={30} height={420} fill="#7A5A3A" stroke={INK} strokeWidth={6} />
      {/* water */}
      <path d={waveD(waterY, 6, 260, t * 2.2, x0, x1, y1)} fill="rgba(20,92,138,0.82)" />
      <path d={waveLine(waterY, 6, 260, t * 2.2, x0, x1)} fill="none" stroke="#9EDCF7" strokeWidth={6} opacity={0.8} />
      {/* steel walls */}
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke="#22292F" strokeWidth={26} />
      <rect x={x0 - 13} y={y0 - 13} width={x1 - x0 + 26} height={y1 - y0 + 26} fill="none" stroke={INK} strokeWidth={6} />
      {[x0 + 30, x1 - 30].map((x) => [y0 + 80, y0 + 400, y0 + 760, y1 - 60].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={6} fill="#22292F" />))}
    </g>
  );
};

/** Water drawn over the lower part of a character (so the body reads as submerged). */
export const WaterOver: React.FC<{ t: number; y: number; x0?: number; x1?: number; y1?: number; color?: string }> = ({
  t, y, x0 = ROOM.x0 + 13, x1 = ROOM.x1 - 13, y1 = ROOM.y1 - 13, color = "rgba(18,86,130,0.62)",
}) => (
  <g>
    <path d={waveD(y, 6, 260, t * 2.2, x0, x1, y1)} fill={color} />
    <path d={waveLine(y, 6, 260, t * 2.2, x0, x1)} fill="none" stroke="#BDEBFF" strokeWidth={6} />
  </g>
);

// ---------- the rescue diver (side view, facing right; origin = chest) ----------
export const Diver: React.FC<{ t: number; kick?: number; startle?: number }> = ({ t, kick = 1, startle = 0 }) => {
  const k = Math.sin(t * 6) * 14 * kick;
  return (
    <g transform={`rotate(${-startle * 14})`}>
      {/* legs + fins */}
      <g transform={`rotate(${k} -120 10)`}>
        <path d="M-120 10 L-260 -10" stroke={INK} strokeWidth={46} strokeLinecap="round" />
        <path d="M-120 10 L-260 -10" stroke="#1F2630" strokeWidth={34} strokeLinecap="round" />
        <path d="M-262 -24 L-380 -60 L-372 24 L-262 6 Z" fill="#F2C230" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </g>
      <g transform={`rotate(${-k} -120 30)`}>
        <path d="M-120 30 L-250 50" stroke={INK} strokeWidth={46} strokeLinecap="round" />
        <path d="M-120 30 L-250 50" stroke="#2A323E" strokeWidth={34} strokeLinecap="round" />
        <path d="M-252 36 L-370 30 L-352 108 L-252 66 Z" fill="#F2C230" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </g>
      {/* tank */}
      <rect x={-130} y={-88} width={190} height={56} rx={28} fill="#C8CDD3" stroke={INK} strokeWidth={6} />
      {/* body */}
      <ellipse cx={-30} cy={12} rx={130} ry={54} fill="#2A323E" stroke={INK} strokeWidth={7} />
      <path d="M-140 8 L80 8" stroke="#F2C230" strokeWidth={8} />
      {/* arm reaching forward */}
      <path d={`M40 20 L150 ${50 - startle * 70} L210 ${40 - startle * 120}`} stroke={INK} strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M40 20 L150 ${50 - startle * 70} L210 ${40 - startle * 120}`} stroke="#2A323E" strokeWidth={28} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* head + helmet */}
      <circle cx={140} cy={-30} r={64} fill="#2A323E" stroke={INK} strokeWidth={7} />
      <rect x={146} y={-70} width={74} height={62} rx={18} fill="#9BD8F0" stroke={INK} strokeWidth={7} />
      <circle cx={190} cy={-40} r={startle ? 12 : 8} fill={INK} />
      <circle cx={174} cy={-40} r={startle ? 12 : 8} fill={INK} opacity={0.9} />
      <rect x={110} y={-108} width={52} height={30} rx={8} fill="#F2C230" stroke={INK} strokeWidth={6} />
      <circle cx={162} cy={-93} r={13} fill="#FFF6C8" stroke={INK} strokeWidth={5} />
      {/* regulator hose */}
      <path d="M-10 -60 C60 -110 120 -10 160 4" stroke={INK} strokeWidth={10} fill="none" />
    </g>
  );
};

/** An arm + open hand reaching down (Harrison's hand found by the diver). Origin = wrist; arm comes from above. */
export const ReachingHand: React.FC<{ len?: number; spread?: number }> = ({ len = 380, spread = 1 }) => (
  <g>
    <path d={`M0 ${-len} L0 0`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
    <circle cx={0} cy={22} r={34} fill={SKIN} stroke={INK} strokeWidth={8} />
    <path d={`M${-14 - spread * 6} 40 l-6 ${14 + spread * 6} M0 50 v${14 + spread * 6} M${14 + spread * 6} 40 l6 ${14 + spread * 6}`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
  </g>
);

// ---------- graphics ----------
/** Big comic word with outline, e.g. BOOM! / KNOCK */
export const ComicText: React.FC<{ text: string; x: number; y: number; size?: number; k: number; rot?: number; fill?: string; opacity?: number }> = ({
  text, x, y, size = 200, k, rot = -8, fill = "#FFD23F", opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${Math.max(0, k)})`} opacity={opacity}>
    <text textAnchor="middle" dominantBaseline="middle" fontFamily="Inter" fontWeight={900} fontSize={size}
      fill={fill} stroke={INK} strokeWidth={size * 0.09} strokeLinejoin="round" paintOrder="stroke" letterSpacing={-size * 0.02}>
      {text}
    </text>
  </g>
);

/** Spiky burst behind comic words. */
export const Burst: React.FC<{ x: number; y: number; r: number; k: number; fill?: string; points?: number; rot?: number }> = ({ x, y, r, k, fill = "#FFFFFF", points = 14, rot = 0 }) => {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.62 : r * (0.9 + rnd(i) * 0.2);
    d += `${i ? "L" : "M"}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)} `;
  }
  return <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${Math.max(0, k)})`} d={`${d}Z`} fill={fill} stroke={INK} strokeWidth={8} strokeLinejoin="round" />;
};

/** Rounded label with an arrow, e.g. AIR POCKET */
export const Label: React.FC<{ text: string; x: number; y: number; k: number; size?: number; color?: string; textColor?: string }> = ({
  text, x, y, k, size = 64, color = "#FFD23F", textColor = INK,
}) => {
  const w = text.length * size * 0.66 + size * 0.9;
  const h = size * 1.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.max(0, k)})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={color} stroke={INK} strokeWidth={8} />
      <text textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={size} fill={textColor} letterSpacing={1}>
        {text}
      </text>
    </g>
  );
};

export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; k?: number; color?: string; w?: number; dash?: boolean }> = ({
  x1, y1, x2, y2, k = 1, color = "#FFD23F", w = 14, dash = false,
}) => {
  const ex = lerp(x1, x2, k);
  const ey = lerp(y1, y2, k);
  const a = Math.atan2(ey - y1, ex - x1);
  const hs = w * 2.6;
  const head = `M${ex + Math.cos(a) * hs * 0.5} ${ey + Math.sin(a) * hs * 0.5} L${ex + Math.cos(a + 2.5) * hs} ${ey + Math.sin(a + 2.5) * hs} L${ex + Math.cos(a - 2.5) * hs} ${ey + Math.sin(a - 2.5) * hs} Z`;
  if (k <= 0.01) return null;
  return (
    <g>
      <path d={`M${x1} ${y1} L${ex} ${ey}`} stroke={INK} strokeWidth={w + 12} strokeLinecap="round" strokeDasharray={dash ? `${w * 2.4} ${w * 2}` : undefined} />
      <path d={head} fill={INK} stroke={INK} strokeWidth={12} strokeLinejoin="round" />
      <path d={`M${x1} ${y1} L${ex} ${ey}`} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash ? `${w * 2.4} ${w * 2}` : undefined} />
      <path d={head} fill={color} />
    </g>
  );
};

/** Day counter card (DAY 1 / DAY 2 …) */
export const DayCard: React.FC<{ day: number; x: number; y: number; k: number; flip?: number; label?: string }> = ({ day, x, y, k, flip = 0, label = "DAY" }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0, k)})`}>
    <rect x={-170} y={-150} width={340} height={300} rx={28} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
    <rect x={-170} y={-150} width={340} height={86} rx={28} fill="#E0453A" stroke={INK} strokeWidth={10} />
    <rect x={-160} y={-90} width={320} height={26} fill="#E0453A" />
    <text x={0} y={-106} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={56} fill="#fff" letterSpacing={4}>{label}</text>
    <g transform={`scale(1 ${1 - flip * 0.9})`} style={{ transformOrigin: "0px 40px" }}>
      <text x={0} y={46} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={170} fill={INK}>{day}</text>
    </g>
    {[-110, 110].map((cx) => <rect key={cx} x={cx - 12} y={-176} width={24} height={56} rx={12} fill="#6B7480" stroke={INK} strokeWidth={6} />)}
  </g>
);
