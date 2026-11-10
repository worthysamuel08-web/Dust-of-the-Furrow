/**
 * Furniture and household objects of a poor villein household, c. 1320.
 * Everything is low-poly with deterministic irregularity (seeded) so it looks
 * hand-made but renders identically on every frame.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { seededRandom } from "../../engine/animation";
import { BED, HEARTH, ROOM, SLEEPER } from "./layout";
import type { CottageMaterials } from "./materials";
import { Beam, Block, Lathe } from "./primitives";

const { zBack } = ROOM;

// ---- bed ---------------------------------------------------------------------

/** Lumpy straw mattress: a subdivided box with its top pushed up irregularly. */
const Mattress: React.FC<{ m: CottageMaterials }> = ({ m }) => {
  const geo = useMemo(() => {
    const w = BED.x1 - BED.x0 - 0.1;
    const d = BED.z1 - BED.z0 - 0.06;
    const h = 0.15;
    const g = new THREE.BoxGeometry(w, h, d, 24, 2, 10);
    const p = g.attributes.position;
    const rnd = seededRandom(5);
    const bumps = Array.from({ length: 9 }, () => [(rnd() - 0.5) * w, (rnd() - 0.5) * d, 0.012 + rnd() * 0.02]);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      // rounded, overstuffed edges
      const ex = 1 - Math.pow(Math.abs(x) / (w / 2), 8);
      const ez = 1 - Math.pow(Math.abs(z) / (d / 2), 6);
      if (y > 0) {
        let lift = 0.025 * ex * ez;
        for (const [bx, bz, a] of bumps) lift += a * Math.exp(-((x - bx) ** 2 + (z - bz) ** 2) / 0.05);
        p.setY(i, y + lift);
      } else {
        p.setY(i, y);
      }
      // bulge sides outward a little
      p.setX(i, x * (1 + 0.01 * ez));
      p.setZ(i, z * (1 + 0.04 * (1 - Math.abs(y / h - 0.0))));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh
      geometry={geo}
      position={[(BED.x0 + BED.x1) / 2, BED.mattressTop - 0.1, (BED.z0 + BED.z1) / 2]}
      material={m.tick}
      castShadow
      receiveShadow
    />
  );
};

/** Coarse wool coverlet draped over the legs and hanging over the front and foot. */
const Blanket: React.FC<{ m: CottageMaterials }> = ({ m }) => {
  const geo = useMemo(() => {
    const xa = SLEEPER.x - 0.16;
    const xb = BED.x1 + 0.09;
    const za = BED.z0 - 0.01;
    const zb = BED.z1 + 0.09;
    const g = new THREE.PlaneGeometry(xb - xa, zb - za, 40, 26);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const top = BED.mattressTop + 0.035;
    const rnd = seededRandom(8);
    const folds = Array.from({ length: 5 }, () => [rnd(), 0.6 + rnd() * 1.5, rnd() * 6]);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + (xa + xb) / 2;
      const z = p.getZ(i) + (za + zb) / 2;
      // how far outside the mattress footprint (front edge and foot end)
      const outZ = Math.max(0, z - (BED.z1 - 0.01));
      const outX = Math.max(0, x - (BED.x1 - 0.03));
      const out = Math.max(outZ, outX);
      // ridge where the legs are underneath
      const legs = 0.075 * Math.exp(-(((z - SLEEPER.z) / 0.2) ** 2)) * Math.min(1, (x - xa) / 0.25);
      let fold = 0;
      for (const [ph, fr, o] of folds) fold += 0.008 * Math.sin(x * fr * 6 + o + ph * z * 4);
      let y = top + legs + fold;
      let nx = x;
      let nz = z;
      if (out > 0) {
        // fall over the edge: drop steeply, tuck in towards the frame
        y = top - Math.min(0.13, out * 1.6) + fold;
        nz = outZ > 0 ? BED.z1 + Math.min(0.03, outZ * 0.3) : z;
        nx = outX > 0 ? BED.x1 + Math.min(0.03, outX * 0.3) : x;
      }
      // the turned-back top edge rolls up slightly
      if (x - xa < 0.06) y += 0.02 * (1 - (x - xa) / 0.06);
      p.setXYZ(i, nx - (xa + xb) / 2, y, nz - (za + zb) / 2);
    }
    g.computeVertexNormals();
    return { g, cx: (xa + xb) / 2, cz: (za + zb) / 2 };
  }, []);
  return <mesh geometry={geo.g} position={[geo.cx, 0, geo.cz]} material={m.wool} castShadow receiveShadow />;
};

