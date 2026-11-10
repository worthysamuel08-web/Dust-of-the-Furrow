/**
 * The whole documentary as one timeline: all 56 scenes back to back, each with
 * its narration clip (and optional subtitles) laid over it, plus the music bed.
 */
import { Audio } from "@remotion/media";
import { AbsoluteFill, Loop, Sequence, Series, staticFile, useVideoConfig } from "remotion";
import { NARRATION, narrationFile } from "./narration";
import { NarrationSubtitles } from "./NarrationSubtitles";
import { FILM_DURATION, FILM_SCENES, type FilmScene } from "./scenes";

export type FilmProps = {
  /** Show the narration as subtitles. */
  showNarration: boolean;
  /** Play the narration voice-over. */
  withVoice?: boolean;
};

/** One scene plus its narration voice and (optional) subtitles. */
export const SceneWithNarration: React.FC<{ scene: FilmScene; showNarration: boolean; withVoice?: boolean }> = ({ scene, showNarration, withVoice = true }) => {
  const { fps } = useVideoConfig();
  const Scene = scene.component;
  const narration = NARRATION[scene.number];
  return (
    <AbsoluteFill>
      <Scene />
      {showNarration && narration ? <NarrationSubtitles narration={narration} /> : null}
      {withVoice && narration ? (
        <Sequence from={Math.round(narration.startSec * fps)} layout="none" name="Narration">
          <Audio src={staticFile(narrationFile(scene.number))} volume={1} />
        </Sequence>
      ) : null}
      {scene.ambience ? (
        <Loop durationInFrames={20 * fps} layout="none">
          <Audio src={staticFile(`audio/sfx/${scene.ambience}.mp3`)} volume={0.2} />
        </Loop>
      ) : null}
    </AbsoluteFill>
  );
};

export const Documentary: React.FC<FilmProps> = ({ showNarration, withVoice = true }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Series>
      {FILM_SCENES.map((scene) => (
        <Series.Sequence key={scene.number} durationInFrames={scene.durationInFrames} name={`Scene ${scene.number}: ${scene.title}`}>
          <SceneWithNarration scene={scene} showNarration={showNarration} withVoice={withVoice} />
        </Series.Sequence>
      ))}
    </Series>
    <Sequence durationInFrames={FILM_DURATION} layout="none" name="Music">
      <Audio src={staticFile("audio/music/bed.mp3")} volume={0.16} />
    </Sequence>
  </AbsoluteFill>
);

/** A single scene from the registry, for previewing on its own. */
export const makeScenePreview = (number: number): React.FC<FilmProps> => {
  const scene = FILM_SCENES.find((s) => s.number === number);
  if (!scene) throw new Error(`Scene ${number} is not in FILM_SCENES`);
  const Preview: React.FC<FilmProps> = ({ showNarration, withVoice }) => (
    <SceneWithNarration scene={scene} showNarration={showNarration} withVoice={withVoice} />
  );
  Preview.displayName = `Scene${number}Preview`;
  return Preview;
};

/** Any scene by number (used by the "Scene" composition's props). */
export const AnyScene: React.FC<FilmProps & { scene: number }> = ({ scene, showNarration, withVoice }) => {
  const s = FILM_SCENES.find((x) => x.number === scene) ?? FILM_SCENES[0];
  return <SceneWithNarration scene={s} showNarration={showNarration} withVoice={withVoice} />;
};
