/**
 * The whole documentary as one timeline: every finished scene from
 * FILM_SCENES, back to back, each with optional narration subtitles laid over
 * it (scenes themselves are never modified).
 */
import { AbsoluteFill, Series } from "remotion";
import { NARRATION } from "./narration";
import { NarrationSubtitles } from "./NarrationSubtitles";
import { FILM_SCENES, type FilmScene } from "./scenes";

export type FilmProps = {
  /** Show the narration as subtitles (useful until the voice-over is recorded). */
  showNarration: boolean;
};

/** One scene plus its (optional) narration overlay. */
export const SceneWithNarration: React.FC<{ scene: FilmScene; showNarration: boolean }> = ({ scene, showNarration }) => {
  const Scene = scene.component;
  const narration = NARRATION[scene.number];
  return (
    <AbsoluteFill>
      <Scene />
      {showNarration && narration ? <NarrationSubtitles narration={narration} /> : null}
    </AbsoluteFill>
  );
};

export const Documentary: React.FC<FilmProps> = ({ showNarration }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Series>
      {FILM_SCENES.map((scene) => (
        <Series.Sequence key={scene.number} durationInFrames={scene.durationInFrames} name={`Scene ${scene.number}: ${scene.title}`}>
          <SceneWithNarration scene={scene} showNarration={showNarration} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);

/** A single scene from the registry, for previewing on its own. */
export const makeScenePreview = (number: number): React.FC<FilmProps> => {
  const scene = FILM_SCENES.find((s) => s.number === number);
  if (!scene) throw new Error(`Scene ${number} is not in FILM_SCENES`);
  const Preview: React.FC<FilmProps> = ({ showNarration }) => (
    <SceneWithNarration scene={scene} showNarration={showNarration} />
  );
  Preview.displayName = `Scene${number}Preview`;
  return Preview;
};
