/**
 * The 16 pictures of "Air Pocket", one per narration beat.
 * Each gets t (seconds since the beat started), dur, the frame number,
 * and w(i) = when the beat's i-th script word starts (seconds, beat-relative),
 * so every action lands on its word.
 */
import React from "react";
import { Easing, interpolate } from "remotion";
import { ARMS_OUT_WATER, HANDS_ON_FACE, Harrison, HarrisonHead, INK, SKIN } from "./Harrison";
import {
  Arrow, Beam, Boat, Bubbles, Burst, ComicText, Darkness, DayCard, Deep, Diver, FlippedRoom, H, Label, ROOM, ReachingHand,
  Specks, W, WaterOver, clamp01, lerp, pop, ramp, rnd, shake, waveD, waveLine,
} from "./kit";

export type BeatProps = { t: number; dur: number; frame: number; w: (i: number) => number };
type Beat = React.FC<BeatProps>;

const Cam: React.FC<{ zoom?: number; cx?: number; cy?: number; dx?: number; dy?: number; rot?: number; children: React.ReactNode }> = ({
  zoom = 1, cx = W / 2, cy = H / 2, dx = 0, dy = 0, rot = 0, children,
}) => <g transform={`translate(${cx + dx} ${cy + dy}) rotate(${rot}) scale(${zoom}) translate(${-cx} ${-cy})`}>{children}</g>;

const blinkAt = (t: number, every = 3.1, offset = 0.7) => {
  const p = (t + offset) % every;
  return p < 0.12 ? Math.sin((p / 0.12) * Math.PI) : 0;
};

// Harrison floating in the flooded room: chest at the water line
const FLOAT_X = 540;
const FLOAT_Y = ROOM.water + 335;

// 1 — "Imagine being stuck at the bottom of the sea… for three days."
const Hook: Beat = ({ t, w }) => {
  const down = ramp(t, 0, w(8) + 0.2, Easing.inOut(Easing.quad));
  const camY = lerp(1500, 0, down);
  const k = pop(t, w(10) - 0.05, 0.4);
  const zoom = lerp(1, 1.12, ramp(t, w(9), w(11) + 0.6));
  return (
    <g>
      <Cam zoom={zoom} cy={1100}>
        <g transform={`translate(0 ${camY})`}>
          {/* the surface far above */}
          <rect x={-400} y={-2600} width={W + 800} height={1400} fill="#7FC7E8" />
          <path d={waveD(-1240, 14, 300, t * 2, -400, W + 400, -1150)} fill="#2F86B8" />
          <g transform="translate(0 -1150)">
            <Deep id="hook" t={t} top="#2F86B8" bottom="#020A12" rays={0.22} />
          </g>
          <rect x={-400} y={1250} width={W + 800} height={1400} fill="#020A12" />
          {/* sea bed */}
          <path d="M-400 1420 Q100 1340 540 1390 T1480 1360 L1480 2600 L-400 2600 Z" fill="#1A2A2E" stroke={INK} strokeWidth={8} />
          <path d="M120 1400 q20 -60 40 0 M880 1380 q16 -50 32 0 M940 1384 q12 -36 24 0" stroke="#2F5A3E" strokeWidth={10} fill="none" strokeLinecap="round" />
          {/* the upside-down tug resting on the bottom */}
          <g transform="translate(540 1250) rotate(180) scale(0.9)">
            <Boat glowWindow={0.4 + 0.3 * Math.sin(t * 3)} lightsOn={false} />
          </g>
        </g>
        <Specks t={t} n={36} opacity={0.35} />
      </Cam>
      <Darkness id="hook-v" opacity={0.75} r={1100} cy={1000} />
      {/* 3 DAYS stamp */}
      <g transform={`translate(540 420) rotate(-6) scale(${k})`} opacity={k > 0 ? 1 : 0}>
        <rect x={-300} y={-110} width={600} height={220} rx={30} fill="#E0453A" stroke={INK} strokeWidth={12} />
        <text textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={150} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">3 DAYS</text>
      </g>
    </g>
  );
};

// galley wall, used for the cook intro
const Galley: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#CFE2EA" />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-200 ${120 + i * 180} H${W + 200}`} stroke="#B3CBD6" strokeWidth={6} />)}
    {/* porthole with the sea */}
    <g transform="translate(820 470)">
      <circle r={130} fill="#9ED8F2" stroke={INK} strokeWidth={10} />
      <clipPath id="ph"><circle r={120} /></clipPath>
      <g clipPath="url(#ph)">
        <path d={waveD(10, 10, 120, t * 3, -200, 200, 200)} fill="#2F86B8" />
      </g>
      <circle r={130} fill="none" stroke="#8A97A3" strokeWidth={22} />
      <circle r={142} fill="none" stroke={INK} strokeWidth={6} />
    </g>
    {/* shelf with tins */}
    <rect x={60} y={560} width={420} height={22} fill="#8B6A48" stroke={INK} strokeWidth={6} />
    {[100, 190, 280, 370].map((x, i) => <rect key={x} x={x} y={470} width={70} height={90} rx={8} fill={["#E0453A", "#F2C230", "#4BA3C7", "#6DBE5A"][i]} stroke={INK} strokeWidth={6} />)}
    {/* counter + stove */}
    <rect x={-200} y={1180} width={W + 400} height={800} fill="#8FA3B0" stroke={INK} strokeWidth={8} />
    <rect x={-200} y={1160} width={W + 400} height={40} fill="#5E6E7A" stroke={INK} strokeWidth={8} />
  </g>
);

