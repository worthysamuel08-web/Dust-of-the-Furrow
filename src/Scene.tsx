import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * IMPORTANT: Drive every animation from useCurrentFrame(), never from
 * react-three-fiber's useFrame() or clocks — Remotion renders frames out of
 * order and in parallel, so animation must be a pure function of the frame.
 */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 12 } });
  const rotation = (frame / fps) * Math.PI * 0.5;
  const hue = interpolate(frame, [0, durationInFrames], [200, 320]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#ff4fd8" />

      <mesh
        scale={entrance * 0.9}
        rotation={[rotation * 0.6, rotation, 0]}
      >
        <torusKnotGeometry args={[1, 0.32, 256, 48]} />
        <meshStandardMaterial
          color={`hsl(${hue}, 80%, 55%)`}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 + frame / 40;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 3, Math.sin(angle * 2) * 0.6, Math.sin(angle) * 3 - 1]}
            scale={entrance * 0.18}
          >
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#7cf7ff" emissive="#1a6b7a" />
          </mesh>
        );
      })}
    </>
  );
};
