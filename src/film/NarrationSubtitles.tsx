/**
 * Temporary on-screen narration (until the voice-over is recorded), so pacing
 * can be judged in previews. Drawn as an overlay ABOVE a scene, never inside it,
 * so built scenes stay untouched. Turn off with the `showNarration` prop.
 */
import "@fontsource/inter/800.css";
import { PICTURE_ASPECT } from "../style/Frame";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { captionChunks, type SceneNarration } from "./narration";

export const NarrationSubtitles: React.FC<{ narration: SceneNarration }> = ({ narration }) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  // sit just inside the letterboxed picture
  const bar = Math.max(0, (height - width / PICTURE_ASPECT) / 2);
  const t = frame / fps;
  const chunk = captionChunks(narration).find((c) => t >= c.start - 0.05 && t < c.end + 0.35);
  if (!chunk) return null;
  const opacity = interpolate(t, [chunk.start - 0.05, chunk.start + 0.12, chunk.end + 0.2, chunk.end + 0.35], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bar + height * 0.04, zIndex: 60 }}>
      <div
        style={{
          opacity,
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: height * 0.034,
          letterSpacing: "0.01em",
          color: "#fff7ea",
          textAlign: "center",
          maxWidth: "80%",
          padding: `${height * 0.006}px ${height * 0.02}px`,
          background: "rgba(10,8,6,0.45)",
          borderRadius: height * 0.008,
          textShadow: "0 2px 6px rgba(0,0,0,0.9)",
        }}
      >
        {chunk.text}
      </div>
    </AbsoluteFill>
  );
};
