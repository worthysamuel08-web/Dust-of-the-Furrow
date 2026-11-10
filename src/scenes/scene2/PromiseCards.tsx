/**
 * The three "promise" cards of Scene 2, in the house style: a glowing
 * sunset panel (amber → purple) with a black silhouette illustration that
 * carries its own amber rim light, and a bold glowing caption. Pure SVG.
 */
import "@fontsource/inter/800.css";
import { useMemo } from "react";
import { seededRandom } from "../../engine/animation";

const INK = "#120f14";
const RIM = "#ffb35c";
const W = 300;
const H = 380;
const ART_H = 290; // illustration area; caption band below

const Panel: React.FC<{ id: string; caption: string; children: React.ReactNode }> = ({ id, caption, children }) => (
  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffd387" />
        <stop offset="45%" stopColor="#f28a4e" />
        <stop offset="100%" stopColor="#5a3166" />
      </linearGradient>
      <radialGradient id={`${id}-sun`} cx="50%" cy="58%" r="45%">
        <stop offset="0%" stopColor="#fff2c6" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#fff2c6" stopOpacity={0} />
      </radialGradient>
      <clipPath id={`${id}-clip`}>
        <rect x={0} y={0} width={W} height={H} rx={20} />
      </clipPath>
      {/* rim light: an amber copy of the silhouette, nudged up-left, behind it */}
      <filter id={`${id}-rim`} x="-10%" y="-10%" width="120%" height="120%">
        <feOffset in="SourceAlpha" dx={-3} dy={-3} result="o" />
        <feFlood floodColor={RIM} />
        <feComposite in2="o" operator="in" result="r" />
        <feGaussianBlur in="r" stdDeviation={0.6} result="rb" />
        <feMerge>
          <feMergeNode in="rb" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g clipPath={`url(#${id}-clip)`}>
      <rect x={0} y={0} width={W} height={H} fill={`url(#${id}-sky)`} />
      <rect x={0} y={0} width={W} height={ART_H} fill={`url(#${id}-sun)`} />
      <g filter={`url(#${id}-rim)`}>{children}</g>
      <rect x={0} y={ART_H} width={W} height={H - ART_H} fill="#1a1320" opacity={0.92} />
      <text
        x={W / 2}
        y={ART_H + 56}
        textAnchor="middle"
        fontFamily="Inter"
        fontWeight={800}
        fontSize={caption.length > 18 ? 17.5 : 21}
        letterSpacing="0.03em"
        fill="#fff5e6"
        style={{ filter: "drop-shadow(0 0 6px rgba(255,170,80,0.9))" }}
      >
        {caption}
      </text>
    </g>
    <rect x={1.5} y={1.5} width={W - 3} height={H - 3} rx={19} fill="none" stroke={RIM} strokeWidth={3} />
  </svg>
);

const ground = (y = ART_H - 30) => <rect x={0} y={y} width={W} height={ART_H - y} fill={INK} />;

/** 1 · A sickle in a field of wheat — the lord's harvest. */
export const HarvestCard: React.FC = () => {
  const stalks = useMemo(() => {
    const rnd = seededRandom(31);
    return Array.from({ length: 11 }, (_, i) => ({ x: 14 + i * 27 + (rnd() - 0.5) * 8, lean: (rnd() - 0.5) * 22, h: 140 + rnd() * 70 }));
  }, []);
  const base = ART_H - 30;
  return (
    <Panel id="harvest" caption="ANOTHER MAN'S HARVEST">
      {ground()}
      {stalks.map((s, i) => {
        const top = base - s.h;
        return (
          <g key={i}>
            <path d={`M${s.x},${base} Q${s.x + s.lean * 0.3},${top + 70} ${s.x + s.lean},${top}`} stroke={INK} strokeWidth={4} fill="none" />
            {Array.from({ length: 5 }, (_, k) => (
              <ellipse
                key={k}
                cx={s.x + s.lean + (k % 2 ? 5 : -5)}
                cy={top + 6 + k * 11}
                rx={5.5}
                ry={9}
                transform={`rotate(${k % 2 ? 25 : -25} ${s.x + s.lean} ${top + 6 + k * 11})`}
                fill={INK}
              />
            ))}
          </g>
        );
      })}
      {/* the sickle, held high */}
      <path d="M168,190 C108,186 84,120 126,74 C148,50 186,50 204,66" stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d="M168,190 L192,240" stroke={INK} strokeWidth={16} strokeLinecap="round" />
    </Panel>
  );
};

