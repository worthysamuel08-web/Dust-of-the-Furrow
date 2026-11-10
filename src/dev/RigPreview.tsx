/**
 * Rig preview: the stickman on a neutral background, cycling through preset
 * poses and expressions. Use it to tune the character without the 3D set.
 */
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraRig } from "../engine/CameraRig";
import { animate, buildTrack, ease } from "../engine/animation";
import { LYING_ON_BACK, SITTING_IN_BED, STANDING, Stickman, blink, type StickmanPose } from "../characters/stickman";

const { face: _f1, ...LYING_BODY } = LYING_ON_BACK;
const { face: _f2, ...SITTING_BODY } = SITTING_IN_BED;
const { face: _f3, ...STANDING_BODY } = STANDING;

const TRACK = buildTrack<StickmanPose>(LYING_ON_BACK, [
  { frame: 0 },
  { frame: 15 },
  { frame: 45, set: { ...SITTING_BODY, face: { eyeOpenL: 0.6, eyeOpenR: 0.6, browTiltL: 0.4, browTiltR: 0.4 } } },
  { frame: 60 },
  { frame: 90, set: { ...STANDING_BODY, rootY: 0.3, face: { eyeOpenL: 1, eyeOpenR: 1, mouthSmile: 0.7, browTiltL: 0, browTiltR: 0 } } },
  { frame: 105, set: { headTurn: -0.7, face: { lookX: -1 } } },
  { frame: 125, set: { headTurn: 0.8, armNear: { shoulder: 150, elbow: 30, wrist: 0 }, face: { lookX: 1, mouthOpen: 0.5, browRaiseL: 0.8, browRaiseR: 0.8 } }, ease: ease.out },
  { frame: 150, set: { headTurn: 0, armNear: STANDING.armNear, face: { lookX: 0, mouthOpen: 0, mouthSmile: -0.6, browTiltL: -0.8, browTiltR: -0.8, browRaiseL: -0.5, browRaiseR: -0.5 } } },
  { frame: 180 },
]);

export const RigPreview: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const pose = animate(frame, TRACK);
  const b = blink(frame, [70, 160]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#8a8f99" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 0.5, 2.6] }}>
        <CameraRig position={[0, 0.5, 2.6]} target={[0, 0.45, 0]} />
        <Stickman
          pose={{ ...pose, face: { ...pose.face, eyeOpenL: pose.face.eyeOpenL * b, eyeOpenR: pose.face.eyeOpenR * b } }}
          position={[0.25, 0.1, 0]}
        />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