// 2 — "This really happened to a cook named Harrison."
const Cook: Beat = ({ t, w }) => {
  const sway = Math.sin(t * 1.6) * 1.5;
  const stir = Math.sin(t * 7);
  const name = pop(t, w(7) - 0.1, 0.45);
  const steam = ramp(t, w(5) - 0.2, w(5) + 0.4);
  return (
    <Cam rot={sway} zoom={lerp(1.08, 1, ramp(t, 0, 1.2))}>
      <Galley t={t} />
      <Harrison x={430} y={1500} scale={1.25} pose={{ expression: "smile", lookX: 0.5, blink: blinkAt(t), handR: { x: 220 + stir * 18, y: -300 + Math.cos(t * 7) * 10 }, handL: { x: -110, y: -200 } }} />
      {/* pot + ladle */}
      <g transform="translate(840 1180)">
        <path d={`M${-40 + stir * 22} -230 L${-10 + stir * 22} -40`} stroke={INK} strokeWidth={18} strokeLinecap="round" />
        <path d={`M${-40 + stir * 22} -230 L${-10 + stir * 22} -40`} stroke="#B9C2CA" strokeWidth={8} strokeLinecap="round" />
        <path d="M-150 -120 L150 -120 L130 0 L-130 0 Z" fill="#59616F" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <rect x={-170} y={-140} width={340} height={30} rx={10} fill="#6E7785" stroke={INK} strokeWidth={8} />
        {[0, 1, 2].map((i) => {
          const p = ((t * 0.7 + i / 3) % 1);
          return <path key={i} d={`M${-60 + i * 60} ${-150 - p * 260} q-20 -30 0 -60 q20 -30 0 -60`} stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={(1 - p) * (0.4 + 0.6 * steam)} />;
        })}
      </g>
      <g transform={`translate(540 360) scale(${name}) rotate(-3)`}>
        <rect x={-330} y={-120} width={660} height={240} rx={34} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
        <text y={-24} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={118} fill={INK}>HARRISON</text>
        <text y={70} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={800} fontSize={56} fill="#E0453A" letterSpacing={6}>SHIP'S COOK</text>
      </g>
    </Cam>
  );
};

// 3 — "He was just in the bathroom."
const Bathroom: Beat = ({ t, dur }) => {
  const rock = Math.sin(t * 2.4) * lerp(2, 7, t / dur);
  const flash = t > dur - 0.5 ? Math.max(0, Math.sin(((t - (dur - 0.5)) / 0.5) * Math.PI * 3)) : 0;
  return (
    <g>
      <Cam rot={rock} zoom={1.08}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#BFE0DA" />
        {Array.from({ length: 12 }, (_, i) => Array.from({ length: 22 }, (_, j) => (
          <rect key={`${i}${j}`} x={-200 + i * 120} y={-200 + j * 120} width={112} height={112} fill="#CFEAE4" stroke="#A6CFC7" strokeWidth={5} />
        )))}
        {/* porthole showing the storm */}
        <g transform="translate(820 420)">
          <circle r={110} fill={flash > 0.3 ? "#E8F4FF" : "#1B2638"} stroke="#8A97A3" strokeWidth={22} />
          <circle r={122} fill="none" stroke={INK} strokeWidth={6} />
          <path d={waveD(30 + Math.sin(t * 3) * 20, 18, 90, t * 5, -110, 110, 120)} fill="#0F3B57" />
        </g>
        {/* mirror + sink */}
        <rect x={250} y={420} width={260} height={320} rx={20} fill="#DFF3FA" stroke={INK} strokeWidth={8} />
        <path d="M290 470 L360 420 M300 560 L460 450" stroke="#fff" strokeWidth={12} strokeLinecap="round" />
        <rect x={360} y={1010} width={40} height={280} fill="#C9D1D8" stroke={INK} strokeWidth={6} />
        <path d="M200 900 L560 900 L520 1010 Q380 1040 240 1010 Z" fill="#F4F6F8" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d="M380 900 L380 850 L420 850" stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
        <rect x={-300} y={1500} width={W + 600} height={800} fill="#7F9AA6" stroke={INK} strokeWidth={8} />
        <Harrison x={640} y={1540} scale={1.2} pose={{ expression: "neutral", turn: -0.6, lookX: -1, lookY: -0.2, blink: blinkAt(t, 2.2), handL: { x: -150, y: -330 }, handR: { x: -40, y: -320 } }} />
      </Cam>
      <rect x={0} y={0} width={W} height={H} fill="#fff" opacity={flash * 0.25} />
    </g>
  );
};

// 4 — "Then — BOOM. A giant wave flips his boat over."
const Boom: Beat = ({ t, w, dur }) => {
  const boom = w(2);
  const sh = shake(t, boom, 34, 0.8);
  const flash = t >= boom ? Math.max(0, 1 - (t - boom) / 0.35) : 0;
  const waveK = ramp(t, boom, w(5) + 0.4, Easing.out(Easing.cubic));
  const flip = ramp(t, w(6) - 0.1, w(9) + 0.45, Easing.inOut(Easing.cubic));
  const lift = Math.sin(flip * Math.PI) * -260;
  const bob = Math.sin(t * 2.2) * 14;
  const word = pop(t, boom, 0.3);
  const wordOut = 1 - ramp(t, boom + 0.9, boom + 1.2);
  return (
    <g>
      <Cam dx={sh.x} dy={sh.y} zoom={lerp(1, 0.92, flip)}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0B1424" />
        {/* clouds */}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={(i * 340 + t * 30) % (W + 400) - 200} cy={200 + (i % 2) * 120} rx={260} ry={90} fill="#1A2438" />
        ))}
        {/* lightning */}
        {flash > 0.1 && <path d="M760 -20 L700 220 L770 230 L690 470" stroke="#FFF7C8" strokeWidth={14} fill="none" strokeLinejoin="round" opacity={flash} />}
        {/* back waves */}
        <path d={waveD(1150, 40, 380, t * 2.6)} fill="#123150" stroke={INK} strokeWidth={6} />
        {/* the boat */}
        <g transform={`translate(540 ${1180 + bob + lift}) rotate(${flip * 180 + Math.sin(t * 2.8) * (1 - flip) * 6}) translate(0 ${flip * -60})`}>
          <Boat glowWindow={1} lightsOn={flip < 0.5} />
        </g>
        {/* the giant wave rising from the right */}
        <path d={`M${W + 400} ${H + 200} L${W + 400} ${lerp(1700, 420, waveK)} Q${lerp(1500, 860, waveK)} ${lerp(1500, 300, waveK)} ${lerp(1300, 540, waveK)} ${lerp(1600, 560, waveK)}
          Q${lerp(1250, 700, waveK)} ${lerp(1500, 720, waveK)} ${lerp(1200, 620, waveK)} ${lerp(1700, 980, waveK)} L-300 ${H + 200} Z`}
          fill="#1C4D78" stroke={INK} strokeWidth={8} opacity={1 - flip * 0.6} />
        <path d={`M${lerp(1300, 540, waveK)} ${lerp(1600, 560, waveK)} q40 -60 120 -40 q-60 10 -60 70`} fill="#E6F6FF" stroke={INK} strokeWidth={5} opacity={waveK * (1 - flip)} />
        {/* front water */}
        <path d={waveD(1290, 30, 300, t * 3.1)} fill="#0F2C48" stroke={INK} strokeWidth={6} />
        {/* rain */}
        {Array.from({ length: 70 }, (_, i) => {
          const x = (rnd(i) * (W + 300) + t * 300) % (W + 300) - 150;
          const y = (rnd(i + 50) * H + t * 2200) % H;
          return <path key={i} d={`M${x} ${y} l-24 70`} stroke="#9FB8D0" strokeWidth={4} opacity={0.5} />;
        })}
        <Burst x={540} y={560} r={330} k={word * wordOut} fill="#fff" />
        <ComicText text="BOOM!" x={540} y={560} size={220} k={word * wordOut} />
      </Cam>
      <rect x={0} y={0} width={W} height={H} fill="#fff" opacity={flash * 0.85} />
      {t > dur - 0.15 && <rect x={0} y={0} width={W} height={H} fill="#000" opacity={(t - (dur - 0.15)) / 0.15} />}
    </g>
  );
};

