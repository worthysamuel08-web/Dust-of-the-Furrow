/**
 * The three "promise" cards of Scene 2: hand-inked 2D illustrations on vellum,
 * in the same black-line style as the stickman. Pure SVG (cheap to render),
 * irregular edges from a seeded generator (deterministic).
 */
import "@fontsource/eb-garamond/400-italic.css";
import { useMemo } from "react";
import { seededRandom } from "../../engine/animation";

const INK = "#1b1611";
const W = 300;
const H = 380;

/** Rough, slightly torn vellum outline. */
const vellumPath = (seed: number) => {
  const rnd = seededRandom(seed);
  const pts: [number, number][] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const t = i / n;
      pts.push([x0 + (x1 - x0) * t + (rnd() - 0.5) * 5, y0 + (y1 - y0) * t + (rnd() - 0.5) * 5]);
    }
  };
  edge(6, 6, W - 6, 6, 14);
  edge(W - 6, 6, W - 6, H - 6, 18);
  edge(W - 6, H - 6, 6, H - 6, 14);
  edge(6, H - 6, 6, 6, 18);
  return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join("L") + "Z";
};

const Vellum: React.FC<{ seed: number; children: React.ReactNode; caption: string }> = ({ seed, children, caption }) => {
  const d = useMemo(() => vellumPath(seed), [seed]);
  const stains = useMemo(() => {
    const rnd = seededRandom(seed * 7 + 1);
    return Array.from({ length: 7 }, () => ({ x: 20 + rnd() * (W - 40), y: 20 + rnd() * (H - 40), r: 10 + rnd() * 34, o: 0.04 + rnd() * 0.06 }));
  }, [seed]);
  const id = `v${seed}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <radialGradient id={`${id}-g`} cx="45%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#f3e7c9" />
          <stop offset="70%" stopColor="#e2cfa4" />
          <stop offset="100%" stopColor="#c9b07c" />
        </radialGradient>
        <clipPath id={`${id}-c`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={`url(#${id}-g)`} />
      <g clipPath={`url(#${id}-c)`}>
        {stains.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#8a6a3a" opacity={s.o} />
        ))}
      </g>
      <path d={d} fill="none" stroke="#7d6640" strokeWidth={1.5} opacity={0.7} />
      {/* inner ruled frame, like a manuscript border */}
      <rect x={22} y={22} width={W - 44} height={H - 96} fill="none" stroke={INK} strokeWidth={2} opacity={0.75} />
      <g transform="translate(22,22)">{children}</g>
      <text
        x={W / 2}
        y={H - 38}
        textAnchor="middle"
        fontFamily="EB Garamond"
        fontStyle="italic"
        fontSize={25}
        fill={INK}
      >
        {caption}
      </text>
    </svg>
  );
};

