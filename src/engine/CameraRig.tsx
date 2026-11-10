import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

export type Vec3 = [number, number, number];

/**
 * Positions the r3f default camera from props. Drive `position`/`target`
 * from frame-based keyframes; the camera is updated before each frame renders.
 */
export const CameraRig: React.FC<{ position: Vec3; target: Vec3; fov?: number; roll?: number }> = ({
  position,
  target,
  fov,
  roll = 0,
}) => {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(...target);
    if (fov !== undefined && camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};
