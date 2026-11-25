/** Thumbnails (1080x1920) drawn with the same stickman rig and props as the videos. */
import "@fontsource/inter/900.css";
import React from "react";
import { AbsoluteFill } from "remotion";
import { Harrison } from "./airpocket/Harrison";
import { Bubbles, Darkness, FlippedRoom, H, ROOM, W, WaterOver } from "./airpocket/kit";
import { JULIANE } from "./juliane/cast";
import { LapBelt, SEATED, SeatBacks, SeatFront } from "./juliane/props";

const Title: React.FC<{ red: string; white: string; redFirst?: boolean; top?: number; size?: number }> = ({ red, white, redFirst = true, top = 120, size = 150 }) => {
  const s: React.CSSProperties = {
    fontFamily: "Inter", fontWeight: 900, fontSize: size, lineHeight: 1.0, letterSpacing: -3, color: "#fff",
    WebkitTextStroke: "22px #111", paintOrder: "stroke fill", textShadow: "0 12px 0 rgba(0,0,0,0.4)",
  };
  return (
    <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center" }}>
      {redFirst ? <><div style={{ ...s, color: "#FF3B30", fontSize: size * 1.25 }}>{red}</div><div style={s}>{white}</div></>
        : <><div style={s}>{white}</div><div style={{ ...s, color: "#FF3B30", fontSize: size * 1.25 }}>{red}</div></>}
    </div>
  );
};

/** Air Pocket: Harrison's head in the glowing air pocket of the upside-down room. */
export const ThumbAirPocket: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <g transform="translate(540 1330) scale(1.6) translate(-540 -760)">
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0A0F14" />
        <FlippedRoom t={0.4} />
        <Harrison x={540} y={ROOM.water + 335} pose={{ expression: "shock", sweat: 1, lookY: -0.6, handL: { x: -150, y: -720 }, handR: { x: 150, y: -720 }, elbowUpL: true, elbowUpR: true }} />
        <WaterOver t={0.4} y={ROOM.water} />
        <Bubbles t={1.3} x={540} y={1300} n={14} spread={600} speed={300} rise={500} />
      </g>
      <Darkness id="th-ap" opacity={0.85} cx={540} cy={1150} r={760} />
      <defs><radialGradient id="pocket"><stop offset="0" stopColor="#9FEFFF" stopOpacity={0.35} /><stop offset="1" stopColor="#9FEFFF" stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={540} cy={1080} rx={520} ry={330} fill="url(#pocket)" style={{ mixBlendMode: "screen" }} />
    </svg>
    <Title red="3 DAYS" white="UNDER THE SEA" />
  </AbsoluteFill>
);

/** Juliane: spinning down in her seat row against the sky. */
export const ThumbJuliane: React.FC = () => (
  <AbsoluteFill style={{ background: "#4F9DE0" }}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs><linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3F8FD8" /><stop offset="1" stopColor="#BFE6FF" /></linearGradient></defs>
      <rect width={W} height={H} fill="url(#tsky)" />
      {[[160, 1500], [900, 1350], [300, 700], [980, 640]].map(([x, y], i) => (
        <g key={i}><ellipse cx={x} cy={y} rx={240} ry={80} fill="#fff" stroke="#141414" strokeWidth={6} /><ellipse cx={x + 100} cy={y - 46} rx={140} ry={66} fill="#fff" stroke="#141414" strokeWidth={6} /></g>
      ))}
      {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${(i * 97) % W} ${(i * 263) % H} l0 220`} stroke="#fff" strokeWidth={6} opacity={0.6} strokeLinecap="round" />)}
      <g transform="translate(540 1150) rotate(-18) scale(1.15) translate(0 230)">
        <SeatBacks />
        <SeatFront />
        <Harrison x={0} y={10} pose={{ look: JULIANE, ...SEATED, expression: "shock", sweat: 1, handL: { x: -96, y: -252 }, handR: { x: 96, y: -252 } }} />
        <LapBelt />
      </g>
      {/* the jungle far below */}
      <path d="M-50 1800 Q200 1740 400 1790 T800 1770 T1130 1790 L1130 1980 L-50 1980 Z" fill="#2F7A3B" stroke="#141414" strokeWidth={6} />
    </svg>
    <Title red="3 KM" white="SHE FELL" redFirst={false} />
  </AbsoluteFill>
);
