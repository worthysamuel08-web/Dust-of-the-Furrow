import { Composition, Folder } from "remotion";
import { Main } from "./Main";
import { RigPreview } from "./dev/RigPreview";
import { Scene1 } from "./scenes/scene1/Scene1";
import { SCENE1_DURATION, SCENE1_FPS } from "./scenes/scene1/timeline";

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
      </Folder>
      <Folder name="Dev">
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
