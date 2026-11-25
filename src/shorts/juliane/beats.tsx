/**
 * The 15 pictures of "The Girl Who Fell From the Sky" (desire-hook structure):
 * STAKES (hook) → BIG QUESTION (question) → HEAD FAKE + RE-HOOK (fake) → PAYOFF (eve … found) → CLOSE (end, loops to the start).
 * Every action is keyed to a measured word time w(i).
 */
import React from "react";
import { Easing } from "remotion";
import { Harrison, INK, type HarrisonPose } from "../airpocket/Harrison";
import { Arrow, Burst, ComicText, Darkness, DayCard, H, Label, W, lerp, pop, ramp, rnd, shake } from "../airpocket/kit";
import type { BeatComp } from "../common/ShortPlayer";
import { DAD, JULIANE, JULIANE_BEFORE, LOCAL_A, LOCAL_B, MOM } from "./cast";
import { Boat, Canopy, Dog, FuelCan, Hut, Jungle, LapBelt, Maggot, Plane, SEATED, SeatBacks, SeatFront, Stream, walk } from "./props";

const Cam: React.FC<{ zoom?: number; cx?: number; cy?: number; dx?: number; dy?: number; rot?: number; children: React.ReactNode }> = ({
  zoom = 1, cx = W / 2, cy = H / 2, dx = 0, dy = 0, rot = 0, children,
}) => <g transform={`translate(${cx + dx} ${cy + dy}) rotate(${rot}) scale(${zoom}) translate(${-cx} ${-cy})`}>{children}</g>;

const blinkAt = (t: number, every = 3.1, offset = 0.7) => {
  const p = (t + offset) % every;
  return p < 0.12 ? Math.sin((p / 0.12) * Math.PI) : 0;
};
const J = (p: HarrisonPose): HarrisonPose => ({ look: JULIANE, ...p });

// ---------- shared shots ----------
const Sky: React.FC<{ top?: string; bottom?: string }> = ({ top = "#4F9DE0", bottom = "#BFE6FF" }) => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="url(#sky)" />
  </g>
);
/** Clouds and wind streaks rushing upward: we are falling. */
const FallingAir: React.FC<{ t: number; speed?: number; cloud?: string }> = ({ t, speed = 1, cloud = "#FFFFFF" }) => (
  <g>
    {Array.from({ length: 7 }, (_, i) => {
      const y = ((rnd(i) * (H + 800) - t * 900 * speed) % (H + 800) + H + 800) % (H + 800) - 400;
      const x = rnd(i + 20) * W;
      return (
        <g key={i} opacity={0.9}>
          <ellipse cx={x} cy={y} rx={200 + rnd(i + 5) * 120} ry={70} fill={cloud} stroke={INK} strokeWidth={5} />
          <ellipse cx={x + 90} cy={y - 40} rx={120} ry={60} fill={cloud} stroke={INK} strokeWidth={5} />
        </g>
      );
    })}
    {Array.from({ length: 26 }, (_, i) => {
      const y = ((rnd(i + 40) * H - t * 2600 * speed) % H + H) % H;
      const x = rnd(i + 60) * W;
      return <path key={i} d={`M${x} ${y} l0 ${120 + rnd(i) * 160}`} stroke="#FFFFFF" strokeWidth={5} opacity={0.55} strokeLinecap="round" />;
    })}
  </g>
);
/** Juliane strapped into the middle seat of a row; origin = row floor centre. */
const SeatRowWithJuliane: React.FC<{ pose: HarrisonPose }> = ({ pose }) => (
  <g>
    <SeatBacks />
    <SeatFront />
    <Harrison x={0} y={10} pose={J({ ...SEATED, handL: { x: -96, y: -252 }, handR: { x: 96, y: -252 }, ...pose })} />
    <LapBelt />
  </g>
);