// 5 — "And it sinks. All the way down."
const Sinks: Beat = ({ t, w, dur }) => {
  const sink = ramp(t, 0, dur, Easing.in(Easing.quad));
  const depth = Math.round(30 * ramp(t, 0.1, dur - 0.1, Easing.inOut(Easing.quad)));
  const dark = lerp(0, 0.6, sink);
  return (
    <g>
      <Deep id="sink" t={t} top={`rgb(${Math.round(lerp(47, 10, sink))},${Math.round(lerp(134, 40, sink))},${Math.round(lerp(184, 70, sink))})`} bottom="#020A12" rays={lerp(0.25, 0.04, sink)} />
      <Specks t={t * 3} n={50} opacity={0.5} />
      <g transform={`translate(540 ${lerp(380, 1050, sink)}) rotate(${180 + Math.sin(t * 1.5) * 5}) scale(0.95)`}>
        <Boat lightsOn={false} glowWindow={0.6} />
      </g>
      <Bubbles t={t} x={540} y={lerp(380, 1050, sink) - 100} n={22} spread={600} speed={420} seed={3} rise={1300} />
      <Darkness id="sink-d" opacity={dark} r={900} cy={1000} />
      {/* depth gauge */}
      <g transform="translate(910 300)">
        <rect x={-120} y={-80} width={240} height={160} rx={24} fill="rgba(0,0,0,0.55)" stroke="#BDEBFF" strokeWidth={6} />
        <text y={-34} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={800} fontSize={34} fill="#BDEBFF" letterSpacing={4}>DEPTH</text>
        <text y={28} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={76} fill="#fff">{depth} m</text>
      </g>
      {/* "all the way down" arrow */}
      <Arrow x1={130} y1={600} x2={130} y2={1300} k={ramp(t, w(2), w(5) + 0.3)} color="#BDEBFF" />
    </g>
  );
};

// 6 — "Now he's trapped. It's dark. The water is freezing. And he's only in his underwear."
const Trapped: Beat = ({ t, w, frame }) => {
  const dark = ramp(t, w(3), w(4) + 0.3);
  const cold = ramp(t, w(5), w(8) + 0.2);
  const punch = ramp(t, w(9), w(14), Easing.out(Easing.cubic));
  const thermo = pop(t, w(8) - 0.1, 0.4);
  const lightX = FLOAT_X + 150;
  const lightY = FLOAT_Y - 380;
  return (
    <g>
      <Cam zoom={lerp(1, 1.45, punch)} cy={lerp(H / 2, 820, punch)}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0A0F14" />
        <FlippedRoom t={t} />
        <g transform={`translate(0 ${Math.sin(t * 2.2) * 6})`}>
          <Harrison x={FLOAT_X} y={FLOAT_Y} pose={{
            expression: cold > 0.6 ? "cold" : "scared", lookX: Math.sin(t * 1.7) * 0.8, lookY: -0.3, blink: blinkAt(t, 2.6),
            ...ARMS_OUT_WATER, handR: { x: 150, y: -380 }, holdFlashlight: true, flashlightOn: 1, shiver: cold * 4 + punch * 3, frame, legs: true,
            sweat: 0,
          }} />
        </g>
        <WaterOver t={t} y={ROOM.water} />
        <Beam id="tr-beam" x={lightX + 40} y={lightY - 30} angle={-62} len={700} opacity={0.5 * dark} />
      </Cam>
      <Darkness id="tr-d" opacity={dark * 0.82} cx={lightX - 50} cy={lightY + 10} r={lerp(1400, 620, dark)} />
      {/* frost creeping in */}
      <g opacity={cold * 0.9}>
        <defs>
          <radialGradient id="frost" cx="0.5" cy="0.45" r="0.75">
            <stop offset="0.55" stopColor="#BFE8FF" stopOpacity={0} />
            <stop offset="1" stopColor="#E6F7FF" stopOpacity={0.85} />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#frost)" />
      </g>
      {/* thermometer */}
      <g transform={`translate(890 360) scale(${thermo})`}>
        <rect x={-46} y={-170} width={92} height={260} rx={46} fill="#fff" stroke={INK} strokeWidth={9} />
        <rect x={-16} y={-130} width={32} height={180} rx={16} fill="#E6EEF4" />
        <rect x={-16} y={lerp(-90, 20, ramp(t, w(8), w(8) + 0.9))} width={32} height={lerp(140, 30, ramp(t, w(8), w(8) + 0.9))} rx={16} fill="#4BA3E8" />
        <circle cx={0} cy={110} r={52} fill="#4BA3E8" stroke={INK} strokeWidth={9} />
        <path d="M-80 -120 l-40 0 M-86 -60 l-30 0 M-80 0 l-40 0" stroke="#BFE8FF" strokeWidth={10} strokeLinecap="round" />
      </g>
    </g>
  );
};

