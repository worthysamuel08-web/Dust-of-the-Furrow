/**
 * The building itself: earthen floor, wattle-and-daub walls in a timber frame,
 * a cruck truss, and the underside of the thatched roof.
 */
import { useMemo } from "react";
import { seededRandom } from "../../engine/animation";
import { DOOR, ROOM, WINDOW } from "./layout";
import type { CottageMaterials } from "./materials";
import { Beam, Block, WallShape } from "./primitives";

const { x0, x1, zBack, zFront, eave, ridge, ridgeZ } = ROOM;
const W = x1 - x0;

// ---- wall outlines (module constants so geometry is built once) -------------
const BACK_OUTLINE: [number, number][] = [[x0, 0], [x1, 0], [x1, eave], [x0, eave]];
const BACK_HOLES: [number, number][][] = [
  [[WINDOW.x0, WINDOW.y0], [WINDOW.x1, WINDOW.y0], [WINDOW.x1, WINDOW.y1], [WINDOW.x0, WINDOW.y1]],
];
const FRONT_OUTLINE: [number, number][] = [[-x1, 0], [-x0, 0], [-x0, eave], [-x1, eave]];
// Left gable: rotated +90° about Y, so local x = -world z
const LEFT_OUTLINE: [number, number][] = [
  [-zFront, 0], [-zBack, 0], [-zBack, eave], [-ridgeZ, ridge], [-zFront, eave],
];
// Right gable: rotated -90° about Y, so local x = +world z
const RIGHT_OUTLINE: [number, number][] = [
  [zBack, 0], [zFront, 0], [zFront, eave], [ridgeZ, ridge], [zBack, eave],
];
const RIGHT_HOLES: [number, number][][] = [
  [[DOOR.z0, 0.02], [DOOR.z1, 0.02], [DOOR.z1, DOOR.height], [DOOR.z0, DOOR.height]],
];

const slope = (zEdge: number) => {
  const run = ridgeZ - zEdge;
  const rise = ridge - eave;
  return { len: Math.hypot(run, rise), angle: Math.atan2(rise, Math.abs(run)) };
};

/** Underside of one roof slope with rafters, purlins and binding. */
const RoofSlope: React.FC<{ side: "back" | "front"; m: CottageMaterials }> = ({ side, m }) => {
  const zEdge = side === "back" ? zBack : zFront;
  const { len, angle } = slope(zEdge);
  const sign = side === "back" ? 1 : -1;
  const midZ = (zEdge + ridgeZ) / 2;
  const midY = (eave + ridge) / 2;
  const rafters = useMemo(() => {
    const out: number[] = [];
    for (let x = x0 + 0.25; x < x1; x += 0.46) out.push(x);
    return out;
  }, []);
  const at = (t: number): [number, number] => [zEdge + (ridgeZ - zEdge) * t, eave + (ridge - eave) * t];
  return (
    <group>
      {/* thatch underside: a plane tilted along the slope, pushed slightly outward */}
      <mesh
        position={[0, midY + 0.06, midZ - sign * 0.04]}
        rotation={[sign * (Math.PI / 2 - angle), 0, 0]}
        material={m.thatch}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[W + 0.4, len + 0.25]} />
      </mesh>
      {rafters.map((x, i) => {
        const [za, ya] = at(-0.02);
        const [zb, yb] = at(1);
        return <Beam key={i} a={[x, ya, za]} b={[x, yb, zb]} w={0.07} d={0.09} material={m.timberMid} roll={i * 0.07} />;
      })}
      {[0.35, 0.7].map((t) => {
        const [z, y] = at(t);
        return <Beam key={t} a={[x0, y - 0.07, z]} b={[x1, y - 0.07, z]} w={0.1} material={m.timber} />;
      })}
    </group>
  );
};

