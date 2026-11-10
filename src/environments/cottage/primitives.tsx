import { useMemo } from "react";
import * as THREE from "three";

type V3 = [number, number, number];

const UP = new THREE.Vector3(0, 1, 0);

/** A rough squared timber running from point a to point b. */
export const Beam: React.FC<{
  a: V3;
  b: V3;
  w?: number;
  d?: number;
  material: THREE.Material;
  roll?: number;
  cast?: boolean;
}> = ({ a, b, w = 0.14, d, material, roll = 0, cast = true }) => {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
    if (roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(UP, roll));
    return { pos: va.add(vb).multiplyScalar(0.5), quat: q, len: dir.length() };
  }, [a, b, roll]);
  return (
    <mesh position={pos} quaternion={quat} material={material} castShadow={cast} receiveShadow>
      <boxGeometry args={[w, len, d ?? w]} />
    </mesh>
  );
};

/** Box helper with shadows on. */
export const Block: React.FC<{
  size: V3;
  position: V3;
  rotation?: V3;
  material: THREE.Material;
  cast?: boolean;
}> = ({ size, position, rotation = [0, 0, 0], material, cast = true }) => (
  <mesh position={position} rotation={rotation} material={material} castShadow={cast} receiveShadow>
    <boxGeometry args={size} />
  </mesh>
);

/** A flat wall from a 2D outline (metres) with optional rectangular holes. UVs are in metres. */
export const WallShape: React.FC<{
  outline: [number, number][];
  holes?: [number, number][][];
  position: V3;
  rotationY?: number;
  material: THREE.Material;
}> = ({ outline, holes = [], position, rotationY = 0, material }) => {
  const geo = useMemo(() => {
    const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
    return new THREE.ShapeGeometry(shape);
  }, [outline, holes]);
  return (
    <mesh geometry={geo} position={position} rotation-y={rotationY} material={material} castShadow receiveShadow />
  );
};

/** Turned / thrown vessel from a profile of [radius, height] pairs. */
export const Lathe: React.FC<{
  profile: [number, number][];
  position: V3;
  material: THREE.Material;
  segments?: number;
  scale?: number;
}> = ({ profile, position, material, segments = 20, scale = 1 }) => {
  const geo = useMemo(
    () => new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), segments),
    [profile, segments],
  );
  return <mesh geometry={geo} position={position} scale={scale} material={material} castShadow receiveShadow />;
};