// 7 — "His flashlight dies. He can't see anything. He just keeps praying."
const Dark: Beat = ({ t, w, frame }) => {
  const dies = w(2);
  const flick = t < dies ? 1 : t < dies + 0.5 ? (Math.sin((t - dies) * 60) > 0.2 ? 1 : 0.15) * (1 - (t - dies) / 0.5) : 0;
  const pray = ramp(t, w(7) - 0.2, w(9));
  const glow = pray * 0.55;
  const dart = t > w(3) && t < w(7) ? (Math.sin(t * 5) > 0 ? 1 : -1) : 0;
  const pose = pray > 0.3
    ? { expression: "calm" as const, pray: { x: 0, y: -330 }, shiver: 1.5, frame }
    : { expression: "scared" as const, holdFlashlight: true, flashlightOn: flick, handR: { x: 150, y: -360 }, handL: { x: -230, y: -300 }, lookX: dart, sweat: t > dies ? 1 : 0.3, shiver: 2.5, frame };
  const lightOn = Math.max(flick, glow);
  return (
    <g>
      <Cam zoom={1.6} cy={760} dy={-40}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0A0F14" />
        <FlippedRoom t={t} />
        <Harrison x={FLOAT_X} y={FLOAT_Y} pose={pose} />
        <WaterOver t={t} y={ROOM.water} />
        {flick > 0.05 && <Beam id="dk-beam" x={FLOAT_X + 210} y={FLOAT_Y - 430} angle={-62} len={600} opacity={0.6 * flick} />}
      </Cam>
      <Darkness id="dk-d" opacity={lerp(0.98, 0.7, lightOn)} cx={pray > 0.3 ? 540 : 760} cy={pray > 0.3 ? 560 : 520} r={lerp(1, pray > 0.3 ? 700 : 760, lightOn)} />
      {/* only his eyes in the dark */}
      {t > dies + 0.45 && pray < 0.3 && (
        <g transform="translate(540 330) scale(1.6)" opacity={ramp(t, dies + 0.45, dies + 0.8)}>
          {[-34, 34].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={0} rx={26} ry={26 * (1 - blinkAt(t, 1.6))} fill="#fff" />
              <circle cx={x + dart * 11} cy={0} r={9} fill={INK} />
            </g>
          ))}
        </g>
      )}
      {/* soft blue halo while he prays */}
      {pray > 0 && (
        <g style={{ mixBlendMode: "screen" }} opacity={pray * 0.5}>
          <defs>
            <radialGradient id="halo"><stop offset="0" stopColor="#7FB8FF" stopOpacity={0.6} /><stop offset="1" stopColor="#7FB8FF" stopOpacity={0} /></radialGradient>
          </defs>
          <circle cx={540} cy={520} r={520} fill="url(#halo)" />
        </g>
      )}
    </g>
  );
};

// 8 — "And here's the crazy part… he can still breathe."
const Breathe: Beat = ({ t, w, frame }) => {
  const zoom = ramp(t, 0, w(4) + 0.3, Easing.out(Easing.cubic));
  const air = ramp(t, w(5), w(8) + 0.2);
  const breath = 0.5 + 0.5 * Math.sin(t * 4);
  const ring = pop(t, w(8) - 0.05, 0.4);
  return (
    <g>
      <Cam zoom={lerp(1.2, 1.85, zoom)} cy={lerp(760, 640, zoom)}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0A0F14" />
        <FlippedRoom t={t} />
        <Harrison x={FLOAT_X} y={FLOAT_Y} pose={{
          expression: air > 0.4 ? "relief" : "shock", mouthOpen: air > 0.4 ? 0.3 + breath * 0.5 : 0.4, breath: air * breath,
          ...ARMS_OUT_WATER, shiver: 1.2, frame, blink: blinkAt(t, 2.4),
        }} />
        <WaterOver t={t} y={ROOM.water} />
        {/* breath puffs */}
        {air > 0 && [0, 1].map((i) => {
          const p = (t * 0.9 + i * 0.5) % 1;
          return <circle key={i} cx={FLOAT_X + 40 + p * 90} cy={FLOAT_Y - 470 - p * 50} r={14 + p * 26} fill="#E8F6FF" opacity={(1 - p) * 0.6 * air} />;
        })}
        {/* the pocket of air, outlined */}
        <g opacity={ring}>
          <rect x={ROOM.x0 + 26} y={ROOM.y0 + 60} width={ROOM.x1 - ROOM.x0 - 52} height={ROOM.water - ROOM.y0 - 64} rx={30}
            fill="rgba(140,230,255,0.12)" stroke="#8FE8FF" strokeWidth={8} strokeDasharray="28 18" strokeDashoffset={-t * 60} />
        </g>
      </Cam>
      <Darkness id="br-d" opacity={0.6} cx={540} cy={640} r={900} />
      <Label text="AIR!" x={540} y={260} k={ring} size={92} color="#8FE8FF" />
    </g>
  );
};

/** Cut-away of the capsized boat. `flip` 0..1 turns it over; `fill` 0..1 floods it, leaving the pocket. */
const CutawayBoat: React.FC<{ t: number; flip: number; fill: number; highlight: number }> = ({ t, flip, fill, highlight }) => {
  const roomX = -250;
  const roomW = 500;
  const roomTop = -210;
  const roomBot = 20; // inside the hull, below deck level (local, upright)
  const pocket = 70;
  const level = lerp(0, roomBot - roomTop - pocket, fill);
  return (
    <g transform={`rotate(${flip * 180})`}>
      <Boat lightsOn={false} />
      {/* cut-away window into the hull + deckhouse */}
      <rect x={roomX} y={roomTop} width={roomW} height={roomBot - roomTop} fill="#C8E7F5" stroke={INK} strokeWidth={8} />
      {/* water fills from the (now upside-down) roof down */}
      {flip > 0.95 && <rect x={roomX + 4} y={roomTop + 4} width={roomW - 8} height={level} fill="#1E6FA0" />}
      {flip > 0.95 && <path d={waveLine(roomTop + level, 4, 120, t * 3, roomX + 4, roomX + roomW - 4)} stroke="#9EDCF7" strokeWidth={5} fill="none" />}
      {/* air pocket outline */}
      {highlight > 0 && (
        <rect x={roomX + 10} y={roomTop + level + 8} width={roomW - 20} height={pocket - 18 + 4} rx={14} fill="none" stroke="#FFD23F" strokeWidth={8}
          strokeDasharray="22 14" strokeDashoffset={t * 50} opacity={highlight} />
      )}
      {/* tiny Harrison: head in the pocket */}
      {flip > 0.95 && (
        <g transform={`translate(60 ${roomTop + level + 40}) rotate(180) scale(0.2)`}>
          <g transform="translate(0 520)"><HarrisonHead pose={{ expression: "scared" }} /></g>
        </g>
      )}
    </g>
  );
};