/** A cruck truss: two naturally curved blades rising from the floor to the ridge. */
const Cruck: React.FC<{ x: number; m: CottageMaterials }> = ({ x, m }) => {
  const blade = (zFoot: number) => {
    const pts: [number, number, number][] = [];
    const ctrlZ = zFoot + (ridgeZ - zFoot) * 0.05;
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const u = 1 - t;
      const z = u * u * zFoot + 2 * u * t * ctrlZ + t * t * ridgeZ;
      const y = u * u * 0.1 + 2 * u * t * (eave + 0.45) + t * t * (ridge - 0.05);
      pts.push([x, y, z]);
    }
    return pts;
  };
  const back = blade(zBack + 0.32);
  const front = blade(zFront - 0.32);
  return (
    <group>
      {[back, front].map((pts, b) =>
        pts.slice(1).map((p, i) => (
          <Beam key={`${b}-${i}`} a={pts[i]} b={p} w={0.17} d={0.2} material={m.timber} />
        )),
      )}
      {/* padstones under the feet */}
      <Block size={[0.32, 0.12, 0.32]} position={[x, 0.05, zBack + 0.32]} material={m.stone} />
      <Block size={[0.32, 0.12, 0.32]} position={[x, 0.05, zFront - 0.32]} material={m.stone} />
      {/* tie beam and collar */}
      <Beam a={[x, eave - 0.05, zBack + 0.1]} b={[x, eave - 0.05, zFront - 0.1]} w={0.15} d={0.17} material={m.timber} />
      <Beam a={[x, ridge - 0.65, -0.55]} b={[x, ridge - 0.65, 0.75]} w={0.11} material={m.timber} />
    </group>
  );
};

