import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";
import "@fontsource/inter/800.css"; // bundled locally, no network needed at render time

const fontFamily = "Inter";

// How many ms of words get grouped onto one caption "page"
const COMBINE_MS = 1200;

export const Captions: React.FC<{ src: string }> = ({ src }) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading captions"));
  const { fps } = useVideoConfig();

  const load = useCallback(async () => {
    const res = await fetch(src);
    setCaptions((await res.json()) as Caption[]);
    continueRender(handle);
  }, [src, handle]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = useMemo(() => {
    if (!captions) return [];
    return createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: COMBINE_MS }).pages;
  }, [captions]);

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs;
        const durationInFrames = Math.max(1, Math.round(((endMs - page.startMs) / 1000) * fps));
        return (
          <Sequence key={i} from={startFrame} durationInFrames={durationInFrames} layout="none">
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Time relative to the start of this page (Sequence resets frame to 0)
  const absoluteMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120 }}>
      <div
        style={{
          fontFamily,
          fontSize: 72,
          fontWeight: 800,
          textAlign: "center",
          whiteSpace: "pre",
          color: "white",
          WebkitTextStroke: "10px black",
          paintOrder: "stroke",
        }}
      >
        {page.tokens.map((t, i) => {
          const active = t.fromMs <= absoluteMs && t.toMs > absoluteMs;
          return (
            <span key={i} style={{ color: active ? "#ffd93b" : "white" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