// 9 — "When the boat flipped, a little bit of air got stuck at the top."
const AirPocketBeat: Beat = ({ t, w }) => {
  const flip = ramp(t, w(2), w(3) + 0.35, Easing.inOut(Easing.cubic));
  const fill = ramp(t, w(3) + 0.35, w(9) + 0.1, Easing.out(Easing.quad));
  const hl = ramp(t, w(8), w(8) + 0.3);
  const label = pop(t, w(10) - 0.1);
  return (
    <g>
      <Deep id="ap" t={t} top="#1A5E85" bottom="#04131F" rays={0.15} />
      <Specks t={t} n={30} opacity={0.4} />
      <g transform={`translate(540 ${lerp(900, 980, flip)}) scale(1.18)`}>
        <CutawayBoat t={t} flip={flip} fill={fill} highlight={hl} />
      </g>
      {flip > 0.95 && fill < 1 && <Bubbles t={t} x={540} y={720} n={10} spread={300} speed={360} seed={9} rise={600} />}
      <Label text="AIR POCKET" x={540} y={420} k={label} size={78} />
      <Arrow x1={540} y1={500} x2={540} y2={700} k={label} />
    </g>
  );
};

// 10 — "Kind of like when you push a cup upside down in water. The air stays in."
const Cup: Beat = ({ t, w }) => {
  const push = ramp(t, w(5), w(11) + 0.2, Easing.inOut(Easing.cubic));
  const stays = pop(t, w(12) - 0.05);
  const pulse = 0.5 + 0.5 * Math.sin(t * 8);
  const surf = 900 - push * 40; // water outside rises a little
  const cupTop = lerp(380, 940, push);
  const cupH = 360;
  const rim = cupTop + cupH;
  const inside = rim - Math.min(cupH * 0.22, Math.max(0, rim - surf) * 0.18); // water inside only creeps up a little: the air stays
  return (
    <g>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#FFF6E5" />
      {/* tank */}
      <rect x={140} y={620} width={800} height={800} rx={30} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
      <path d={waveD(surf, 6, 200, t * 3, 150, 930, 1410)} fill="#4BA3E8" opacity={0.85} />
      <path d={waveLine(surf, 6, 200, t * 3, 150, 930)} stroke="#2E7CC0" strokeWidth={8} fill="none" />
      {/* air trapped inside the cup */}
      <rect x={400} y={cupTop + 10} width={280} height={Math.max(0, inside - cupTop - 10)} fill="#FFFFFF" />
      {stays > 0 && (
        <rect x={410} y={cupTop + 18} width={260} height={Math.max(0, inside - cupTop - 26)} rx={16} fill="none" stroke="#FFB800" strokeWidth={10}
          strokeDasharray="24 14" strokeDashoffset={-t * 50} opacity={0.6 + 0.4 * pulse} />
      )}
      {/* the cup (upside down: closed end on top) */}
      <path d={`M390 ${cupTop} L690 ${cupTop} L700 ${rim} L380 ${rim}`} fill="rgba(200,235,255,0.25)" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      <path d={`M420 ${cupTop + 40} L428 ${rim - 40}`} stroke="#fff" strokeWidth={12} strokeLinecap="round" opacity={0.9} />
      {/* hand pushing it down */}
      <g transform={`translate(540 ${cupTop - 10})`}>
        <path d="M0 -90 L0 -560" stroke={INK} strokeWidth={14} strokeLinecap="round" />
        <ellipse cx={0} cy={-52} rx={70} ry={48} fill={SKIN} stroke={INK} strokeWidth={8} />
        <path d="M-34 -8 v-26 M0 -4 v-30 M34 -8 v-26" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </g>
      <Label text="AIR STAYS IN" x={540} y={250} k={stays} size={72} />
      <Arrow x1={760} y1={330} x2={650} y2={(cupTop + inside) / 2} k={stays} color="#FFB800" />
    </g>
  );
};

// 11 — "Three days later, he hears something. Knock… knock."
const Knock: Beat = ({ t, w, frame }) => {
  const day = t < w(0) + 0.35 ? 1 : t < w(1) + 0.3 ? 2 : 3;
  const flipPhase = (t: number, at: number) => (t > at - 0.12 && t < at + 0.12 ? 1 - Math.abs(t - at) / 0.12 : 0);
  const flip = Math.max(flipPhase(t, w(0) + 0.35), flipPhase(t, w(1) + 0.3));
  const cardOut = ramp(t, w(3) - 0.3, w(3));
  const hears = ramp(t, w(4), w(4) + 0.3);
  const k1 = w(6);
  const k2 = w(7);
  const s1 = shake(t, k1, 16, 0.4);
  const s2 = shake(t, k2, 16, 0.4);
  const ringR = (at: number) => (t > at ? (t - at) * 900 : 0);
  return (
    <g>
      <Cam zoom={1.25} cy={760} dx={s1.x + s2.x} dy={s1.y + s2.y}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0A0F14" />
        <FlippedRoom t={t} />
        <Harrison x={FLOAT_X} y={FLOAT_Y} pose={{
          expression: hears > 0.5 ? "shock" : "tired", lookX: hears > 0.5 ? -1 : 0, lookY: hears > 0.5 ? -0.6 : 0.4, turn: hears * -0.4,
          ...ARMS_OUT_WATER, shiver: 2.5, frame, blink: hears > 0.5 ? 0 : blinkAt(t, 1.8),
        }} />
        <WaterOver t={t} y={ROOM.water} />
        {/* knock ripples on the left wall */}
        {[k1, k2].map((at, i) => t > at && t < at + 0.8 && (
          <g key={i} opacity={1 - (t - at) / 0.8}>
            <circle cx={ROOM.x0} cy={560} r={ringR(at)} fill="none" stroke="#FFD23F" strokeWidth={10} />
            <circle cx={ROOM.x0} cy={560} r={ringR(at) * 0.6} fill="none" stroke="#FFD23F" strokeWidth={6} />
          </g>
        ))}
      </Cam>
      <Darkness id="kn-d" opacity={0.72} cx={540} cy={640} r={850} />
      <ComicText text="KNOCK…" x={350} y={440} size={116} k={pop(t, k1)} rot={-10} opacity={1 - ramp(t, k2 + 0.6, k2 + 0.9)} />
      <ComicText text="KNOCK." x={740} y={320} size={116} k={pop(t, k2)} rot={8} />
      <g opacity={1 - cardOut}>
        <DayCard day={day} x={540} y={420} k={pop(t, 0, 0.3)} flip={flip} />
      </g>
    </g>
  );
};

