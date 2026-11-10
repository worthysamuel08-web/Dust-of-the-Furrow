import { Composition, Folder } from "remotion";
import { Main } from "./Main";
import { RigPreview } from "./dev/RigPreview";
import { StyleTest, STYLE_TEST_DURATION } from "./dev/StyleTest";
import { Scene1 } from "./scenes/scene1/Scene1";
import { SCENE1_DURATION, SCENE1_FPS } from "./scenes/scene1/timeline";
import { AnyScene, Documentary, makeScenePreview } from "./film/Documentary";
import { FILM_DURATION, FILM_FPS, FILM_SCENES } from "./film/scenes";
import { SCENE2_DURATION, SCENE2_FPS } from "./scenes/scene2/timeline";

const Scene2Preview = makeScenePreview(2);
const NARRATION_ON = { showNarration: true };
/** The finished film: voice-over, no burned-in subtitles (set showNarration: true to add them). */
const FILM_PROPS = { showNarration: false, withVoice: true };

export const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Dust-of-the-Furrow">
        {/* Full quality */}
        <Composition
          id="Scene1-SoilOf1320"
          component={Scene1}
          durationInFrames={SCENE1_DURATION}
          fps={SCENE1_FPS}
          width={1920}
          height={1080}
        />
        {/* Same scene at 720p — faster previews and renders on older PCs */}
        <Composition
          id="Scene1-SoilOf1320-720p"
          component={Scene1}
          durationInFrames={SCENE1_DURATION}
          fps={SCENE1_FPS}
          width={1280}
          height={720}
        />
        {/* Scene 2 on its own (narration subtitles on by default; set showNarration to false for a clean render) */}
        <Composition
          id="Scene2-ThreePromises"
          component={Scene2Preview}
          durationInFrames={SCENE2_DURATION}
          fps={SCENE2_FPS}
          width={1920}
          height={1080}
          defaultProps={NARRATION_ON}
        />
        <Composition
          id="Scene2-ThreePromises-720p"
          component={Scene2Preview}
          durationInFrames={SCENE2_DURATION}
          fps={SCENE2_FPS}
          width={1280}
          height={720}
          defaultProps={NARRATION_ON}
        />
        {/* Any single scene, 1–56: set the "scene" prop (e.g. --props='{"scene":25}') */}
        <Composition
          id="Scene"
          component={AnyScene}
          durationInFrames={300}
          fps={FILM_FPS}
          width={1280}
          height={720}
          defaultProps={{ scene: 3, showNarration: true, withVoice: true }}
          calculateMetadata={({ props }) => ({
            durationInFrames: FILM_SCENES.find((s) => s.number === props.scene)?.durationInFrames ?? 300,
          })}
        />
        {/* The whole film: all 56 scenes in order (src/film/scenes.ts) */}
        <Composition
          id="Documentary"
          component={Documentary}
          durationInFrames={FILM_DURATION}
          fps={FILM_FPS}
          width={1920}
          height={1080}
          defaultProps={FILM_PROPS}
        />
        <Composition
          id="Documentary-720p"
          component={Documentary}
          durationInFrames={FILM_DURATION}
          fps={FILM_FPS}
          width={1280}
          height={720}
          defaultProps={FILM_PROPS}
        />
      </Folder>
      <Folder name="Dev">
        <Composition id="StyleTest-Silhouette" component={StyleTest} durationInFrames={STYLE_TEST_DURATION} fps={30} width={1920} height={1080} />
        <Composition id="Character-RigPreview" component={RigPreview} durationInFrames={180} fps={30} width={1280} height={720} />
      </Folder>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={FPS * 8}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          captionsFile: "captions.json",
          audioFile: "audio.mp3",
        }}
      />
    </>
  );
};
