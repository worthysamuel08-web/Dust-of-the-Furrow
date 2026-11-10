/** 2D graphics in the house style: bold glowing type, simple shapes. */
import "@fontsource/inter/800.css";
import "@fontsource/eb-garamond/400-italic.css";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { GlowTitle, PICTURE_ASPECT } from "../../style/Frame";
import type { OverlaySpec } from "./spec";

const GLOW = (h: number) =>
  `0 0 ${h * 0.01}px rgba(255,170,80,0.9), 0 0 ${h * 0.03}px rgba(255,140,50,0.5), 0 ${h * 0.003}px ${h * 0.005}px rgba(0,0,0,0.7)`;

const useFade = (from: number, to: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = from * fps;
  const b = to * fps;
  // fades shorten for very brief graphics so the ranges always stay increasing
  const ramp = Math.max(0.5, Math.min(8, (b - a) / 3));
  const o = b > a ? interpolate(frame, [a, a + ramp, b - ramp, b], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return { o, t: frame - a, visible: frame >= a && frame <= b };
};

const Label: React.FC<{ text: string; from: number; to: number; where: string }> = ({ text, from, to, where }) => {
  const { height, width } = useVideoConfig();
  const { o, t, visible } = useFade(from, to);
  if (!visible) return null;
  const bar = Math.max(0, (height - width / PICTURE_ASPECT) / 2);
  const pos: React.CSSProperties =
    where === "top"
      ? { top: bar + height * 0.06, left: 0, right: 0, textAlign: "center" }
      : where === "left"
        ? { top: "40%", left: width * 0.06, textAlign: "left" }
        : where === "right"
          ? { top: "40%", right: width * 0.06, textAlign: "right" }
          : where === "center"
            ? { top: "45%", left: 0, right: 0, textAlign: "center" }
            : { bottom: bar + height * 0.14, left: 0, right: 0, textAlign: "center" };
  return (
    <div
      style={{
        position: "absolute",
        ...pos,
        opacity: o,
        transform: `translateY(${Math.max(0, 8 - t) * 1.2}px)`,
        fontFamily: "Inter",
        fontWeight: 800,
        fontSize: height * 0.046,
        letterSpacing: "0.04em",
        color: "#fff7ea",
        textShadow: GLOW(height),
        whiteSpace: "pre",
        zIndex: 40,
      }}
    >
      {text}
    </div>
  );
};

const List: React.FC<{ items: string[]; from: number; to: number }> = ({ items, from, to }) => {
  const { height, width, fps } = useVideoConfig();
  const { o, t, visible } = useFade(from, to);
  if (!visible) return null;
  const bar = Math.max(0, (height - width / PICTURE_ASPECT) / 2);
  const each = ((to - from) * fps * 0.6) / items.length;
  // shrink long lists so the whole row fits inside the frame
  const chars = items.reduce((n, it) => n + it.length, 0) + items.length * 2;
  const font = height * 0.05 * Math.min(1, 34 / chars);
  return (
    <div style={{ position: "absolute", top: bar + height * 0.07, left: width * 0.05, right: width * 0.05, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: font * 0.8, opacity: o, zIndex: 40 }}>
      {items.map((it, i) => {
        const a = interpolate(t, [i * each, i * each + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ opacity: a, transform: `scale(${1.2 - 0.2 * a})`, fontFamily: "Inter", fontWeight: 800, fontSize: font, color: "#fff7ea", textShadow: GLOW(height), whiteSpace: "nowrap" }}>
            {it}
          </div>
        );
      })}
    </div>
  );
};

const Roll: React.FC<{ lines: string[]; caption?: string; from: number; to: number }> = ({ lines, caption, from, to }) => {
  const { height, width } = useVideoConfig();
  const { o, t, visible } = useFade(from, to);
  if (!visible) return null;
  const w = width * 0.26;
  return (
    <div style={{ position: "absolute", right: width * 0.07, top: "50%", transform: `translateY(-50%) rotate(-2deg) scale(${1.08 - 0.08 * Math.min(1, t / 10)})`, width: w, opacity: o, zIndex: 40 }}>
      <div style={{ background: "linear-gradient(#f1e3c2, #dcc79c)", borderRadius: height * 0.01, padding: `${height * 0.03}px ${height * 0.03}px`, boxShadow: `0 0 ${height * 0.03}px rgba(255,170,80,0.55), 0 ${height * 0.01}px ${height * 0.03}px rgba(0,0,0,0.6)` }}>
        {lines.map((l, i) => {
          const a = interpolate(t, [6 + i * 10, 14 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ opacity: a, fontFamily: "EB Garamond", fontStyle: "italic", fontSize: height * 0.034, color: "#2a1d12", lineHeight: 1.35 }}>
              {l}
            </div>
          );
        })}
      </div>
      {caption ? (
        <div style={{ marginTop: height * 0.015, textAlign: "center", fontFamily: "Inter", fontWeight: 800, fontSize: height * 0.03, color: "#fff7ea", textShadow: GLOW(height) }}>{caption}</div>
      ) : null}
    </div>
  );
};

const Cross: React.FC<{ text: string; from: number; to: number }> = ({ text, from, to }) => {
  const { height, width } = useVideoConfig();
  const { o, t, visible } = useFade(from, to);
  if (!visible) return null;
  const strike = interpolate(t, [10, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: "26%", right: width * 0.1, opacity: o, zIndex: 40 }}>
      <div style={{ position: "relative", fontFamily: "Inter", fontWeight: 800, fontSize: height * 0.07, color: "#fff7ea", textShadow: GLOW(height) }}>
        {text}
        <div style={{ position: "absolute", left: "-6%", top: "52%", height: height * 0.012, width: `${112 * strike}%`, background: "#e0402a", transform: "rotate(-8deg)", boxShadow: "0 0 10px rgba(224,64,42,0.8)" }} />
      </div>
    </div>
  );
};