// 12 — "He knocks back as hard as he can."
const KnockBack: Beat = ({ t, w, dur, frame }) => {
  const hits = [w(1), w(1) + (dur - w(1)) * 0.3, w(1) + (dur - w(1)) * 0.55, w(1) + (dur - w(1)) * 0.8];
  // arm swings up to hit the ceiling, comes back down
  const last = hits.filter((h) => h <= t + 0.12).pop();
  let up = 0.35;
  for (const h of hits) {
    const d = t - (h - 0.12);
    if (d >= 0 && d < 0.32) up = Math.max(up, d < 0.12 ? d / 0.12 : 1 - (d - 0.12) / 0.2 * 0.65);
  }
  const hitTarget = { x: 150, y: lerp(-540, -820, up) };
  const sh = last !== undefined ? shake(t, last, 14, 0.25) : { x: 0, y: 0 };
  return (
    <g>
      <Cam zoom={1.35} cy={700} dx={sh.x} dy={sh.y}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0A0F14" />
        <FlippedRoom t={t} />
        <Harrison x={FLOAT_X} y={FLOAT_Y} pose={{
          expression: "determined", lookX: 0.4, lookY: -1, handR: hitTarget, elbowUpR: true, handL: { x: -230, y: -300 }, shiver: 1, frame,
          mouthOpen: up > 0.8 ? 0.5 : 0,
        }} />
        <WaterOver t={t} y={ROOM.water} />
        {hits.map((h, i) => t > h && t < h + 0.45 && (
          <g key={i} opacity={1 - (t - h) / 0.45}>
            <path d={`M${FLOAT_X + 150 - 70} ${ROOM.y0 + 70} l-40 -10 M${FLOAT_X + 150 + 70} ${ROOM.y0 + 70} l40 -10 M${FLOAT_X + 150} ${ROOM.y0 + 90} l0 40`}
              stroke="#FFD23F" strokeWidth={12} strokeLinecap="round" />
          </g>
        ))}
      </Cam>
      <Darkness id="kb-d" opacity={0.6} cx={640} cy={600} r={850} />
      {hits.map((h, i) => (
        <ComicText key={i} text="KNOCK!" x={[300, 780, 330, 760][i]} y={[1150, 1080, 1290, 1240][i]} size={110} rot={[-12, 10, -6, 6][i]}
          k={pop(t, h, 0.25)} opacity={1 - ramp(t, h + 0.5, h + 0.7)} />
      ))}
    </g>
  );
};

// 13 — "A diver comes in, thinking everyone's gone… and sees a hand."
const DiverBeat: Beat = ({ t, w }) => {
  const swim = ramp(t, 0, w(6) + 0.3, Easing.out(Easing.quad));
  const sweep = t < w(7) ? Math.sin(t * 1.8) * 22 : lerp(Math.sin(w(7) * 1.8) * 22, -48, ramp(t, w(7), w(8) + 0.2));
  const hand = ramp(t, w(8), w(10) + 0.1, Easing.out(Easing.back(1.6)));
  const startle = ramp(t, w(10), w(10) + 0.25, Easing.out(Easing.back(3)));
  const dx = lerp(-300, 340, swim);
  const dy = 1080 + Math.sin(t * 2) * 12;
  const beamX = dx + 160;
  const beamY = dy - 95;
  const surfaceY = 560;
  return (
    <g>
      <Deep id="dv" t={t} top="#0B2A3E" bottom="#010509" rays={0} />
      {/* the air pocket above with the room ceiling */}
      <rect x={-100} y={-100} width={W + 200} height={surfaceY + 100} fill="#1C2733" />
      <rect x={-100} y={140} width={W + 200} height={60} fill="#2B3640" stroke={INK} strokeWidth={6} />
      <path d={waveD(surfaceY, 6, 240, t * 2)} fill="#0B2A3E" />
      <path d={waveLine(surfaceY, 6, 240, t * 2)} stroke="#4E8FB0" strokeWidth={6} fill="none" />
      {/* floating debris */}
      {[[200, 820, 20], [820, 760, -14], [620, 1400, 40]].map(([x, y, r], i) => (
        <rect key={i} x={x + Math.sin(t + i) * 10} y={y + Math.cos(t * 1.3 + i) * 10} width={90} height={26} rx={6} fill="#3D2F24" stroke={INK} strokeWidth={5}
          transform={`rotate(${r + t * 4} ${x} ${y})`} />
      ))}
      {/* the hand reaching down through the surface */}
      <g transform={`translate(810 ${lerp(surfaceY - 260, surfaceY + 200, hand)})`}>
        <ReachingHand len={500} spread={hand} />
      </g>
      <Beam id="dv-beam" x={beamX} y={beamY} angle={-30 + sweep} len={950} spread={16} opacity={0.85} />
      <g transform={`translate(${dx} ${dy}) rotate(-14) scale(1.1)`}>
        <Diver t={t} kick={1 - startle * 0.8} startle={startle} />
      </g>
      <Bubbles t={t} x={dx + 180} y={dy - 120} n={8} spread={40} speed={300} seed={5} rise={500} />
      <Darkness id="dv-d" opacity={0.55} cx={beamX + 200} cy={beamY - 200} r={1000} />
      <ComicText text="!" x={dx + 210} y={dy - 300} size={200} k={pop(t, w(10), 0.25)} rot={10} fill="#FFFFFF" />
    </g>
  );
};