// 1 — STAKES: "This seventeen-year-old fell three kilometres out of the sky. Still strapped to her seat. And she lived."
const Hook: BeatComp = ({ t, w, frame }) => {
  const land = w(14);
  const canopyY = lerp(H + 700, 1250, ramp(t, w(12), land, Easing.in(Easing.quad)));
  const landed = t >= land;
  const alt = Math.max(0, Math.round(3000 * (1 - ramp(t, 0, land, Easing.in(Easing.quad))) / 10) * 10);
  const belt = pop(t, w(10) - 0.05);
  const sh = shake(t, land, 30, 0.5);
  const flash = landed ? Math.max(0, 1 - (t - land) / 0.3) : 0;
  return (
    <g>
      {!landed ? (
        <Cam dx={Math.sin(t * 9) * 4}>
          <Sky />
          <FallingAir t={t} />
          <Canopy y={canopyY} t={t} />
          <g transform={`translate(540 1080) rotate(${Math.sin(t * 2.2) * 28 + t * 18}) scale(0.78) translate(0 230)`}>
            <SeatRowWithJuliane pose={{ expression: "scared", sweat: 0.8, headTilt: Math.sin(t * 5) * 6, frame, shiver: 2 }} />
          </g>
          {/* belt callout */}
          <g opacity={belt * (1 - ramp(t, w(13) + 0.4, w(13) + 0.6))}>
            <Arrow x1={880} y1={1300} x2={640} y2={1120} k={belt} color="#FFD23F" />
            <Label text="STILL STRAPPED IN" x={760} y={1360} k={belt} size={46} />
          </g>
          {/* altitude */}
          <g transform="translate(880 560)">
            <rect x={-150} y={-70} width={300} height={140} rx={24} fill="rgba(0,0,0,0.55)" stroke="#fff" strokeWidth={6} />
            <text y={-28} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={800} fontSize={30} fill="#fff" letterSpacing={4}>ALTITUDE</text>
            <text y={24} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={66} fill="#FFD23F">{alt.toLocaleString("en-US")} m</text>
          </g>
        </Cam>
      ) : (
        <Cam dx={sh.x} dy={sh.y} zoom={lerp(1.15, 1, ramp(t, land, land + 0.8))}>
          <Jungle t={t} />
          <Harrison x={540} y={1400} scale={1.05} pose={J({ expression: "shock", lookX: Math.sin(t * 6) * 0.8, ...SEATED, footL: { x: -46, y: -8 }, footR: { x: 46, y: -8 } })} />
          {Array.from({ length: 16 }, (_, i) => {
            const age = t - land;
            const a = rnd(i) * Math.PI * 2;
            return <ellipse key={i} cx={540 + Math.cos(a) * age * 700} cy={900 + Math.sin(a) * age * 500 + age * age * 600} rx={24} ry={12} fill="#3E8E41" stroke={INK} strokeWidth={4}
              transform={`rotate(${age * 400 + i * 30} ${540 + Math.cos(a) * age * 700} ${900 + Math.sin(a) * age * 500 + age * age * 600})`} />;
          })}
        </Cam>
      )}
      <rect x={0} y={0} width={W} height={H} fill="#E8FFE0" opacity={flash * 0.9} />
    </g>
  );
};

// 2 — BIG QUESTION: "How do you survive that, and then eleven days alone in the jungle?"
const Question: BeatComp = ({ t, w }) => {
  const q = pop(t, w(0), 0.4);
  const days = pop(t, w(7) - 0.05);
  const alone = ramp(t, w(9), w(12) + 0.4);
  return (
    <Cam zoom={lerp(1, 0.9, alone)} cy={1200}>
      <Jungle t={t} dark={alone * 0.35} />
      <Harrison x={540} y={1420} scale={0.85} pose={J({ expression: "scared", lookX: Math.sin(t * 2.5), turn: Math.sin(t * 2.5) * 0.4, blink: blinkAt(t), handL: { x: -120, y: -260 }, handR: { x: 120, y: -260 } })} />
      <ComicText text="?" x={800} y={560} size={360} k={q} rot={12} fill="#FFFFFF" />
      <DayCard day={11} x={270} y={560} k={days} label="DAYS" />
    </Cam>
  );
};

/** four-leaf clover */
const Clover: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M0 40 Q10 130 -30 190" stroke="#2F7A3B" strokeWidth={16} fill="none" strokeLinecap="round" />
    {[0, 90, 180, 270].map((r) => (
      <path key={r} transform={`rotate(${r})`} d="M0 0 C-60 -40 -70 -110 -24 -116 C0 -118 0 -96 0 -88 C0 -96 0 -118 24 -116 C70 -110 60 -40 0 0 Z" fill="#4FA34F" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    ))}
  </g>
);

// 3 — HEAD FAKE + RE-HOOK: "Luck got her to the ground. One rule her dad taught her got her out."
const Fake: BeatComp = ({ t, w }) => {
  const luck = pop(t, w(0) - 0.05);
  const ground = ramp(t, w(2), w(5) + 0.1);
  const dad = pop(t, w(6) - 0.1, 0.45);
  const card = pop(t, w(7));
  const glow = 0.5 + 0.5 * Math.sin(t * 8);
  return (
    <g>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#FFF6E5" />
      {/* top: luck → the ground */}
      <g opacity={1 - ramp(t, w(6) - 0.2, w(6) + 0.2) * 0.65}>
        <Clover x={300} y={360} k={luck} />
        <Label text="LUCK" x={300} y={620} k={luck} size={64} color="#9BE08F" />
        <Arrow x1={470} y1={420} x2={760} y2={560} k={ground} color="#9BE08F" />
        <g transform={`translate(830 690) scale(${pop(t, w(5) - 0.1)})`}>
          <path d="M-150 30 Q0 -10 150 30 L150 70 L-150 70 Z" fill="#6B4A2E" stroke={INK} strokeWidth={7} />
          <path d="M-120 20 l-10 -40 M-90 16 l6 -46 M100 22 l12 -40" stroke="#2F7A3B" strokeWidth={9} strokeLinecap="round" />
          <text y={-80} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={54} fill={INK}>GROUND</text>
        </g>
      </g>
      {/* bottom: dad + a face-down rule card */}
      <g opacity={dad > 0 ? 1 : 0}>
        <circle cx={330} cy={1120} r={250 * dad} fill="#E9D5AE" stroke={INK} strokeWidth={10} />
        <clipPath id="dadc"><circle cx={330} cy={1120} r={240 * dad} /></clipPath>
        <g clipPath="url(#dadc)">
          <Harrison x={330} y={1560} scale={0.85} pose={{ look: DAD, expression: "smile", handR: { x: 220, y: -470 }, elbowUpR: true, blink: blinkAt(t) }} />
        </g>
        <Label text="DAD" x={330} y={1380} k={dad} size={50} color="#FFFFFF" />
        <g transform={`translate(800 1110) rotate(${6 - card * 6}) scale(${card})`}>
          <rect x={-190} y={-150} width={380} height={300} rx={26} fill="#FFD23F" stroke={INK} strokeWidth={10} opacity={0.6 + 0.4 * glow} />
          <text y={-80} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={54} fill={INK}>ONE RULE</text>
          <text y={40} textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={170} fill={INK}>?</text>
        </g>
      </g>
    </g>
  );
};

