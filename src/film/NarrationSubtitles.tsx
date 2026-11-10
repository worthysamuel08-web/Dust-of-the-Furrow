/**
 * Temporary on-screen narration (until the voice-over is recorded), so pacing
 * can be judged in previews. Drawn as an overlay ABOVE a scene, never inside it,
 * so built scenes stay untouched. Turn off with the `showNarration` prop.
 */
import "@fontsource/eb-garamond/500.css";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { captionChunks, type SceneNarration } from "./narration";

export const NarrationSubtitles: React.FC<{ narration: SceneNarration }> = ({ narration }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const chunk = captionChunks(narration).find((c) => t >= c.start - 0.05 && t < c.end + 0.35);
  if (!chunk) return null;
  const opacity = interpolate(t, [chunk.start - 0.05, chunk.start + 0.12, chunk.end + 0.2, chunk.end + 0.35], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: height * 0.06 }}>
      <div
        style={{
          opacity,
          fontFamily: "EB Garamond",
          fontWeight: 500,
          fontSize: height * 0.042,
          color: "#f4ead6",
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