// 14 — "But even then, he can't just swim up. Coming up too fast could hurt his body."
const Bends: Beat = ({ t, w, frame }) => {
  const arrow = ramp(t, w(3), w(6), Easing.out(Easing.cubic));
  const x = pop(t, w(7) - 0.05, 0.3);
  const part2 = ramp(t, w(8) - 0.15, w(8) + 0.2);
  const fizz = ramp(t, w(10), w(13));
  const warn = pop(t, w(13) - 0.1);
  const pulse = 0.5 + 0.5 * Math.sin(t * 10);
  return (
    <g>
      <g opacity={1 - part2}>
        <rect x={-100} y={-100} width={W + 200} height={400} fill="#8ED3F0" />
        <Deep id="bd" t={t} top="#2C8BC0" bottom="#03111C" rays={0.2} />
        <rect x={-100} y={-100} width={W + 200} height={300} fill="#8ED3F0" />
        <path d={waveD(200, 10, 260, t * 2, -200, W + 200, 260)} fill="#2C8BC0" />
        <Arrow x1={540} y1={1150} x2={540} y2={280} k={arrow} color="#FFFFFF" dash />
        <Harrison x={540} y={1560} scale={0.6} pose={{ expression: "tired", lookY: -1, handL: { x: -200, y: -560 }, handR: { x: 200, y: -560 }, elbowUpL: true, elbowUpR: true }} />
        <g transform={`translate(540 700) scale(${x})`}>
          <path d="M-190 -190 L190 190 M190 -190 L-190 190" stroke={INK} strokeWidth={84} strokeLinecap="round" />
          <path d="M-190 -190 L190 190 M190 -190 L-190 190" stroke="#E0453A" strokeWidth={58} strokeLinecap="round" />
        </g>
      </g>
      {part2 > 0 && (
        <g opacity={part2}>
          <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#14202C" />
          <defs>
            <radialGradient id="redglow"><stop offset="0" stopColor="#FF4D3D" stopOpacity={0.55} /><stop offset="1" stopColor="#FF4D3D" stopOpacity={0} /></radialGradient>
          </defs>
          <circle cx={540} cy={900} r={700} fill="url(#redglow)" opacity={fizz * (0.5 + 0.5 * pulse)} />
          <Harrison x={540} y={1430} scale={1.25} pose={{ expression: "scared", sweat: fizz, ...HANDS_ON_FACE, shiver: fizz * 4, frame }} />
          {/* fizz: little bubbles all over the body, like a shaken soda */}
          {Array.from({ length: 46 }, (_, i) => {
            const bx = 540 + (rnd(i) - 0.5) * 260;
            const by0 = 1400 - rnd(i + 7) * 640;
            const age = (t * (0.6 + rnd(i + 3)) + rnd(i + 11)) % 1;
            return <circle key={i} cx={bx + Math.sin(age * 9 + i) * 8} cy={by0 - age * 60} r={4 + rnd(i + 5) * 8}
              fill="rgba(255,255,255,0.35)" stroke="#fff" strokeWidth={3} opacity={fizz * (1 - age)} />;
          })}
          <g transform={`translate(540 330) scale(${warn})`}>
            <path d="M0 -130 L150 120 L-150 120 Z" fill="#FFD23F" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
            <text y={40} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={150} fill={INK}>!</text>
          </g>
          <Label text="THE BENDS" x={540} y={560} k={warn} size={64} color="#FFFFFF" />
        </g>
      )}
    </g>
  );
};