// 4 — "Christmas Eve, 1971. She's flying over the Amazon with her mom."
const Eve: BeatComp = ({ t, w, dur }) => {
  const date = pop(t, w(0) - 0.05);
  const mom = ramp(t, w(9), w(10) + 0.2);
  const bump = t > dur - 0.8 ? Math.sin(t * 30) * 6 * ramp(t, dur - 0.8, dur) : 0;
  return (
    <Cam dy={bump} zoom={lerp(1.06, 1, ramp(t, 0, dur))}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#EFE6D2" />
      <rect x={-200} y={-200} width={W + 400} height={240} fill="#D9CDB4" stroke={INK} strokeWidth={6} />
      {/* tinsel */}
      <path d={`M-40 70 ${Array.from({ length: 12 }, (_, i) => `Q${i * 100 + 50} ${130} ${i * 100 + 100} 70`).join(" ")}`} stroke="#E0453A" strokeWidth={12} fill="none" />
      {[80, 300, 520, 740, 960].map((x, i) => <circle key={x} cx={x} cy={120 + (i % 2) * 8} r={18} fill={["#FFD23F", "#4FA34F", "#4BA3E8"][i % 3]} stroke={INK} strokeWidth={5} />)}
      {/* window: rainforest below */}
      <g transform="translate(880 640)">
        <rect x={-120} y={-170} width={240} height={340} rx={110} fill="#9ED8F2" stroke={INK} strokeWidth={10} />
        <clipPath id="win"><rect x={-110} y={-160} width={220} height={320} rx={100} /></clipPath>
        <g clipPath="url(#win)">
          <rect x={-120} y={30} width={240} height={160} fill="#2F7A3B" />
          {[-80, -20, 40, 100].map((x, i) => <circle key={x} cx={x} cy={40 + (i % 2) * 20} r={40} fill="#3E8E41" />)}
          <ellipse cx={-40 + ((t * 40) % 200)} cy={-60} rx={70} ry={24} fill="#fff" />
        </g>
      </g>
      {/* the seat row: mom (middle), Juliane (window) */}
      <g transform="translate(540 1420)">
        <SeatBacks />
        <SeatFront />
        <Harrison x={-180} y={10} pose={{ look: MOM, ...SEATED, expression: "smile", lookX: lerp(0, 1, mom), turn: mom * 0.4, blink: blinkAt(t, 3.4), handL: { x: -96, y: -252 }, handR: { x: 60, y: -230 } }} />
        <Harrison x={180} y={10} pose={J({ ...SEATED, look: JULIANE_BEFORE, expression: "smile", lookX: lerp(1, -1, mom), turn: lerp(0.5, -0.4, mom), blink: blinkAt(t, 2.8), handL: { x: -40, y: -230 }, handR: { x: 40, y: -230 } })} />
        {/* present on her lap */}
        <g transform="translate(180 -260)">
          <rect x={-50} y={-40} width={100} height={70} rx={6} fill="#E0453A" stroke={INK} strokeWidth={6} />
          <path d="M0 -40 V30 M-50 -6 H50" stroke="#FFD23F" strokeWidth={10} />
        </g>
        <LapBelt x={180} />
        <LapBelt x={-180} />
      </g>
      <Label text="DEC 24, 1971" x={540} y={330} k={date} size={74} />
      <Label text="JULIANE, 17" x={760} y={980} k={pop(t, w(3) - 0.1)} size={44} color="#FFFFFF" />
      <Label text="MOM" x={360} y={980} k={pop(t, w(10) - 0.1)} size={44} color="#FFFFFF" />
    </Cam>
  );
};

