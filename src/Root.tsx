import { Composition, Folder } from "remotion";
import { Main } from "./Main";
import { RigPreview } from "./dev/RigPreview";
import { StyleTest, STYLE_TEST_DURATION } from "./dev/StyleTest";
import { Scene1 } from "./scenes/scene1/Scene1";
import { SCENE1_DURATION, SCENE1_FPS } from "./scenes/scene1/timeline";
import { Documentary, makeScenePreview } from "./film/Documentary";
import { FILM_DURATION, FILM_FPS } from "./film/scenes";
import { SCENE2_DURATION, SCENE2_FPS } from "./scenes/scene2/timeline";

const Scene2Preview = makeScenePreview(2);
const NARRATION_ON = { showNarration: true };

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
        {/* The film so far: every finished scene in order (src/film/scenes.ts) */}
        <Composition
          id="Documentary"
          component={Documentary}
          durationInFrames={FILM_DURATION}
          fps={FILM_FPS}
          width={1920}
          height={1080}
          defaultProps={NARRATION_ON}
        />
        <Composition
          id="Documentary-720p"
          component={Documentary}
          durationInFrames={FILM_DURATION}
          fps={FILM_FPS}
          width={1280}
          height={720}
          defaultProps={NARRATION_ON}
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