const Calendar: React.FC<{ lord: number[]; from: number; to: number }> = ({ lord, from, to }) => {
  const { height, width } = useVideoConfig();
  const { o, t, visible } = useFade(from, to);
  if (!visible) return null;
  const size = height * 0.1;
  return (
    <div style={{ position: "absolute", top: "18%", left: 0, right: 0, display: "flex", justifyContent: "center", gap: size * 0.18, opacity: o, zIndex: 40 }}>
      {Array.from({ length: 7 }, (_, i) => {
        const isLord = lord.includes(i);
        const flip = interpolate(t, [8 + i * 5, 14 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ width: size, height: size * 1.1, borderRadius: size * 0.12, border: `${size * 0.04}px solid #ffb35c`, background: isLord ? `rgba(170,40,30,${0.85 * flip})` : "rgba(26,19,32,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(255,170,80,0.4)" }}>
            <div style={{ fontFamily: "Inter", fontWeight: 800, color: "#fff7ea", fontSize: size * 0.2 }}>DAY {i + 1}</div>
            <div style={{ fontFamily: "Inter", fontWeight: 800, color: isLord ? "#ffe0c0" : "#c9b8a0", fontSize: size * 0.17, opacity: flip }}>{isLord ? "LORD" : i === 6 ? "SUNDAY" : "YOURS"}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: size * 1.3, width: width, textAlign: "center", fontFamily: "Inter", fontWeight: 800, fontSize: height * 0.034, color: "#fff7ea", textShadow: GLOW(height) }}>+ EXTRA DAYS AT HARVEST · + RENT</div>
    </div>
  );
};

const Coins: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const { height } = useVideoConfig();
  const { o, t, visible } = useFade(from, to);
  if (!visible) return null;
  const coins = [
    { name: "PENNY", d: 0.11 },
    { name: "HALFPENNY", d: 0.085 },
    { name: "FARTHING", d: 0.065 },
  ];
  return (
    <div style={{ position: "absolute", top: "22%", left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: height * 0.07, opacity: o, zIndex: 40 }}>
      {coins.map((c, i) => {
        const a = interpolate(t, [i * 8, i * 8 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={c.name} style={{ textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>
            <div style={{ width: height * c.d, height: height * c.d, margin: "0 auto", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #fbf6ea, #b9b3a6 60%, #7c776d)", boxShadow: "0 0 18px rgba(255,220,160,0.6)", border: "2px solid #5e5a52", display: "flex", alignItems: "center", justifyContent: "center", fontSize: height * c.d * 0.5, color: "#5e5a52", fontWeight: 800, fontFamily: "Inter" }}>+</div>
            <div style={{ marginTop: height * 0.015, fontFamily: "Inter", fontWeight: 800, fontSize: height * 0.03, color: "#fff7ea", textShadow: GLOW(height) }}>{c.name}</div>
          </div>
        );
      })}
    </div>
  );
};

const Year: React.FC<{ text: string; from: number; to: number }> = ({ text, from, to }) => {
  const { height, width } = useVideoConfig();
  const { o, visible } = useFade(from, to);
  if (!visible) return null;
  const bar = Math.max(0, (height - width / PICTURE_ASPECT) / 2);
  return (
    <div style={{ position: "absolute", top: bar + height * 0.05, left: width * 0.05, opacity: o, fontFamily: "Inter", fontWeight: 800, fontSize: height * 0.09, color: "#fff7ea", letterSpacing: "0.06em", textShadow: GLOW(height), zIndex: 40 }}>
      {text}
    </div>
  );
};

export const Overlays: React.FC<{ items: OverlaySpec[] }> = ({ items }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 40 }}>
      {items.map((o, i) => {
        switch (o.kind) {
          case "title":
            return <GlowTitle key={i} text={o.text} from={Math.round(o.from * fps)} to={Math.round(o.to * fps)} y={o.y ?? 0.22} size={0.075} />;
          case "label":
            return <Label key={i} text={o.text} from={o.from} to={o.to} where={o.where ?? "bottom"} />;
          case "list":
            return <List key={i} items={o.items} from={o.from} to={o.to} />;
          case "roll":
            return <Roll key={i} lines={o.lines} caption={o.caption} from={o.from} to={o.to} />;
          case "cross":
            return <Cross key={i} text={o.text} from={o.from} to={o.to} />;
          case "calendar":
            return <Calendar key={i} lord={o.lord} from={o.from} to={o.to} />;
          case "coins":
            return <Coins key={i} from={o.from} to={o.to} />;
          case "year":
            return <Year key={i} text={o.text} from={o.from} to={o.to} />;
        }
      })}
    </AbsoluteFill>
  );
};

/** Deterministic rain streaks over the frame. */
export const Rain: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drops = Array.from({ length: 140 }, (_, i) => {
    const x = ((i * 137.5) % 100) / 100;
    const speed = 0.9 + ((i * 53) % 7) / 10;
    const y = (((i * 61) % 100) / 100 + frame * 0.045 * speed) % 1.1;
    return { x: x * width + y * 30, y: y * height - 40, len: 26 + (i % 5) * 8 };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 30 }}>
      <svg width={width} height={height}>
        {drops.map((d, i) => (
          <line key={i} x1={d.x} y1={d.y} x2={d.x - 6} y2={d.y + d.len} stroke="rgba(190,200,230,0.35)" strokeWidth={1.6} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