const Bed: React.FC<{ m: CottageMaterials }> = ({ m }) => {
  const { x0, x1, z0, z1 } = BED;
  return (
    <group>
      {/* corner posts: taller at the head */}
      {[
        [x0 + 0.05, z0 + 0.05, 0.68],
        [x0 + 0.05, z1 - 0.05, 0.68],
        [x1 - 0.05, z0 + 0.05, 0.5],
        [x1 - 0.05, z1 - 0.05, 0.5],
      ].map(([x, z, h], i) => (
        <Beam key={i} a={[x, 0, z]} b={[x, h, z]} w={0.09} material={m.timberMid} roll={i * 0.2} />
      ))}
      {/* side rails and end boards */}
      <Beam a={[x0, 0.3, z1 - 0.05]} b={[x1, 0.3, z1 - 0.05]} w={0.13} d={0.07} material={m.timberMid} />
      <Beam a={[x0, 0.3, z0 + 0.05]} b={[x1, 0.3, z0 + 0.05]} w={0.13} d={0.07} material={m.timberMid} />
      <Block size={[0.05, 0.3, z1 - z0 - 0.1]} position={[x0 + 0.05, 0.5, (z0 + z1) / 2]} material={m.plank} />
      <Block size={[0.05, 0.16, z1 - z0 - 0.1]} position={[x1 - 0.05, 0.36, (z0 + z1) / 2]} material={m.plank} />
      {/* rope-strung base, just visible under the mattress */}
      <Block size={[x1 - x0 - 0.1, 0.03, z1 - z0 - 0.1]} position={[(x0 + x1) / 2, 0.34, (z0 + z1) / 2]} material={m.rope} />
      <Mattress m={m} />
      {/* straw bolster at the head */}
      <mesh position={[x0 + 0.3, BED.mattressTop + 0.025, (z0 + z1) / 2]} rotation-x={Math.PI / 2} scale={[1, 1, 0.55]} material={m.tick} castShadow receiveShadow>
        <capsuleGeometry args={[0.11, (z1 - z0) - 0.35, 4, 10]} />
      </mesh>
      <Blanket m={m} />
    </group>
  );
};

// ---- hearth ----------------------------------------------------------------------