export const Structure: React.FC<{ m: CottageMaterials }> = ({ m }) => {
  // slightly irregular stud spacing, deterministic
  const studs = useMemo(() => {
    const rnd = seededRandom(77);
    const xs: number[] = [];
    for (let x = x0 + 0.9; x < x1 - 0.5; x += 1.05 + rnd() * 0.3) {
      if (x > WINDOW.x0 - 0.15 && x < WINDOW.x1 + 0.15) continue;
      xs.push(x);
    }
    return xs;
  }, []);

  return (
    <group>
      {/* ---- earthen floor ---- */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, (zBack + zFront) / 2]} material={m.earth} receiveShadow>
        <planeGeometry args={[W, zFront - zBack]} />
      </mesh>

      {/* ---- wattle-and-daub infill ---- */}
      <WallShape outline={BACK_OUTLINE} holes={BACK_HOLES} position={[0, 0, zBack]} material={m.daub} />
      <WallShape outline={FRONT_OUTLINE} position={[0, 0, zFront]} rotationY={Math.PI} material={m.daub} />
      <WallShape outline={LEFT_OUTLINE} position={[x0, 0, 0]} rotationY={Math.PI / 2} material={m.daub} />
      <WallShape outline={RIGHT_OUTLINE} holes={RIGHT_HOLES} position={[x1, 0, 0]} rotationY={-Math.PI / 2} material={m.daub} />

      {/* ---- timber frame on the back wall ---- */}
      <Beam a={[x0, 0.07, zBack + 0.06]} b={[x1, 0.07, zBack + 0.06]} w={0.16} material={m.timber} />
      <Beam a={[x0, eave - 0.06, zBack + 0.07]} b={[x1, eave - 0.06, zBack + 0.07]} w={0.17} material={m.timber} />
      {studs.map((x, i) => (
        <Beam key={i} a={[x, 0.1, zBack + 0.05]} b={[x, eave - 0.1, zBack + 0.05]} w={0.13} d={0.1} material={m.timber} roll={(i % 3) * 0.04} />
      ))}
      <Beam a={[x0, 1.02, zBack + 0.05]} b={[WINDOW.x0 - 0.06, 1.02, zBack + 0.05]} w={0.1} material={m.timber} />
      <Beam a={[WINDOW.x1 + 0.06, 1.02, zBack + 0.05]} b={[x1, 1.02, zBack + 0.05]} w={0.1} material={m.timber} />
      {/* corner posts */}
      {[
        [x0 + 0.08, zBack + 0.08],
        [x1 - 0.08, zBack + 0.08],
        [x0 + 0.08, zFront - 0.08],
        [x1 - 0.08, zFront - 0.08],
      ].map(([x, z], i) => (
        <Beam key={i} a={[x, 0, z]} b={[x, eave, z]} w={0.18} material={m.timber} />
      ))}

      {/* ---- side walls framing ---- */}
      {[x0 + 0.05, x1 - 0.05].map((x) => (
        <group key={x}>
          <Beam a={[x, 0.07, zBack]} b={[x, 0.07, zFront]} w={0.15} material={m.timber} />
          <Beam a={[x, eave - 0.05, zBack]} b={[x, eave - 0.05, zFront]} w={0.15} material={m.timber} />
          <Beam a={[x, 0.1, -1.0]} b={[x, eave, -1.0]} w={0.12} material={m.timber} />
        </group>
      ))}
      <Beam a={[x0 + 0.05, 1.0, zBack]} b={[x0 + 0.05, 1.0, -1.0]} w={0.1} material={m.timber} />

      {/* ---- window: frame, square-set bars, opened shutter ---- */}
      <group>
        <Beam a={[WINDOW.x0 - 0.05, WINDOW.y0 - 0.04, zBack + 0.03]} b={[WINDOW.x1 + 0.05, WINDOW.y0 - 0.04, zBack + 0.03]} w={0.09} d={0.18} material={m.timberMid} />
        <Beam a={[WINDOW.x0 - 0.05, WINDOW.y1 + 0.04, zBack + 0.03]} b={[WINDOW.x1 + 0.05, WINDOW.y1 + 0.04, zBack + 0.03]} w={0.09} d={0.18} material={m.timberMid} />
        <Beam a={[WINDOW.x0 - 0.04, WINDOW.y0 - 0.08, zBack + 0.03]} b={[WINDOW.x0 - 0.04, WINDOW.y1 + 0.08, zBack + 0.03]} w={0.08} d={0.18} material={m.timberMid} />
        <Beam a={[WINDOW.x1 + 0.04, WINDOW.y0 - 0.08, zBack + 0.03]} b={[WINDOW.x1 + 0.04, WINDOW.y1 + 0.08, zBack + 0.03]} w={0.08} d={0.18} material={m.timberMid} />
        {[1 / 3, 2 / 3].map((t) => {
          const x = WINDOW.x0 + (WINDOW.x1 - WINDOW.x0) * t;
          return <Beam key={t} a={[x, WINDOW.y0, zBack + 0.02]} b={[x, WINDOW.y1, zBack + 0.02]} w={0.035} material={m.timberMid} roll={Math.PI / 4} />;
        })}
        {/* shutter hinged on the left, swung open against the wall */}
        <group position={[WINDOW.x0 - 0.08, (WINDOW.y0 + WINDOW.y1) / 2, zBack + 0.1]} rotation-y={-1.25}>
          <Block size={[0.46, 0.42, 0.03]} position={[-0.23, 0, 0]} material={m.plank} />
          <Block size={[0.4, 0.06, 0.035]} position={[-0.23, 0.12, 0.02]} material={m.timberMid} />
          <Block size={[0.4, 0.06, 0.035]} position={[-0.23, -0.12, 0.02]} material={m.timberMid} />
        </group>
      </group>

      {/* ---- door in the right gable (closed plank door) ---- */}
      <group position={[x1 - 0.03, 0, (DOOR.z0 + DOOR.z1) / 2]}>
        <Block size={[0.05, DOOR.height - 0.04, DOOR.z1 - DOOR.z0 - 0.04]} position={[0, DOOR.height / 2 + 0.02, 0]} material={m.plank} />
        {[0.35, 1.35].map((y) => (
          <Block key={y} size={[0.04, 0.1, DOOR.z1 - DOOR.z0 - 0.1]} position={[-0.04, y, 0]} material={m.timberMid} />
        ))}
        {/* jambs and lintel */}
        {[-1, 1].map((sgn) => (
          <Beam key={sgn} a={[-0.05, 0, sgn * ((DOOR.z1 - DOOR.z0) / 2 + 0.06)]} b={[-0.05, DOOR.height + 0.1, sgn * ((DOOR.z1 - DOOR.z0) / 2 + 0.06)]} w={0.12} material={m.timber} />
        ))}
        <Beam a={[-0.05, DOOR.height + 0.06, -(DOOR.z1 - DOOR.z0) / 2 - 0.12]} b={[-0.05, DOOR.height + 0.06, (DOOR.z1 - DOOR.z0) / 2 + 0.12]} w={0.12} material={m.timber} />
        {/* wooden latch */}
        <Block size={[0.04, 0.04, 0.22]} position={[-0.07, 0.95, -0.28]} material={m.timber} />
      </group>

      {/* ---- roof ---- */}
      <RoofSlope side="back" m={m} />
      <RoofSlope side="front" m={m} />
      <Beam a={[x0, ridge - 0.04, ridgeZ]} b={[x1, ridge - 0.04, ridgeZ]} w={0.16} material={m.timber} />
      <Cruck x={-0.2} m={m} />
      <Cruck x={2.4} m={m} />
    </group>
  );
};