// 5 — "Lightning hits the plane. It breaks apart in the air."
const Strike: BeatComp = ({ t, w }) => {
  const hit = w(0) + 0.05;
  const flash = t >= hit ? Math.max(0, 1 - (t - hit) / 0.35) : 0;
  const sh = shake(t, hit, 26, 0.6);
  const brk = ramp(t, w(5) - 0.1, w(9) + 0.4, Easing.out(Easing.cubic));
  const bob = Math.sin(t * 3) * 10;
  return (
    <g>
      <Cam dx={sh.x} dy={sh.y}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#1B2538" />
        {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={(i * 260 - t * 60) % (W + 500) + 100} cy={300 + (i % 3) * 240} rx={260} ry={90} fill="#26324A" />)}
        {/* bolt */}
        {flash > 0.05 && <path d="M600 -40 L540 300 L620 320 L520 760 L600 780 L560 880" stroke="#FFF7C8" strokeWidth={18} fill="none" strokeLinejoin="round" opacity={flash} />}
        <g transform={`translate(540 ${920 + bob}) scale(0.92)`}>
          {brk <= 0 ? <Plane t={t} /> : (
            <g>
              <g transform={`translate(${-brk * 160} ${brk * 220}) rotate(${-brk * 28})`}><Plane t={t} part="rear" lit={false} /></g>
              <g transform={`translate(${brk * 160} ${brk * 260}) rotate(${brk * 22})`}><Plane t={t} part="front" lit={false} /></g>
              {/* debris + a seat row tumbling out of the gap */}
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={i} x={-40 + (rnd(i) - 0.5) * 400 * brk} y={(rnd(i + 9) - 0.2) * 500 * brk} width={30} height={14} fill="#C9D1D8" stroke={INK} strokeWidth={4}
                  transform={`rotate(${brk * 300 * rnd(i + 3)})`} />
              ))}
              <g transform={`translate(-20 ${brk * 420}) rotate(${brk * 220}) scale(0.18)`}><SeatBacks /><SeatFront legs={false} /></g>
            </g>
          )}
          {flash > 0 && <circle cx={100} cy={60} r={120 * flash + 40} fill="#FFB347" opacity={flash * 0.7} />}
        </g>
        {Array.from({ length: 60 }, (_, i) => {
          const x = (rnd(i) * (W + 300) + t * 260) % (W + 300) - 150;
          const y = (rnd(i + 50) * H + t * 2000) % H;
          return <path key={i} d={`M${x} ${y} l-22 66`} stroke="#9FB8D0" strokeWidth={4} opacity={0.45} />;
        })}
        <Burst x={540} y={420} r={250} k={pop(t, hit, 0.25) * (1 - ramp(t, hit + 0.8, hit + 1.1))} fill="#FFF7C8" />
        <ComicText text="CRACK!" x={540} y={420} size={150} k={pop(t, hit, 0.25) * (1 - ramp(t, hit + 0.8, hit + 1.1))} />
      </Cam>
      <rect x={0} y={0} width={W} height={H} fill="#fff" opacity={flash * 0.85} />
    </g>
  );
};

// 6 — "She falls in her row of seats, spinning into the trees."
const Fall: BeatComp = ({ t, w, dur, frame }) => {
  const canopyY = lerp(H + 700, 1150, ramp(t, w(7), w(10), Easing.in(Easing.quad)));
  const hit = w(10) + 0.15;
  const hitK = t > hit ? (t - hit) / 0.5 : 0;
  const out = ramp(t, dur - 0.3, dur);
  return (
    <g>
      <Cam dx={Math.sin(t * 11) * 6} zoom={lerp(0.95, 1.1, ramp(t, 0, dur))}>
        <Sky top="#3A4E6B" bottom="#9DB7CC" />
        <FallingAir t={t} speed={1.3} cloud="#DDE6EE" />
        <Canopy y={canopyY} t={t} />
        <g transform={`translate(540 ${lerp(900, 1100, ramp(t, 0, hit))}) rotate(${t * 260}) scale(0.62) translate(0 230)`}>
          <SeatRowWithJuliane pose={{ expression: "shock", frame, shiver: 3, headTilt: Math.sin(t * 7) * 8 }} />
        </g>
        {hitK > 0 && Array.from({ length: 24 }, (_, i) => {
          const a = rnd(i) * Math.PI * 2;
          const x = 540 + Math.cos(a) * hitK * 650;
          const y = 1150 + Math.sin(a) * hitK * 420 - hitK * 200;
          return <ellipse key={i} cx={x} cy={y} rx={26} ry={13} fill={["#3E8E41", "#2F7A3B", "#4FA34F"][i % 3]} stroke={INK} strokeWidth={4} transform={`rotate(${hitK * 500 + i * 20} ${x} ${y})`} />;
        })}
      </Cam>
      <rect x={0} y={0} width={W} height={H} fill="#000" opacity={out} />
    </g>
  );
};