/** Open central hearth on the floor: a ring of stones, ash, charred logs and embers. */
const Hearth: React.FC<{ m: CottageMaterials; ember: number }> = ({ m, ember }) => {
  const stones = useMemo(() => {
    const rnd = seededRandom(19);
    return Array.from({ length: 13 }, (_, i) => {
      const a = (i / 13) * Math.PI * 2 + rnd() * 0.2;
      const r = HEARTH.radius + (rnd() - 0.5) * 0.04;
      return {
        p: [HEARTH.x + Math.cos(a) * r, 0.04, HEARTH.z + Math.sin(a) * r] as [number, number, number],
        s: 0.08 + rnd() * 0.05,
        r: [rnd() * 3, rnd() * 3, rnd() * 3] as [number, number, number],
        dark: rnd() > 0.5,
      };
    });
  }, []);
  const embers = useMemo(() => {
    const rnd = seededRandom(23);
    return Array.from({ length: 14 }, () => ({
      p: [HEARTH.x + (rnd() - 0.5) * 0.4, 0.03 + rnd() * 0.03, HEARTH.z + (rnd() - 0.5) * 0.4] as [number, number, number],
      s: 0.02 + rnd() * 0.025,
      phase: rnd() * 6,
    }));
  }, []);
  const emberMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ff6a1a", toneMapped: false }),
    [],
  );
  emberMat.color.setRGB(1.0 * ember, 0.38 * ember, 0.08 * ember);
  return (
    <group>
      {stones.map((s, i) => (
        <mesh key={i} position={s.p} rotation={s.r} scale={[s.s, s.s * 0.55, s.s]} material={s.dark ? m.stoneDark : m.stone} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
      <mesh position={[HEARTH.x, 0.006, HEARTH.z]} rotation-x={-Math.PI / 2} material={m.ash} receiveShadow>
        <circleGeometry args={[HEARTH.radius - 0.04, 24]} />
      </mesh>
      {[0.3, 1.9, 3.4].map((a, i) => (
        <mesh
          key={i}
          position={[HEARTH.x + Math.cos(a) * 0.08, 0.05, HEARTH.z + Math.sin(a) * 0.08]}
          rotation={[0.08, a, Math.PI / 2]}
          material={m.charcoal}
          castShadow
        >
          <cylinderGeometry args={[0.035, 0.04, 0.42, 6]} />
        </mesh>
      ))}
      {embers.map((e, i) => (
        <mesh key={i} position={e.p} scale={e.s} material={emberMat}>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
      {/* earthenware cooking pot set in the ashes */}
      <Lathe profile={POT} position={[HEARTH.x + 0.2, 0.0, HEARTH.z - 0.15]} material={m.clayDark} />
    </group>
  );
};

// ---- vessels (profiles as module constants: built once) -------------------------
const POT: [number, number][] = [[0, 0], [0.09, 0.01], [0.13, 0.08], [0.12, 0.15], [0.09, 0.19], [0.1, 0.21], [0.085, 0.215]];
const JUG: [number, number][] = [[0, 0], [0.06, 0.0], [0.08, 0.06], [0.075, 0.14], [0.045, 0.2], [0.04, 0.25], [0.05, 0.27], [0.042, 0.272]];
const BOWL: [number, number][] = [[0, 0], [0.05, 0], [0.09, 0.03], [0.1, 0.055], [0.093, 0.056], [0.08, 0.03], [0, 0.015]];
const CUP: [number, number][] = [[0, 0], [0.035, 0], [0.045, 0.08], [0.04, 0.081], [0.03, 0.01], [0, 0.01]];
const BUCKET: [number, number][] = [[0, 0.01], [0.15, 0.0], [0.17, 0.34], [0.16, 0.345], [0.14, 0.03], [0, 0.03]];
const BASKET: [number, number][] = [[0, 0], [0.16, 0.0], [0.22, 0.2], [0.21, 0.205], [0.15, 0.02], [0, 0.02]];

// ---- other furniture ----------------------------------------------------------

const Table: React.FC<{ m: CottageMaterials }> = ({ m }) => {
  const x = 1.15;
  const z = zBack + 0.32;
  return (
    <group>
      <Block size={[1.3, 0.05, 0.42]} position={[x, 0.72, z]} rotation={[0, 0.01, 0.006]} material={m.plank} />
      {[-0.48, 0.48].map((dx) => (
        <group key={dx}>
          <Beam a={[x + dx, 0, z - 0.17]} b={[x + dx, 0.7, z]} w={0.06} material={m.timberMid} />
          <Beam a={[x + dx, 0, z + 0.17]} b={[x + dx, 0.7, z]} w={0.06} material={m.timberMid} />
        </group>
      ))}
      <Beam a={[x - 0.5, 0.3, z]} b={[x + 0.5, 0.3, z]} w={0.05} material={m.timberMid} />
      {/* things on the board */}
      <Lathe profile={JUG} position={[x - 0.42, 0.745, z - 0.04]} material={m.clay} />
      <Lathe profile={BOWL} position={[x - 0.1, 0.745, z + 0.04]} material={m.timberMid} />
      <Lathe profile={CUP} position={[x + 0.08, 0.745, z - 0.08]} material={m.timberMid} />
      <mesh position={[x + 0.33, 0.79, z + 0.02]} scale={[0.11, 0.06, 0.08]} material={m.bread} castShadow>
        <sphereGeometry args={[1, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <Beam a={[x - 0.02, 0.755, z + 0.13]} b={[x + 0.18, 0.755, z + 0.1]} w={0.015} material={m.timberMid} />
    </group>
  );
};

const Stool: React.FC<{ m: CottageMaterials; position: [number, number, number] }> = ({ m, position }) => (
  <group position={position} rotation-y={0.4}>
    <mesh position-y={0.42} material={m.plank} castShadow receiveShadow>
      <cylinderGeometry args={[0.17, 0.17, 0.05, 14]} />
    </mesh>
    {[0, 2.1, 4.2].map((a) => (
      <Beam key={a} a={[Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2]} b={[Math.cos(a) * 0.09, 0.41, Math.sin(a) * 0.09]} w={0.04} material={m.timberMid} />
    ))}
  </group>
);

const Coffer: React.FC<{ m: CottageMaterials }> = ({ m }) => (
  <group position={[-0.1, 0, zBack + 0.3]} rotation-y={-0.04}>
    <Block size={[0.62, 0.38, 0.4]} position={[0, 0.25, 0]} material={m.plank} />
    <Block size={[0.66, 0.05, 0.43]} position={[0, 0.465, 0]} material={m.timberMid} />
    {/* stile legs */}
    {[-0.29, 0.29].map((x) => (
      <Block key={x} size={[0.07, 0.48, 0.42]} position={[x, 0.24, 0]} material={m.timberMid} />
    ))}
    {/* iron hasp */}
    <Block size={[0.05, 0.1, 0.01]} position={[0, 0.4, 0.206]} material={m.iron} />
  </group>
);

const Tools: React.FC<{ m: CottageMaterials }> = ({ m }) => (
  <group>
    {/* wooden spade with an iron-shod edge, leaning by the door */}
    <group position={[ROOM.x1 - 0.12, 0, 0.25]} rotation={[0.0, 0, 0.12]}>
      <Beam a={[0, 0.3, 0]} b={[0, 1.35, 0]} w={0.035} material={m.timberMid} />
      <Block size={[0.04, 0.32, 0.18]} position={[0, 0.17, 0]} material={m.plank} />
      <Block size={[0.045, 0.04, 0.19]} position={[0, 0.02, 0]} material={m.iron} />
    </group>
    {/* sickle on a peg above the table */}
    <group position={[1.95, 1.35, zBack + 0.06]}>
      <Beam a={[0, 0.06, -0.04]} b={[0, 0.06, 0.08]} w={0.025} material={m.timber} />
      <mesh position={[0, -0.05, 0.03]} rotation={[0, 0, 0.6]} material={m.iron} castShadow>
        <torusGeometry args={[0.13, 0.012, 4, 16, Math.PI * 1.2]} />
      </mesh>
      <Beam a={[0.02, 0.05, 0.03]} b={[0.05, -0.12, 0.03]} w={0.03} material={m.timberMid} />
    </group>
    {/* hooded cloak hanging on a peg at the foot of the bed */}
    <group position={[-0.45, 1.5, zBack + 0.06]}>
      <Beam a={[0, 0.05, -0.04]} b={[0, 0.05, 0.1]} w={0.03} material={m.timber} />
      <mesh position={[0, -0.38, 0.06]} scale={[1, 1, 0.3]} material={m.cloak} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.17, 0.72, 9]} />
      </mesh>
      {/* hood hanging down the back */}
      <mesh position={[0, -0.03, 0.08]} scale={[1, 1.2, 0.45]} material={m.cloak} castShadow>
        <coneGeometry args={[0.08, 0.16, 8]} />
      </mesh>
    </group>
    {/* drying herbs and onions hung from the wall plate */}
    {[0.4, 0.62, 0.84, 1.55].map((x, i) => (
      <group key={x} position={[x, ROOM.eave - 0.12, zBack + 0.16]}>
        <Beam a={[0, 0, 0]} b={[0, -0.18, 0]} w={0.008} material={m.rope} cast={false} />
        <mesh position-y={-0.28} rotation-x={Math.PI} material={i === 3 ? m.onion : m.herbs} castShadow>
          <coneGeometry args={[0.06, 0.2, 6]} />
        </mesh>
      </group>
    ))}
    {/* staved water bucket and a wicker basket */}
    <Lathe profile={BUCKET} position={[ROOM.x1 - 0.45, 0, 1.75]} material={m.plank} segments={12} />
    <Lathe profile={BASKET} position={[1.75, 0, -0.55]} material={m.wicker} segments={14} />
    {/* pitcher of water beside the bed */}
    <Lathe profile={JUG} position={[-0.5, 0, -1.05]} material={m.clay} scale={1.2} />
  </group>
);

export const Furnishings: React.FC<{ m: CottageMaterials; ember: number }> = ({ m, ember }) => (
  <group>
    <Bed m={m} />
    <Hearth m={m} ember={ember} />
    <Table m={m} />
    <Stool m={m} position={[1.75, 0, 0.95]} />
    <Coffer m={m} />
    <Tools m={m} />
  </group>
);
