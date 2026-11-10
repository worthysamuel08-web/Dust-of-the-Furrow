/**
 * Post-processing for the house style: shallow depth of field (soft
 * backgrounds and foregrounds) and bloom on bright lights (windows, the sun
 * shaft, the characters' rim light). Deterministic — no time-based noise
 * (film grain is a separate, frame-seeded overlay: see Frame.tsx).
 *
 * Place inside a <ThreeCanvas>. Cost: about 2 extra full-screen passes per frame.
 * For a quick preview on a slow PC, pass enabled={false}.
 */
import { useThree } from "@react-three/fiber";
import { Bloom, DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import type { Vec3 } from "../engine/CameraRig";

export type CinematicFXProps = {
  /** World-space point that stays sharp (usually the character's face). */
  focus: Vec3;
  /** Depth (metres) around the focus point that stays sharp. */
  focusRange?: number;
  /** Size of the out-of-focus blur. 0 disables depth of field. */
  bokeh?: number;
  /** Glow strength on bright areas. */
  bloom?: number;
  enabled?: boolean;
};

/**
 * The effect composer finishes setting up one tick after mount, so the very
 * first frame a render tab draws would come out black. Hold that frame,
 * draw it again once the composer is ready, then release it.
 */
const ComposerWarmup: React.FC = () => {
  const advance = useThree((s) => s.advance);
  const [handle] = useState(() => delayRender("Warming up post-processing"));
  useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        advance(performance.now());
        continueRender(handle);
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      continueRender(handle);
    };
  }, [advance, handle]);
  return null;
};

export const CinematicFX: React.FC<CinematicFXProps> = ({ focus, focusRange = 0.7, bokeh = 4, bloom = 0.7, enabled = true }) => {
  if (!enabled) return null;
  return (
    <>
      <EffectComposer multisampling={0}>
        <DepthOfField target={focus} worldFocusRange={focusRange} bokehScale={bokeh} />
        <Bloom intensity={bloom} luminanceThreshold={0.72} luminanceSmoothing={0.25} mipmapBlur />
      </EffectComposer>
      <ComposerWarmup />
    </>
  );
};