// 7 — "She wakes up alone. Her mom is gone."
const Wakes: BeatComp = ({ t, w }) => {
  const open = t < w(1) ? 1 : t < w(1) + 0.25 ? 1 - (t - w(1)) / 0.25 : 0;
  const rise = ramp(t, w(2), w(3) + 0.3);
  const gone = pop(t, w(5) - 0.1);
  const fadeIn = ramp(t, 0, 0.4);
  return (
    <g>
      <Cam zoom={lerp(1.3, 1, ramp(t, w(3) - 0.2, w(4)))} cy={1150}>
        <Jungle t={t} dark={0.25} />
        {/* the empty seat row, tipped over in the mud */}
        <g transform="translate(280 1370) rotate(-12) scale(0.7)">
          <SeatBacks />
          <SeatFront />
          <rect x={-266} y={-560} width={164} height={360} rx={30} fill="none" stroke="#FFD23F" strokeWidth={14} opacity={gone} strokeDasharray="30 18" />
        </g>
        <g transform={`translate(700 1430) rotate(${lerp(-88, -25, rise)})`}>
          <Harrison x={0} y={0} scale={0.9} pose={J({ expression: gone > 0.3 ? "tired" : rise > 0.5 ? "scared" : "neutral", blink: open, lookX: rise > 0.5 ? Math.sin(t * 3) : 0, handL: { x: -130, y: -150 }, handR: { x: 130, y: -150 } })} />
        </g>
        <g transform={`translate(560 760) scale(${gone})`}>
          <ellipse rx={150} ry={90} fill="#fff" stroke={INK} strokeWidth={8} />
          <circle cx={60} cy={110} r={18} fill="#fff" stroke={INK} strokeWidth={6} />
          <circle cx={90} cy={150} r={10} fill="#fff" stroke={INK} strokeWidth={5} />
          <text textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={900} fontSize={76} fill={INK}>MOM?</text>
        </g>
      </Cam>
      <rect x={0} y={0} width={W} height={H} fill="#000" opacity={1 - fadeIn} />
    </g>
  );
};