const stroke = { stroke: INK, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

/** 1 · A sickle in golden wheat — the lord's harvest. */
export const HarvestCard: React.FC = () => {
  const stalks = useMemo(() => {
    const rnd = seededRandom(31);
    return Array.from({ length: 9 }, (_, i) => ({ x: 22 + i * 25 + (rnd() - 0.5) * 8, lean: (rnd() - 0.5) * 18, h: 170 + rnd() * 50 }));
  }, []);
  return (
    <Vellum seed={11} caption="another man's harvest">
      <rect x={0} y={0} width={W - 44} height={H - 96} fill="#d9b25a" opacity={0.25} />
      {stalks.map((s, i) => {
        const top = 262 - s.h;
        return (
          <g key={i}>
            <path d={`M${s.x},262 Q${s.x + s.lean * 0.3},${top + 80} ${s.x + s.lean},${top}`} {...stroke} strokeWidth={3} />
            {Array.from({ length: 5 }, (_, k) => (
              <ellipse
                key={k}
                cx={s.x + s.lean + (k % 2 ? 5 : -5)}
                cy={top + 6 + k * 11}
                rx={5}
                ry={8}
                transform={`rotate(${k % 2 ? 25 : -25} ${s.x + s.lean} ${top + 6 + k * 11})`}
                fill="#d4a13c"
                stroke={INK}
                strokeWidth={2}
              />
            ))}
          </g>
        );
      })}
      {/* sickle: iron crescent and wooden handle */}
      <path d="M150,205 C95,200 70,140 110,95 C130,72 165,70 182,84" {...stroke} strokeWidth={9} stroke="#2e2b28" />
      <path d="M150,205 C95,200 70,140 110,95 C130,72 165,70 182,84" {...stroke} strokeWidth={3} stroke="#8f8a82" />
      <path d="M150,205 L172,250" {...stroke} strokeWidth={13} stroke={INK} />
      <path d="M150,205 L172,250" {...stroke} strokeWidth={8} stroke="#8a5a2e" />
    </Vellum>
  );
};

/** 2 · A rolled parchment with a red seal — summoned to his court. */
export const CourtCard: React.FC = () => (
  <Vellum seed={23} caption="summoned to his court">
    {/* the roll */}
    <rect x={48} y={52} width={160} height={170} fill="#f6ecd2" stroke={INK} strokeWidth={4} />
    <ellipse cx={128} cy={52} rx={88} ry={14} fill="#eadbb5" stroke={INK} strokeWidth={4} />
    <ellipse cx={128} cy={222} rx={88} ry={14} fill="#eadbb5" stroke={INK} strokeWidth={4} />
    {/* court-hand lines */}
    {Array.from({ length: 8 }, (_, i) => (
      <path
        key={i}
        d={`M64,${80 + i * 16} q20,-3 40,0 t40,0 t${i % 3 === 0 ? 30 : 48},0`}
        stroke={INK}
        strokeWidth={2.2}
        fill="none"
        opacity={0.8}
      />
    ))}
    {/* red wax seal with ribbon tails */}
    <path d="M150,212 l-14,46 l12,-8 l8,12 z" fill="#7d1d16" stroke={INK} strokeWidth={2} />
    <path d="M166,212 l14,46 l-12,-8 l-8,12 z" fill="#7d1d16" stroke={INK} strokeWidth={2} />
    <circle cx={158} cy={205} r={26} fill="#a3271c" stroke={INK} strokeWidth={3} />
    <circle cx={158} cy={205} r={17} fill="none" stroke="#5e130d" strokeWidth={2} />
    <path d="M150,205 l8,-9 l8,9 l-8,9 z" fill="#5e130d" />
  </Vellum>
);

/** 3 · A cow led out through a gate by a stranger — the neighbour who said no. */
export const DistraintCard: React.FC = () => (
  <Vellum seed={37} caption="a neighbour who said no">
    {/* ground */}
    <path d="M0,240 Q128,228 256,240" {...stroke} strokeWidth={2.5} />
    {/* gate: posts and rails, swung open */}
    <path d="M22,240 L22,120 M64,240 L64,120" {...stroke} strokeWidth={7} stroke="#4a3320" />
    <path d="M22,140 L64,150 M22,180 L64,186 M22,220 L64,222 M22,140 L64,222" {...stroke} strokeWidth={5} stroke="#6b4a2b" />
    {/* the stranger: same white-headed ink figure, in a dark hood */}
    <g>
      <path d="M212,160 L212,220 M212,220 L200,256 M212,220 L224,256" {...stroke} />
      <path d="M212,178 L186,196" {...stroke} />
      <path d="M212,178 L230,204" {...stroke} />
      <path d="M190,150 Q212,96 236,150 Z" fill="#3a3530" stroke={INK} strokeWidth={3} />
      <circle cx={213} cy={142} r={19} fill="#f4f1ea" stroke={INK} strokeWidth={3.5} />
      <circle cx={206} cy={140} r={2.6} fill={INK} />
      <circle cx={217} cy={140} r={2.6} fill={INK} />
      <path d="M205,152 L219,150" {...stroke} strokeWidth={2.5} />
      <path d="M200,186 L230,182 L232,224 L196,226 Z" fill="#5a4a3a" stroke={INK} strokeWidth={3} />
    </g>
    {/* the rope */}
    <path d="M186,196 Q160,206 136,176" {...stroke} strokeWidth={2.5} stroke="#6d5a3c" />
    {/* the cow, walking away from the gate */}
    <g>
      <path d="M90,200 L86,246 M106,204 L104,248 M150,204 L152,248 M164,198 L170,244" {...stroke} />
      <ellipse cx={126} cy={186} rx={46} ry={26} fill="#f4f1ea" stroke={INK} strokeWidth={4} />
      <path d="M104,172 q10,-8 18,2 q-6,12 -18,-2 Z" fill={INK} />
      <path d="M134,196 q12,-10 20,0 q-8,12 -20,0 Z" fill={INK} />
      <ellipse cx={168} cy={168} rx={16} ry={13} fill="#f4f1ea" stroke={INK} strokeWidth={4} />
      <path d="M160,156 q-6,-10 2,-12 M176,156 q6,-10 -2,-12" {...stroke} strokeWidth={3} />
      <circle cx={172} cy={166} r={2.4} fill={INK} />
      <path d="M80,180 q-14,10 -8,30" {...stroke} strokeWidth={3} />
    </g>
  </Vellum>
);