/** 2 · A court roll with a red seal — summoned to his court. */
export const CourtCard: React.FC = () => (
  <Panel id="court" caption="SUMMONED TO HIS COURT">
    {ground(ART_H - 22)}
    {/* the roll, as a silhouette with glowing lines of court hand */}
    <rect x={70} y={64} width={160} height={176} fill={INK} />
    <ellipse cx={150} cy={64} rx={88} ry={15} fill={INK} />
    <ellipse cx={150} cy={240} rx={88} ry={15} fill={INK} />
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d={`M88,${92 + i * 17} q20,-3 40,0 t40,0 t${i % 3 === 0 ? 30 : 46},0`} stroke="#ffb35c" strokeWidth={2.4} fill="none" opacity={0.85} />
    ))}
    {/* the lord's red seal: the one colour in the frame */}
    <path d="M168,226 l-14,44 l12,-8 l8,12 z" fill="#8f1f16" />
    <path d="M184,226 l14,44 l-12,-8 l-8,12 z" fill="#8f1f16" />
    <circle cx={176} cy={220} r={26} fill="#c2321f" />
    <circle cx={176} cy={220} r={17} fill="none" stroke="#7a160e" strokeWidth={3} />
    <path d="M168,220 l8,-9 l8,9 l-8,9 z" fill="#7a160e" />
  </Panel>
);

/** 3 · A stranger leads a cow out through a gate — the neighbour who said no. */
export const DistraintCard: React.FC = () => (
  <Panel id="distraint" caption="A NEIGHBOUR WHO SAID NO">
    {ground(ART_H - 34)}
    {/* the gate, swung open */}
    <path d="M26,258 L26,128 M70,258 L70,128" stroke={INK} strokeWidth={9} />
    <path d="M26,148 L70,158 M26,188 L70,194 M26,228 L70,230 M26,148 L70,230" stroke={INK} strokeWidth={6} />
    {/* the stranger: a hooded silhouette with white eyes */}
    <g>
      <path d="M232,168 L232,232 M232,232 L218,262 M232,232 L246,262" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path d="M232,190 L206,206" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M208,160 Q232,100 258,160 Z" fill={INK} />
      <circle cx={233} cy={150} r={21} fill={INK} />
      <ellipse cx={226} cy={148} rx={3.4} ry={4.2} fill="#f6f1e7" />
      <ellipse cx={238} cy={148} rx={3.4} ry={4.2} fill="#f6f1e7" />
      <path d="M227,160 L240,158" stroke="#f6f1e7" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M216,196 L250,192 L252,236 L212,238 Z" fill={INK} />
    </g>
    {/* the rope */}
    <path d="M206,206 Q180,216 158,186" stroke={INK} strokeWidth={3} fill="none" />
    {/* the cow, led away */}
    <g>
      <path d="M100,208 L96,256 M116,212 L114,258 M160,212 L162,258 M174,206 L180,254" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <ellipse cx={136} cy={194} rx={50} ry={28} fill={INK} />
      <ellipse cx={180} cy={174} rx={18} ry={14} fill={INK} />
      <path d="M172,162 q-6,-10 2,-13 M188,162 q6,-10 -2,-13" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={185} cy={172} r={2.8} fill="#f6f1e7" />
      <path d="M88,186 q-15,10 -9,32" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  </Panel>
);