/** A label with a leader line to a point on the body. */
const Callout: React.FC<{ text: string; lx: number; ly: number; px: number; py: number; k: number }> = ({ text, lx, ly, px, py, k }) => (
  <g opacity={k > 0 ? 1 : 0}>
    <path d={`M${lx} ${ly} L${lerp(lx, px, k)} ${lerp(ly, py, k)}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <path d={`M${lx} ${ly} L${lerp(lx, px, k)} ${lerp(ly, py, k)}`} stroke="#FF5A4A" strokeWidth={7} strokeLinecap="round" />
    <circle cx={px} cy={py} r={34 * k} fill="none" stroke="#FF5A4A" strokeWidth={8} />
    <Label text={text} x={lx} y={ly} k={k} size={44} color="#FFFFFF" />
  </g>
);

// 8 — "Broken collarbone. Cut arm. One sandal."
const Hurt: BeatComp = ({ t, w }) => {
  const k1 = pop(t, w(0) - 0.05);
  const k2 = pop(t, w(2) - 0.05);
  const k3 = pop(t, w(4) - 0.05);
  const X = 540;
  const Y = 1360;
  const S = 1.15;
  const at = (x: number, y: number) => ({ x: X + x * S, y: Y + y * S });
  const coll = at(40, -405);
  const arm = at(-92, -250);
  const foot = at(-64, -2);
  return (
    <Cam zoom={lerp(1.05, 1, ramp(t, 0, 1))}>
      <Jungle t={t} dark={0.3} front={false} />
      <Harrison x={X} y={Y} scale={S} pose={J({ expression: "tired", blink: blinkAt(t, 2.6), lookX: -0.3, headTilt: -6, handL: { x: -112, y: -186 }, handR: { x: 70, y: -300 } })} />
      {/* injuries drawn on the body */}
      <path d={`M${coll.x - 30} ${coll.y} l14 -10 l10 12 l12 -12 l14 10`} stroke="#E0453A" strokeWidth={7} fill="none" opacity={k1 > 0 ? 1 : 0} />
      <path d={`M${arm.x - 8} ${arm.y - 26} l14 50`} stroke="#E0453A" strokeWidth={9} strokeLinecap="round" opacity={k2 > 0 ? 1 : 0} />
      {/* mud */}
      {[[-40, -340], [50, -230], [-70, -180], [30, -300]].map(([x, y], i) => <ellipse key={i} cx={X + x * S} cy={Y + y * S} rx={14} ry={9} fill="#6B4A2E" opacity={0.7} />)}
      <Callout text="COLLARBONE" lx={860} ly={760} px={coll.x} py={coll.y} k={k1} />
      <Callout text="CUT ARM" lx={230} ly={980} px={arm.x} py={arm.y} k={k2} />
      <Callout text="ONE SANDAL" lx={820} ly={1230} px={foot.x} py={foot.y} k={k3} />
    </Cam>
  );
};

// 9 — "So she uses the rule. Find water. Follow it downstream."
const Rule: BeatComp = ({ t, w }) => {
  const mem = pop(t, 0.05, 0.4);
  const l1 = pop(t, w(5) - 0.05);
  const l2 = pop(t, w(7) - 0.05);
  const flow = ramp(t, w(7), w(9) + 0.4);
  return (
    <g>
      <Jungle t={t} dark={0.35} front={false} />
      <Stream t={t} y={1240} />
      <Arrow x1={200} y1={1330} x2={900} y2={1330} k={flow} color="#CFF3FF" />
      <Harrison x={150} y={1330} scale={0.45} pose={J({ expression: "determined", turn: 0.6, lookX: 1, lookY: 0.4 })} />
      {/* memory bubble: dad pointing to a stream */}
      <g transform={`translate(540 500) scale(${mem})`}>
        <circle r={290} fill="#E9D5AE" stroke={INK} strokeWidth={10} />
        <clipPath id="memc"><circle r={290} /></clipPath>
        <g clipPath="url(#memc)">
          <path d="M-320 160 Q-100 120 60 170 T340 150 L340 320 L-320 320 Z" fill="#8CC5D9" stroke={INK} strokeWidth={6} />
          <Harrison x={-110} y={250} scale={0.62} pose={{ look: DAD, expression: "smile", handR: { x: 240, y: -260 }, lookX: 1, blink: blinkAt(t) }} />
        </g>
        <text y={-240} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} fill="#6E5530" letterSpacing={4}>DAD'S RULE</text>
      </g>
      <Label text="1. FIND WATER" x={540} y={880} k={l1} size={58} color="#9FE3FF" />
      <Label text="2. FOLLOW IT DOWNSTREAM" x={540} y={975} k={l2} size={48} color="#9FE3FF" />
    </g>
  );
};

// 10 — "Streams lead to rivers. Rivers lead to people."
const Rivers: BeatComp = ({ t, w }) => {
  const s1 = ramp(t, 0, w(3) + 0.2);
  const s2 = ramp(t, w(3), w(6) + 0.2);
  const village = pop(t, w(7) - 0.1);
  const stream = "M150 200 C260 300 200 420 330 520 S420 660 460 760";
  const river = "M460 760 C520 880 700 900 700 1040 S640 1220 760 1300";
  return (
    <g>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#5E9B4E" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 7) * 1450} r={30 + rnd(i + 3) * 40} fill="#4E8A42" />)}
      {/* side streams joining */}
      <path d="M900 260 C800 420 700 600 560 820" stroke="#7FC7E8" strokeWidth={12} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s1} strokeLinecap="round" />
      <path d={stream} stroke={INK} strokeWidth={22} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s1} strokeLinecap="round" />
      <path d={stream} stroke="#7FC7E8" strokeWidth={12} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s1} strokeLinecap="round" />
      <path d={river} stroke={INK} strokeWidth={58} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s2} strokeLinecap="round" />
      <path d={river} stroke="#4BA3E8" strokeWidth={44} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s2} strokeLinecap="round" />
      {/* village */}
      <g transform={`translate(860 1240) scale(${village})`}>
        {[[-70, 0], [40, -30], [110, 40]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect x={-40} y={-40} width={80} height={60} fill="#E9D5AE" stroke={INK} strokeWidth={6} />
            <path d="M-52 -40 L0 -86 L52 -40 Z" fill="#C0392B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          </g>
        ))}
      </g>
      <Label text="STREAM" x={190} y={460} k={pop(t, w(0) - 0.05)} size={52} color="#FFFFFF" />
      <Label text="RIVER" x={870} y={900} k={pop(t, w(3) - 0.05)} size={52} color="#FFFFFF" />
      <Label text="PEOPLE" x={850} y={1110} k={pop(t, w(7) - 0.05)} size={52} color="#FFD23F" />
    </g>
  );
};

// 11 — "Flies lay eggs in her cut. Maggots start to grow."
const Maggots: BeatComp = ({ t, w, frame }) => {
  const g = walk(t, 1.2, 30, 40);
  const zoom = pop(t, w(6) - 0.1, 0.4);
  const n = Math.round(lerp(3, 14, ramp(t, w(6), w(9) + 0.3)));
  return (
    <g>
      <Jungle t={t} dark={0.3} />
      <Harrison x={480} y={1440 + g.bob} scale={1} pose={J({ expression: zoom > 0.3 ? "scared" : "tired", lookX: -0.8, lookY: 0.3, footL: g.footL, footR: g.footR, handL: { x: -150, y: -260 }, handR: g.handR, sweat: zoom, frame })} />
      <Stream t={t} y={1290} />
      {/* flies circling her arm */}
      {[0, 1, 2, 3].map((i) => {
        const a = t * (5 + i) + i * 1.6;
        const x = 330 + Math.cos(a) * 70;
        const y = 1170 + Math.sin(a * 1.3) * 50;
        return (
          <g key={i}>
            <ellipse cx={x - 6} cy={y - 8} rx={9} ry={5} fill="#E8F4FF" opacity={0.8} transform={`rotate(${Math.sin(frame) * 30} ${x} ${y})`} />
            <circle cx={x} cy={y} r={7} fill={INK} />
          </g>
        );
      })}
      {/* zoom inset on the wound */}
      <g transform={`translate(740 600) scale(${zoom})`}>
        <circle r={250} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
        <path d="M-170 -40 Q0 -120 170 40 Q0 80 -170 -40 Z" fill="#E28A8A" stroke="#B03A3A" strokeWidth={10} />
        {Array.from({ length: n }, (_, i) => <Maggot key={i} x={-120 + rnd(i) * 240} y={-50 + rnd(i + 4) * 90} t={t} i={i} s={2} />)}
        <text y={-160} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={42} fill={INK} letterSpacing={2}>HER ARM</text>
      </g>
      {zoom > 0 && <path d={`M330 1170 L${740 - 250 * zoom * 0.7} ${600 + 250 * zoom * 0.7}`} stroke={INK} strokeWidth={6} strokeDasharray="16 12" />}
    </g>
  );
};

// 12 — "Then she finds a hut, a boat, and fuel."
const HutBeat: BeatComp = ({ t, w }) => {
  const g = walk(t, 1.4, 30, 40);
  const x = lerp(140, 300, ramp(t, 0, w(4)));
  const hut = pop(t, w(4) - 0.1);
  const boat = pop(t, w(6) - 0.1);
  const fuel = pop(t, w(8) - 0.1);
  return (
    <g>
      <Jungle t={t} front={false} />
      <path d="M-200 1180 Q540 1120 1300 1180 L1300 1300 L-200 1300 Z" fill="#C9A86B" stroke={INK} strokeWidth={6} />
      <g transform={`translate(720 1190) scale(${hut})`}><Hut /></g>
      <g transform={`translate(900 1280) scale(${fuel})`}><FuelCan /></g>
      <Stream t={t} y={1300} />
      <g transform={`translate(380 1340) scale(${boat}) rotate(${Math.sin(t * 2) * 2})`}><Boat /></g>
      <Harrison x={x} y={1250 + g.bob} scale={0.72} pose={J({ expression: hut > 0.5 ? "relief" : "tired", turn: 0.6, lookX: 1, footL: t < w(4) ? g.footL : undefined, footR: t < w(4) ? g.footR : undefined, handL: g.handL, handR: g.handR })} />
      <Label text="HUT" x={720} y={760} k={hut} size={52} color="#FFFFFF" />
      <Label text="BOAT" x={600} y={1420} k={boat} size={52} color="#FFFFFF" />
      <Label text="FUEL" x={920} y={1040} k={fuel} size={52} color="#FFD23F" />
    </g>
  );
};

// 13 — "Her dad once poured fuel on a sick dog's wound. So she pours it on hers. The maggots crawl out."
const DogBeat: BeatComp = ({ t, w }) => {
  const second = t > w(10) - 0.15;
  const mem = pop(t, 0.05, 0.4);
  const pour1 = ramp(t, w(3), w(4) + 0.2);
  const pour2 = ramp(t, w(12) - 0.1, w(13));
  const out = ramp(t, w(16), w(19) + 0.6);
  if (!second) {
    return (
      <g>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#2A1F16" />
        <g transform={`translate(540 860) scale(${mem})`}>
          <circle r={470} fill="#E9D5AE" stroke={INK} strokeWidth={12} />
          <clipPath id="dogc"><circle r={460} /></clipPath>
          <g clipPath="url(#dogc)">
            <rect x={-480} y={180} width={960} height={300} fill="#C9A86B" />
            <Harrison x={-190} y={330} scale={0.8} pose={{ look: DAD, expression: "determined", handR: { x: 140, y: -420 }, elbowUpR: true, lookX: 1, lookY: 0.6 }} />
            <g transform={`translate(${-190 + 140 * 0.8} ${330 - 420 * 0.8})`}><FuelCan tilt={lerp(0, 110, pour1)} /></g>
            {pour1 > 0.6 && <path d="M30 20 Q60 100 70 140" stroke="#E7D27A" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />}
            <g transform="translate(60 330) scale(0.95)"><Dog t={t} /></g>
          </g>
          <text y={-380} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={42} fill="#6E5530" letterSpacing={4}>YEARS EARLIER</text>
        </g>
      </g>
    );
  }
  const handR = { x: -40, y: -400 };
  const armWound = { x: -120, y: -250 };
  return (
    <g>
      <Jungle t={t} dark={0.25} front={false} />
      <g transform="translate(860 1200) scale(0.8)"><Hut /></g>
      <Harrison x={540} y={1430} scale={1.2} pose={J({ expression: out > 0.3 ? "relief" : "determined", lookX: -0.8, lookY: 0.6, handR, elbowUpR: true, handL: { x: -150, y: -240 } })} />
      {/* can in her right hand, tipping */}
      <g transform={`translate(${540 + handR.x * 1.2} ${1430 + handR.y * 1.2}) rotate(${lerp(10, -120, pour2)}) translate(0 60)`}><FuelCan /></g>
      {pour2 > 0.6 && t < w(19) + 0.3 && (
        <path d={`M${540 - 140} ${1430 - 420} Q${540 - 160} ${1430 - 360} ${540 + armWound.x * 1.2} ${1430 + armWound.y * 1.2}`} stroke="#E7D27A" strokeWidth={12} fill="none" opacity={0.85} strokeLinecap="round" />
      )}
      {/* maggots wriggle out and drop */}
      {Array.from({ length: 12 }, (_, i) => {
        const start = w(16) + i * 0.08;
        const a = Math.max(0, t - start);
        if (t < start) return null;
        const x = 540 + armWound.x * 1.2 + (rnd(i) - 0.5) * 60 + a * (rnd(i + 3) - 0.5) * 200;
        const y = 1430 + armWound.y * 1.2 + a * a * 900;
        return y < 1500 ? <Maggot key={i} x={x} y={y} t={t} i={i} s={1.1} /> : null;
      })}
      <ComicText text="OUT!" x={250} y={560} size={150} k={pop(t, w(18))} rot={-10} />
    </g>
  );
};

// 14 — "The next day, local men find her."
const Found: BeatComp = ({ t, w }) => {
  const day = pop(t, w(0) - 0.05);
  const men = ramp(t, w(3) - 0.3, w(5) + 0.2);
  const g = walk(t, 1.5, 30, 40);
  const relief = ramp(t, w(5), w(6) + 0.2);
  return (
    <g>
      <Jungle t={t} front={false} />
      <path d="M-200 1180 Q540 1120 1300 1180 L1300 1600 L-200 1600 Z" fill="#C9A86B" stroke={INK} strokeWidth={6} />
      <g transform="translate(330 1190) scale(0.9)"><Hut /></g>
      <Harrison x={330} y={1440} scale={0.75} pose={J({ expression: relief > 0.5 ? "relief" : "tired", lookX: 1, turn: 0.4, blink: blinkAt(t), handL: { x: -60, y: -200 }, handR: { x: 60, y: -200 } })} />
      {[0, 1].map((i) => {
        const x = lerp(1300 + i * 160, 700 + i * 190, men);
        return (
          <Harrison key={i} x={x} y={1440 + (men < 1 ? g.bob : 0)} scale={0.78}
            pose={{ look: i ? LOCAL_B : LOCAL_A, expression: men > 0.9 ? "shock" : "neutral", turn: -0.5, lookX: -1,
              footL: men < 1 ? g.footL : undefined, footR: men < 1 ? g.footR : undefined, handL: i === 0 && men > 0.9 ? { x: -200, y: -470 } : undefined, elbowUpL: true }} />
        );
      })}
      <DayCard day={11} x={540} y={420} k={day} />
    </g>
  );
};

// 15 — CLOSE: "Ninety-one people died that day. Only one walked out of the jungle." (loops back to the falling start)
const End: BeatComp = ({ t, w, dur }) => {
  const N = 92;
  const SURV = 56;
  const greyed = Math.round(lerp(0, N, ramp(t, w(0), w(4) + 0.2)));
  const one = pop(t, w(5) - 0.05, 0.45);
  const toJungle = ramp(t, w(7) - 0.2, w(7) + 0.4);
  const loop = ramp(t, dur - 0.45, dur);
  const g = walk(t, 1.4, 30, 40);
  return (
    <g>
      <g opacity={1 - toJungle}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#141C2B" />
        <text x={540} y={250} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={70} fill="#FFFFFF">92 ON BOARD</text>
        {Array.from({ length: N }, (_, i) => {
          const col = i % 10;
          const row = Math.floor(i / 10);
          const x = 180 + col * 80;
          const y = 360 + row * 96;
          const isOne = i === SURV;
          const order = (i * 37) % N; // grey out in a scattered order
          const grey = !isOne && order < greyed;
          const op = isOne ? 1 : grey ? 0.18 : 1 - one * 0.8;
          const c = isOne && one > 0 ? "#FFD23F" : "#FFFFFF";
          const s = isOne ? 1 + one * 0.6 : 1;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
              <circle cx={0} cy={-26} r={14} fill={c} />
              <path d="M0 -12 V18 M-16 0 H16 M0 18 L-12 38 M0 18 L12 38" stroke={c} strokeWidth={6} strokeLinecap="round" />
            </g>
          );
        })}
        <Label text="91 DIED" x={300} y={1370} k={pop(t, w(2) - 0.05)} size={56} color="#FF7A6A" />
        <Label text="1 SURVIVED" x={760} y={1370} k={one} size={56} color="#FFD23F" />
      </g>
      {toJungle > 0 && (
        <g opacity={toJungle}>
          <Jungle t={t} />
          <defs>
            <radialGradient id="exitlight" cx="0.5" cy="0.35" r="0.6">
              <stop offset="0" stopColor="#FFF6C8" stopOpacity={0.9} />
              <stop offset="1" stopColor="#FFF6C8" stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect x={0} y={0} width={W} height={H} fill="url(#exitlight)" />
          <Harrison x={540} y={lerp(1500, 1380, ramp(t, w(7), dur))} scale={lerp(1, 0.8, ramp(t, w(7), dur))} pose={J({ expression: "determined", lookY: -0.3, ...g })} />
          <Darkness id="end-d" opacity={0.4} cx={540} cy={700} r={1100} />
        </g>
      )}
      {/* loop: fade to the opening sky */}
      <rect x={0} y={0} width={W} height={H} fill="#7FBCEB" opacity={loop} />
    </g>
  );
};

export const BEATS: Record<string, BeatComp> = {
  hook: Hook, question: Question, fake: Fake, eve: Eve, strike: Strike, fall: Fall, wakes: Wakes, hurt: Hurt,
  rule: Rule, rivers: Rivers, maggots: Maggots, hut: HutBeat, dog: DogBeat, found: Found, end: End,
};