// 15 — "So they keep him in a special room for almost three more days, slowly bringing him back."
const Chamber: Beat = ({ t, w, dur }) => {
  const cam = ramp(t, 0, dur, Easing.inOut(Easing.quad));
  const days = t < w(10) ? 1 : t < w(11) + 0.1 ? 2 : 3;
  const dayK = pop(t, w(9) - 0.2);
  const needle = lerp(120, -110, ramp(t, 0.2, dur - 0.2, Easing.inOut(Easing.sin)));
  const calm = ramp(t, w(13), w(15));
  const label = pop(t, w(7) - 0.1);
  return (
    <g>
      <Cam zoom={lerp(1, 1.08, cam)}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#D8E1E6" />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-100 ${i * 170} H${W + 100}`} stroke="#C3CED5" strokeWidth={6} />)}
        <rect x={-100} y={1330} width={W + 200} height={700} fill="#8D99A3" stroke={INK} strokeWidth={8} />
        {/* the chamber: horizontal steel cylinder */}
        <g transform="translate(540 980)">
          <rect x={-470} y={-300} width={940} height={600} rx={300} fill="#B5C0C8" stroke={INK} strokeWidth={10} />
          <path d="M-300 -300 V300 M300 -300 V300" stroke="#8D99A3" strokeWidth={14} />
          <rect x={-470} y={-300} width={940} height={600} rx={300} fill="none" stroke={INK} strokeWidth={10} />
          <path d="M-440 -120 Q-300 -280 300 -270" stroke="#E3E9ED" strokeWidth={22} fill="none" strokeLinecap="round" />
          {/* legs */}
          <path d="M-300 290 L-330 360 M300 290 L330 360" stroke={INK} strokeWidth={30} strokeLinecap="round" />
          {/* porthole with Harrison inside */}
          <g transform="translate(-40 0)">
            <circle r={190} fill="#6E7A84" stroke={INK} strokeWidth={10} />
            <clipPath id="porthole"><circle r={160} /></clipPath>
            <g clipPath="url(#porthole)">
              <rect x={-170} y={-170} width={340} height={340} fill="#F6E7B8" />
              <g transform="translate(0 620) scale(1.15)">
                <HarrisonHead pose={{ expression: calm > 0.5 ? "relief" : "tired", blink: blinkAt(t, 2.5), lookX: 0.3 }} />
              </g>
              <path d="M-140 -60 L-60 -140" stroke="#fff" strokeWidth={18} strokeLinecap="round" opacity={0.6} />
            </g>
            <circle r={160} fill="none" stroke={INK} strokeWidth={8} />
            {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={Math.cos((i / 8) * Math.PI * 2) * 176} cy={Math.sin((i / 8) * Math.PI * 2) * 176} r={8} fill="#3B444C" />)}
          </g>
          {/* pressure gauge */}
          <g transform="translate(320 -110)">
            <circle r={96} fill="#fff" stroke={INK} strokeWidth={10} />
            <path d="M-66 40 A76 76 0 0 1 -30 -70" stroke="#6DBE5A" strokeWidth={14} fill="none" />
            <path d="M-30 -70 A76 76 0 0 1 40 -66" stroke="#F2C230" strokeWidth={14} fill="none" />
            <path d="M40 -66 A76 76 0 0 1 70 30" stroke="#E0453A" strokeWidth={14} fill="none" />
            <g transform={`rotate(${needle})`}>
              <path d="M0 0 L0 -70" stroke={INK} strokeWidth={10} strokeLinecap="round" />
            </g>
            <circle r={14} fill={INK} />
            <rect x={-12} y={96} width={24} height={60} fill="#8D99A3" stroke={INK} strokeWidth={6} />
          </g>
          {/* hatch wheel at the end */}
          <g transform={`translate(-400 0) rotate(${t * 20})`}>
            <circle r={70} fill="none" stroke={INK} strokeWidth={14} />
            <path d="M-70 0 H70 M0 -70 V70" stroke={INK} strokeWidth={10} />
          </g>
        </g>
        {/* hiss puffs from a valve */}
        {[0, 1, 2].map((i) => {
          const p = (t * 0.8 + i / 3) % 1;
          return <circle key={i} cx={950 + p * 60} cy={720 - p * 140} r={18 + p * 40} fill="#fff" opacity={(1 - p) * 0.7} />;
        })}
      </Cam>
      <Label text="DECOMPRESSION CHAMBER" x={540} y={360} k={label} size={52} color="#FFFFFF" />
      <g transform={`translate(890 560) scale(${dayK * 0.6})`}>
        <DayCard day={days} x={0} y={0} k={1} />
      </g>
    </g>
  );
};

// 16 — "After all that, he said he'd never go near the sea again."
const Never: Beat = ({ t, w, dur }) => {
  const turnAway = ramp(t, w(3), w(5), Easing.inOut(Easing.cubic));
  const shakeHead = t > w(6) && t < w(10) ? Math.sin((t - w(6)) * 14) * 0.6 : 0;
  const end = ramp(t, dur - 1.9, dur - 1.4);
  const fade = ramp(t, dur - 0.6, dur);
  const nope = pop(t, w(6) - 0.05);
  return (
    <g>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#9ED8F2" />
      <circle cx={200} cy={300} r={110} fill="#FFE07A" stroke={INK} strokeWidth={8} />
      {[0, 1].map((i) => <ellipse key={i} cx={(i * 600 + t * 25) % (W + 400) - 100} cy={260 + i * 140} rx={150} ry={50} fill="#fff" stroke={INK} strokeWidth={6} />)}
      {/* the sea, on the left, behind him */}
      <path d={waveD(900, 12, 220, t * 2, -200, W + 200, H + 200)} fill="#2F86B8" stroke={INK} strokeWidth={6} />
      <path d={`M-100 ${H + 100} L-100 1150 Q${300 + Math.sin(t * 1.6) * 40} 1080 ${520 + Math.sin(t * 1.6) * 60} 1170 Q700 1230 ${W + 100} 1120 L${W + 100} ${H + 100} Z`} fill="#F2D49B" stroke={INK} strokeWidth={8} />
      <path d={`M-100 1160 Q${300 + Math.sin(t * 1.6) * 40} 1090 ${520 + Math.sin(t * 1.6) * 60} 1180`} stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />
      {/* grass tufts */}
      {[700, 860, 980].map((x) => <path key={x} d={`M${x} 1260 l-14 -50 M${x} 1260 l0 -60 M${x} 1260 l14 -50`} stroke="#4E8F3A" strokeWidth={10} strokeLinecap="round" />)}
      <Harrison x={760} y={1620} scale={1.2} pose={{
        expression: "no", turn: lerp(-0.6, 0.7, turnAway) + shakeHead, lookX: lerp(-1, 1, turnAway), blink: blinkAt(t, 2.8),
        handL: turnAway > 0.5 ? { x: 50, y: -320 } : undefined, handR: turnAway > 0.5 ? { x: -50, y: -300 } : undefined,
      }} />
      <g transform={`translate(330 760) scale(${nope * (1 - end)})`}>
        <rect x={-210} y={-90} width={420} height={180} rx={40} fill="#E0453A" stroke={INK} strokeWidth={10} />
        <text textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={110} fill="#fff">NOPE.</text>
      </g>
      {/* end card */}
      <g opacity={end}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#0B1424" opacity={0.95} />
        <text x={540} y={700} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={96} fill="#fff">Harrison Okene</text>
        <text x={540} y={800} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={48} fill="#BDEBFF">Off the coast of Nigeria · May 2013</text>
        <g transform="translate(540 1010)">
          {[["~60 hrs", "underwater"], ["30 m", "down"], ["1", "survivor"]].map(([a, b], i) => (
            <g key={i} transform={`translate(${(i - 1) * 320} 0)`}>
              <text textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={84} fill="#FFD23F">{a}</text>
              <text y={64} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={40} fill="#fff">{b}</text>
            </g>
          ))}
        </g>
      </g>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#000" opacity={fade} />
    </g>
  );
};

export const BEATS: Record<string, Beat> = {
  hook: Hook, cook: Cook, bathroom: Bathroom, boom: Boom, sinks: Sinks, trapped: Trapped, dark: Dark, breathe: Breathe,
  airpocket: AirPocketBeat, cup: Cup, knock: Knock, knockback: KnockBack, diver: DiverBeat, bends: Bends, chamber: Chamber, never: Never,
};

export { clamp01, interpolate };
