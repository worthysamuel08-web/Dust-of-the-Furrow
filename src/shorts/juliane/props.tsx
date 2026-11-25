/** Props for "The Girl Who Fell From the Sky": airliner, seat row, jungle, hut, boat, fuel can, dog, walk cycle. */
import React from "react";
import { INK, type Pt } from "../airpocket/Harrison";
import { H, W, rnd, waveD, waveLine } from "../airpocket/kit";

// ---------- the airliner (four-prop, side view, nose to the right; origin = centre) ----------
/** part: "all" | "front" | "rear" — the plane breaks at x = split */
export const Plane: React.FC<{ t: number; part?: "all" | "front" | "rear"; split?: number; lit?: boolean }> = ({ t, part = "all", split = -40, lit = true }) => {
  const id = `plane-${part}`;
  const clip = part === "all" ? undefined : `url(#${id})`;
  const spin = (t * 40) % 1;
  return (
    <g>
      {part !== "all" && (
        <clipPath id={id}>
          {part === "front"
            ? <path d={`M${split} -400 L${split + 30} -40 L${split - 20} 20 L${split + 20} 400 L1000 400 L1000 -400 Z`} />
            : <path d={`M${split} -400 L${split + 30} -40 L${split - 20} 20 L${split + 20} 400 L-1000 400 L-1000 -400 Z`} />}
        </clipPath>
      )}
      <g clipPath={clip}>
        {/* tail fin + stabiliser */}
        <path d="M-430 -20 L-500 -190 L-430 -190 L-330 -40 Z" fill="#E7EBEE" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d="M-480 -150 L-440 -150 L-400 -80" stroke="#C0392B" strokeWidth={14} fill="none" />
        {/* fuselage */}
        <path d="M-500 -40 Q-480 -80 -380 -70 L330 -70 Q460 -70 500 0 Q460 60 330 60 L-380 60 Q-470 40 -500 -40 Z" fill="#F4F6F7" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d="M-470 6 L470 6" stroke="#C0392B" strokeWidth={12} />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={-330 + i * 50} y={-44} width={26} height={30} rx={10} fill={lit ? "#FFE7A0" : "#3B5266"} stroke={INK} strokeWidth={5} />
        ))}
        <path d="M420 -46 Q450 -40 470 -14 L430 -14 Z" fill="#9FD3EE" stroke={INK} strokeWidth={5} />
        {/* wing + two engines (we see the near side) */}
        <path d="M-60 20 L220 20 L120 150 L-20 150 Z" fill="#DCE2E6" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {[30, 150].map((x) => (
          <g key={x} transform={`translate(${x} 60)`}>
            <rect x={-10} y={-24} width={110} height={44} rx={20} fill="#C9D1D8" stroke={INK} strokeWidth={6} />
            <g transform={`translate(104 -2)`}>
              <ellipse rx={10} ry={80 * Math.abs(Math.cos(spin * Math.PI * 2))} fill="#5E6E7A" opacity={0.6} />
              <circle r={10} fill="#5E6E7A" stroke={INK} strokeWidth={4} />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
};

// ---------- a row of three airline seats (front view); origin = floor centre ----------
export const SEAT_HIP_Y = -190; // where a sitter's hips go (relative to the row origin)
export const SeatBacks: React.FC<{ color?: string }> = ({ color = "#3F6FB5" }) => (
  <g>
    {[-180, 0, 180].map((x) => (
      <g key={x}>
        <rect x={x - 82} y={-560} width={164} height={360} rx={30} fill={color} stroke={INK} strokeWidth={8} />
        <rect x={x - 60} y={-548} width={120} height={60} rx={14} fill="#EDEFF1" stroke={INK} strokeWidth={5} />
      </g>
    ))}
  </g>
);
export const SeatFront: React.FC<{ color?: string; legs?: boolean }> = ({ color = "#3F6FB5", legs = true }) => (
  <g>
    {[-180, 0, 180].map((x) => (
      <rect key={x} x={x - 86} y={-220} width={172} height={50} rx={16} fill={color} stroke={INK} strokeWidth={8} />
    ))}
    {[-270, -90, 90, 270].map((x) => (
      <rect key={x} x={x - 12} y={-300} width={24} height={100} rx={10} fill="#8E9AA5" stroke={INK} strokeWidth={6} />
    ))}
    {legs && <path d="M-220 -170 L-240 -40 M220 -170 L240 -40 M-240 -40 H240" stroke="#8E9AA5" strokeWidth={14} fill="none" strokeLinecap="round" />}
  </g>
);
/** Lap belt over a sitter at x */
export const LapBelt: React.FC<{ x?: number }> = ({ x = 0 }) => (
  <g>
    <path d={`M${x - 100} -206 Q${x} -196 ${x + 100} -206`} stroke="#6B7480" strokeWidth={18} fill="none" strokeLinecap="round" />
    <rect x={x - 22} y={-216} width={44} height={24} rx={5} fill="#C9D1D8" stroke={INK} strokeWidth={5} />
  </g>
);
/** Seated pose bits for the rig (origin of the sitter = row origin) */
export const SEATED = { footL: { x: -44, y: -40 }, footR: { x: 44, y: -40 } };

// ---------- jungle ----------
const blob = (cx: number, cy: number, r: number, seed: number, n = 9) => {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.82 + rnd(seed + i) * 0.3);
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr * 0.8).toFixed(1)} `;
  }
  return `${d}Z`;
};
/** Layered rainforest: back canopy, trunks, vines, front leaves. `ground` = y of the forest floor. */
export const Jungle: React.FC<{ t: number; ground?: number; dark?: number; front?: boolean }> = ({ t, ground = 1420, dark = 0, front = true }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#2E6B3A" />
    <rect x={-300} y={-300} width={W + 600} height={500} fill="#8FD18A" opacity={0.6} />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={blob(-60 + i * 150, 120 + (i % 3) * 70, 190, i * 7)} fill="#245A2F" stroke={INK} strokeWidth={5} />)}
    {/* trunks */}
    {[90, 330, 700, 960].map((x, i) => (
      <path key={x} d={`M${x - 30 - i * 3} ${ground + 20} L${x - 18} 200 L${x + 18} 200 L${x + 30 + i * 3} ${ground + 20} Z`} fill="#5A3E2B" stroke={INK} strokeWidth={6} />
    ))}
    {/* vines */}
    {[180, 520, 840].map((x, i) => (
      <path key={x} d={`M${x} 150 Q${x + 40 + Math.sin(t + i) * 12} 500 ${x - 10} 820`} stroke="#3F7F3A" strokeWidth={10} fill="none" strokeLinecap="round" />
    ))}
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={blob(i * 180, 520 + (i % 2) * 90, 120, 50 + i * 5)} fill="#2F7A3B" stroke={INK} strokeWidth={5} />)}
    {/* forest floor */}
    <path d={`M-300 ${ground} Q300 ${ground - 30} 540 ${ground} T1380 ${ground - 10} L1380 ${H + 300} L-300 ${H + 300} Z`} fill="#4A3524" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 18 }, (_, i) => (
      <ellipse key={i} cx={rnd(i) * W} cy={ground + 30 + rnd(i + 3) * 300} rx={26} ry={10} fill={["#6B8E3A", "#8A6A3A", "#556B2F"][i % 3]} transform={`rotate(${rnd(i + 5) * 60 - 30} ${rnd(i) * W} ${ground + 30 + rnd(i + 3) * 300})`} />
    ))}
    {front && (
      <g>
        {[[-40, 300, -30], [1110, 420, 30], [-60, 980, -10], [1130, 1100, 20]].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r + Math.sin(t * 1.2 + i) * 3})`}>
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M0 0 Q${(i % 2 ? -1 : 1) * 160} ${-60 + k * 70} ${(i % 2 ? -1 : 1) * 300} ${-20 + k * 80}`} stroke="#1E4D27" strokeWidth={44} fill="none" strokeLinecap="round" />
            ))}
          </g>
        ))}
      </g>
    )}
    {dark > 0 && <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#000" opacity={dark} />}
  </g>
);

/** Treetops seen from above-ish (for the fall): a carpet of round crowns. */
export const Canopy: React.FC<{ y: number; t: number }> = ({ y, t }) => (
  <g>
    <rect x={-300} y={y + 60} width={W + 600} height={H + 600} fill="#1E4D27" />
    {Array.from({ length: 4 }, (_, row) =>
      Array.from({ length: 9 }, (_, i) => {
        const cx = -80 + i * 160 + (row % 2) * 80;
        const cy = y + row * 120 + Math.sin(t * 2 + i) * 4;
        return <path key={`${row}-${i}`} d={blob(cx, cy, 110 + row * 15, row * 20 + i)} fill={["#3E8E41", "#2F7A3B", "#4FA34F", "#2B6B34"][(i + row) % 4]} stroke={INK} strokeWidth={6} />;
      }),
    )}
  </g>
);

/** A shallow stream with ripples, between y0 and y1 */
export const Stream: React.FC<{ t: number; y: number; y1?: number }> = ({ t, y, y1 = H + 200 }) => (
  <g>
    <path d={waveD(y, 8, 220, t * 2.5, -200, W + 200, y1)} fill="rgba(70,150,170,0.78)" />
    <path d={waveLine(y, 8, 220, t * 2.5)} stroke="#CFF3FF" strokeWidth={6} fill="none" />
    {[0, 1, 2].map((i) => <path key={i} d={`M${((t * 120 + i * 400) % (W + 300)) - 150} ${y + 80 + i * 60} q40 -14 80 0`} stroke="#CFF3FF" strokeWidth={5} fill="none" opacity={0.7} />)}
  </g>
);

// ---------- riverbank things ----------
export const Hut: React.FC = () => (
  <g>
    <path d="M-200 -170 L0 -330 L200 -170 Z" fill="#C9A55A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-170 + i * 48} -176 L${-120 + i * 32} -290`} stroke="#9C7C3C" strokeWidth={5} />)}
    <rect x={-160} y={-170} width={320} height={170} fill="#8A6A44" stroke={INK} strokeWidth={8} />
    {[-160, 160].map((x) => <rect key={x} x={x - 10} y={-170} width={20} height={230} fill="#5A3E2B" stroke={INK} strokeWidth={6} />)}
    <rect x={-50} y={-120} width={100} height={120} fill="#3B2A1C" stroke={INK} strokeWidth={6} />
  </g>
);
export const Boat: React.FC = () => (
  <g>
    <path d="M-220 -30 L220 -30 Q200 30 150 40 L-160 40 Q-210 20 -220 -30 Z" fill="#7A5232" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M-200 -10 H200" stroke="#5A3E2B" strokeWidth={6} />
    <rect x={-250} y={-80} width={50} height={60} rx={8} fill="#3B4250" stroke={INK} strokeWidth={6} />
    <path d="M-235 -20 L-240 40" stroke={INK} strokeWidth={10} />
  </g>
);
export const FuelCan: React.FC<{ tilt?: number }> = ({ tilt = 0 }) => (
  <g transform={`rotate(${tilt})`}>
    <rect x={-50} y={-130} width={100} height={130} rx={12} fill="#D8432F" stroke={INK} strokeWidth={8} />
    <path d="M-30 -130 L-30 -158 L10 -158 L10 -130" fill="none" stroke={INK} strokeWidth={10} />
    <path d="M30 -130 L56 -170" stroke={INK} strokeWidth={16} strokeLinecap="round" />
    <path d="M30 -130 L56 -170" stroke="#B03524" strokeWidth={8} strokeLinecap="round" />
    <path d="M-30 -96 L30 -34 M30 -96 L-30 -34" stroke="#F2C230" strokeWidth={8} />
  </g>
);
/** Simple stick dog, facing right; origin = between its feet */
export const Dog: React.FC<{ t: number; sad?: boolean }> = ({ t, sad = true }) => (
  <g>
    <path d="M-110 -110 Q-150 -140 -150 -180" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" transform={`rotate(${sad ? 30 : Math.sin(t * 12) * 15} -110 -110)`} />
    <ellipse cx={0} cy={-110} rx={120} ry={46} fill="#E6C08A" stroke={INK} strokeWidth={7} />
    {[-80, -40, 50, 90].map((x) => <path key={x} d={`M${x} -76 L${x} 0`} stroke={INK} strokeWidth={10} strokeLinecap="round" />)}
    <circle cx={130} cy={-160} r={52} fill="#E6C08A" stroke={INK} strokeWidth={7} />
    <path d="M98 -196 Q86 -150 108 -130" fill="#B98A4E" stroke={INK} strokeWidth={6} />
    <ellipse cx={180} cy={-150} rx={16} ry={12} fill={INK} />
    <circle cx={140} cy={-172} r={7} fill={INK} />
    <path d="M-30 -130 l30 10 l-26 14" stroke="#C0392B" strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

/** Maggot (cartoon, tiny); origin = its centre */
export const Maggot: React.FC<{ x: number; y: number; t: number; i: number; s?: number }> = ({ x, y, t, i, s = 1 }) => {
  const w = Math.sin(t * 14 + i * 1.7) * 6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rnd(i) * 180 + w * 3}) scale(${s})`}>
      <path d={`M-14 0 Q-7 ${w} 0 0 T14 0`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={`M-14 0 Q-7 ${w} 0 0 T14 0`} stroke="#F6F1DE" strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ---------- walking ----------
/** Feet + hands for a walk/wade cycle (front-ish view). speed = steps per second. */
export const walk = (t: number, speed = 1.6, stride = 34, lift = 50): { footL: Pt; footR: Pt; handL: Pt; handR: Pt; bob: number } => {
  const p = t * speed * Math.PI;
  const a = Math.sin(p);
  return {
    footL: { x: -46 - a * stride * 0.4, y: -8 - Math.max(0, a) * lift },
    footR: { x: 46 - a * stride * 0.4, y: -8 - Math.max(0, -a) * lift },
    handL: { x: -110 + a * 30, y: -200 - Math.max(0, -a) * 30 },
    handR: { x: 110 + a * 30, y: -200 - Math.max(0, a) * 30 },
    bob: -Math.abs(a) * 8,
  };
};
