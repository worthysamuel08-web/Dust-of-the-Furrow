import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Audio } from "@remotion/media";
import { Scene } from "./Scene";
import { Captions } from "./Captions";

export type MainProps = {
  captionsFile: string;
  audioFile: string;
};

export const Main: React.FC<MainProps> = ({ captionsFile, audioFile }) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d17" }}>
      {/* 3D layer — ThreeCanvas syncs react-three-fiber with Remotion's timeline */}
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true }}
      >
        <Scene />
      </ThreeCanvas>

      {/* Captions layer */}
      <Captions src={staticFile(captionsFile)} />

      {/* Audio track (files live in /public) */}
      <Audio src={staticFile(audioFile)} volume={0.6} />
    </AbsoluteFill>
  );
};
