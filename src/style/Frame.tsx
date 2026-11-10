/**
 * 2D finishing layers for the house style, drawn over the 3D render:
 * letterbox bars, vignette, deterministic film grain, and the glowing title.
 */
import "@fontsource/inter/800.css";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/** Picture aspect inside the bars (the reference is ~2:1). */
export const PICTURE_ASPECT = 2;

export const Letterbox: React.FC<{ aspect?: number }> = ({ aspect = PICTURE_ASPECT }) => {
  const { width, height } = useVideoConfig();
  const bar = Math.max(0, (height - width / aspect) / 2);
  if (bar <= 0) return null;
  return (
    <AbsoluteFill style={{ zIndex: 50, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bar, background: "#000" }} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number; centerX?: number }> = ({ strength = 0.6, centerX = 50 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at ${centerX}% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/**
 * Film grain from an SVG noise filter. The seed changes every 2 frames, so the
 * grain "moves" — but it is a pure function of the frame number (deterministic).
 */
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 97;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Bold white title with a warm glow ("THE WALL" style). Fades/scales in and out. */
export const GlowTitle: React.FC<{
  text: string;
  from: number;
  to: number;
  /** Vertical position as a fraction of the frame height. */
  y?: number;
  size?: number;
}> = ({ text, from, to, y = 0.2, size = 0.085 }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  if (frame < from || frame > to) return null;
  const ramp = Math.max(0.5, Math.min(8, (to - from) / 3));
  const opacity = interpolate(frame, [from, from + ramp, to - ramp, to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [from, from + 10], [1.12, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: height * y,
          transform: `translateY(-50%) scale(${scale})`,
          opacity,
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: height * size,
          letterSpacing: "0.04em",
          color: "#fff7ea",
          textShadow: `0 0 ${height * 0.012}px rgba(255,170,80,0.9), 0 0 ${height * 0.04}px rgba(255,140,50,0.55), 0 ${height * 0.004}px ${height * 0.006}px rgba(0,0,0,0.6)`,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
