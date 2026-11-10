/** Low-poly, flat-shaded medieval buildings and village furniture. */
import { useMemo } from "react";
import * as THREE from "three";
import { seededRandom } from "../../engine/animation";
import { flat } from "./sky";

type V3 = [number, number, number];

/** Triangular prism roof (thatch or stone slates), ridge along local X. */
export const Roof: React.FC<{ w: number; d: number; h: number; y: number; color: string; overhang?: number }> = ({ w, d, h, y, color, overhang = 0.35 }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const hd = d / 2 + overhang;
    s.moveTo(-hd, 0);
    s.lineTo(hd, 0);
    s.lineTo(0, h);
    s.lineTo(-hd, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: w + overhang * 2, bevelEnabled: false });
    g.translate(0, 0, -(w + overhang * 2) / 2);
    g.rotateY(Math.PI / 2);
    return g;
  }, [w, d, h, overhang]);
  return <mesh geometry={geo} position-y={y} material={flat(color, THREE.DoubleSide)} castShadow receiveShadow />;
};

/** A cottage facing +Z: daub walls, timber posts, thatch, door, glowing windows. */
export const House: React.FC<{
  position: V3;
  rotationY?: number;
  w?: number;
  d?: number;
  wall?: string;
  roof?: string;
  windowMat: THREE.Material;
  doorGlow?: boolean;
}> = ({ position, rotationY = 0, w = 6, d = 4, wall = "#b39c88", roof = "#5c4634", windowMat, doorGlow }) => {
  const eave = 2.3;
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position-y={eave / 2} material={flat(wall)} castShadow receiveShadow>
        <boxGeometry args={[w, eave, d]} />
      </mesh>
      <Roof w={w} d={d} h={2.4} y={eave} color={roof} />
      {/* timber framing on the front */}
      {[-w / 2 + 0.1, -w / 6, w / 6, w / 2 - 0.1].map((x) => (
        <mesh key={x} position={[x, eave / 2, d / 2 + 0.02]} material={flat("#3a2b26")}>
          <boxGeometry args={[0.16, eave, 0.06]} />
        </mesh>
      ))}
      <mesh position={[0, eave - 0.1, d / 2 + 0.03]} material={flat("#3a2b26")}>
        <boxGeometry args={[w, 0.16, 0.06]} />
      </mesh>
      {/* door */}
      <mesh position={[-w / 4, 0.85, d / 2 + 0.04]} material={doorGlow ? windowMat : flat("#4a3428")}>
        <boxGeometry args={[0.9, 1.7, 0.04]} />
      </mesh>
      {/* small window */}
      <mesh position={[w / 4 + 0.2, 1.35, d / 2 + 0.04]} material={windowMat}>
        <boxGeometry args={[0.6, 0.45, 0.03]} />
      </mesh>
    </group>
  );
};

export const Fence: React.FC<{ from: [number, number]; to: [number, number] }> = ({ from, to }) => {
  const posts = useMemo(() => {
    const n = Math.max(2, Math.round(Math.hypot(to[0] - from[0], to[1] - from[1]) / 1.6));
    return Array.from({ length: n + 1 }, (_, i) => [from[0] + ((to[0] - from[0]) * i) / n, from[1] + ((to[1] - from[1]) * i) / n] as [number, number]);
  }, [from, to]);
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const m = flat("#4a372c");
  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.5, z]} material={m} castShadow>
          <boxGeometry args={[0.09, 1.0, 0.09]} />
        </mesh>
      ))}
      {[0.45, 0.85].map((y) => (
        <mesh key={y} position={[(from[0] + to[0]) / 2, y, (from[1] + to[1]) / 2]} rotation-y={-ang} material={m}>
          <boxGeometry args={[len, 0.06, 0.05]} />
        </mesh>
      ))}
    </group>
  );
};

export const Well: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position-y={0.4} material={flat("#7a7280")} castShadow receiveShadow>
      <cylinderGeometry args={[0.85, 0.9, 0.8, 14, 1, true]} />
    </mesh>
    <mesh position-y={0.79} rotation-x={-Math.PI / 2} material={flat("#151824")}>
      <circleGeometry args={[0.8, 14]} />
    </mesh>
    {[-0.9, 0.9].map((x) => (
      <mesh key={x} position={[x, 1.1, 0]} material={flat("#3a2b26")} castShadow>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
      </mesh>
    ))}
    <mesh position={[0, 1.85, 0]} rotation-z={Math.PI / 2} material={flat("#4a372c")}>
      <cylinderGeometry args={[0.08, 0.08, 1.9, 8]} />
    </mesh>
    <Roof w={2.0} d={1.6} h={0.6} y={2.15} color="#4c3a2c" overhang={0.15} />
  </group>
);

export const Church: React.FC<{ position: V3; windowMat: THREE.Material }> = ({ position, windowMat }) => {
  const stone = "#8c8494";
  return (
    <group position={position}>
      {/* nave */}
      <mesh position={[0, 3, 0]} material={flat(stone)} castShadow receiveShadow>
        <boxGeometry args={[14, 6, 7]} />
      </mesh>
      <Roof w={14} d={7} h={3.6} y={6} color="#5a5260" overhang={0.2} />
      {/* west tower */}
      <mesh position={[-9.5, 7, 0]} material={flat("#837b8c")} castShadow receiveShadow>
        <boxGeometry args={[5, 14, 5]} />
      </mesh>
      {[-1.8, 0, 1.8].map((x) => (
        <mesh key={x} position={[-9.5 + x, 14.4, 2.3]} material={flat("#837b8c")}>
          <boxGeometry args={[0.9, 0.8, 0.5]} />
        </mesh>
      ))}
      {/* south door and porch */}
      <mesh position={[2, 1.4, 3.6]} material={flat("#2c2024")}>
        <boxGeometry args={[1.4, 2.8, 0.1]} />
      </mesh>
      <mesh position={[2, 2.9, 3.62]} rotation-z={Math.PI / 4} material={flat("#2c2024")}>
        <boxGeometry args={[0.99, 0.99, 0.1]} />
      </mesh>
      {/* lancet windows */}
      {[-4.5, -1, 5].map((x) => (
        <mesh key={x} position={[x, 3.4, 3.53]} material={windowMat}>
          <boxGeometry args={[0.45, 1.7, 0.04]} />
        </mesh>
      ))}
      {/* scratch dial beside the door */}
      <group position={[3.6, 2.2, 3.53]}>
        <mesh material={flat("#a59eac")}>
          <circleGeometry args={[0.32, 18]} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => {
          const a = Math.PI + (i / 6) * Math.PI;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.01]} rotation-z={a} material={flat("#3e3842")}>
              <boxGeometry args={[0.3, 0.018, 0.01]} />
            </mesh>
          );
        })}
        <mesh position={[0, 0, 0.04]} rotation-x={Math.PI / 2} material={flat("#2a2428")}>
          <cylinderGeometry args={[0.015, 0.015, 0.1, 6]} />
        </mesh>
      </group>
    </group>
  );
};

export const Grave: React.FC<{ position: V3; small?: boolean }> = ({ position, small }) => {
  const s = small ? 0.6 : 1;
  return (
    <group position={position} scale={s}>
      <mesh position-y={0.08} scale={[0.55, 0.16, 1.1]} material={flat("#4a3d3a")} receiveShadow>
        <sphereGeometry args={[1, 10, 6]} />
      </mesh>
      <mesh position={[0, 0.55, -0.9]} material={flat("#3a2b26")} castShadow>
        <boxGeometry args={[0.1, 1.1, 0.1]} />
      </mesh>
      <mesh position={[0, 0.8, -0.9]} material={flat("#3a2b26")} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.1]} />
      </mesh>
    </group>
  );
};

export const ManorHouse: React.FC<{ position: V3; windowMat: THREE.Material }> = ({ position, windowMat }) => (
  <group position={position}>
    <mesh position={[0, 3.6, 0]} material={flat("#9a8f98")} castShadow receiveShadow>
      <boxGeometry args={[16, 7.2, 8]} />
    </mesh>
    <Roof w={16} d={8} h={4.2} y={7.2} color="#4a4252" overhang={0.3} />
    {[-5, -1.5, 2, 5.5].map((x) => (
      <mesh key={x} position={[x, 4.2, 4.03]} material={windowMat}>
        <boxGeometry args={[0.7, 1.6, 0.04]} />
      </mesh>
    ))}
    <mesh position={[0, 1.4, 4.03]} material={flat("#2c2024")}>
      <boxGeometry args={[1.6, 2.8, 0.06]} />
    </mesh>
    {/* banner */}
    <mesh position={[7.8, 9.5, 0]} material={flat("#2a2024")}>
      <boxGeometry args={[0.1, 5, 0.1]} />
    </mesh>
    <mesh position={[8.6, 11.2, 0]} material={flat("#7a1f2a", THREE.DoubleSide)}>
      <planeGeometry args={[1.6, 1.0]} />
    </mesh>
  </group>
);

export const WallWithGate: React.FC<{ x0: number; x1: number; z: number; gateX: number }> = ({ x0, x1, z, gateX }) => {
  const m = flat("#867c88");
  const segs: [number, number][] = [
    [x0, gateX - 1.6],
    [gateX + 1.6, x1],
  ];
  return (
    <group>
      {segs.map(([a, b]) => (
        <mesh key={a} position={[(a + b) / 2, 1.1, z]} material={m} castShadow receiveShadow>
          <boxGeometry args={[b - a, 2.2, 0.5]} />
        </mesh>
      ))}
      {[gateX - 1.7, gateX + 1.7].map((x) => (
        <mesh key={x} position={[x, 1.6, z]} material={flat("#7a7080")} castShadow>
          <boxGeometry args={[0.6, 3.2, 0.7]} />
        </mesh>
      ))}
      <mesh position={[gateX - 0.9, 1.1, z + 0.6]} rotation-y={0.9} material={flat("#3e2c24")} castShadow>
        <boxGeometry args={[1.6, 2.1, 0.12]} />
      </mesh>
    </group>
  );
};

export const Dovecote: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position-y={2.2} material={flat("#9a9098")} castShadow receiveShadow>
      <cylinderGeometry args={[2, 2.1, 4.4, 16]} />
    </mesh>
    <mesh position-y={5.3} material={flat("#4a4252")} castShadow>
      <coneGeometry args={[2.4, 1.8, 16]} />
    </mesh>
    <mesh position-y={6.4} material={flat("#4a4252")}>
      <cylinderGeometry args={[0.35, 0.35, 0.6, 8]} />
    </mesh>
    {Array.from({ length: 10 }, (_, i) => (
      <mesh key={i} position={[Math.cos((i / 10) * Math.PI * 2) * 2.02, 3.4, Math.sin((i / 10) * Math.PI * 2) * 2.02]} rotation-y={-(i / 10) * Math.PI * 2 + Math.PI / 2} material={flat("#2a2228")}>
        <boxGeometry args={[0.25, 0.25, 0.05]} />
      </mesh>
    ))}
  </group>
);

export const Mill: React.FC<{ position: V3; frame: number }> = ({ position, frame }) => (
  <group position={position}>
    <mesh position-y={2.4} material={flat("#7a6656")} castShadow receiveShadow>
      <boxGeometry args={[6, 4.8, 5]} />
    </mesh>
    <Roof w={6} d={5} h={2.6} y={4.8} color="#4e3c30" />
    <mesh position={[0, 1.0, 2.53]} material={flat("#2c2024")}>
      <boxGeometry args={[1.2, 2.0, 0.05]} />
    </mesh>
    {/* water wheel */}
    <group position={[3.4, 1.8, 0]} rotation-x={-frame * 0.02}>
      <mesh rotation-z={Math.PI / 2} material={flat("#3e2c24")} castShadow>
        <torusGeometry args={[2, 0.12, 6, 20]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} rotation-x={(i / 8) * Math.PI} material={flat("#3e2c24")}>
          <boxGeometry args={[0.15, 4, 0.15]} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={`p${i}`} position={[0, Math.cos((i / 12) * Math.PI * 2) * 2, Math.sin((i / 12) * Math.PI * 2) * 2]} rotation-x={(i / 12) * Math.PI * 2} material={flat("#4e3a2e")}>
          <boxGeometry args={[0.6, 0.06, 0.5]} />
        </mesh>
      ))}
    </group>
  </group>
);

export const Smithy: React.FC<{ position: V3; glow: THREE.Material }> = ({ position, glow }) => (
  <group position={position}>
    {[-2, 2].map((x) =>
      [-1.6, 1.6].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 1.3, z]} material={flat("#3a2b26")} castShadow>
          <boxGeometry args={[0.18, 2.6, 0.18]} />
        </mesh>
      )),
    )}
    <Roof w={4.6} d={3.8} h={1.4} y={2.6} color="#4e3c30" />
    <mesh position={[0, 0.5, -1.2]} material={flat("#5c5460")} castShadow>
      <boxGeometry args={[1.6, 1.0, 1.0]} />
    </mesh>
    <mesh position={[0, 1.02, -1.2]} rotation-x={-Math.PI / 2} material={glow}>
      <circleGeometry args={[0.4, 12]} />
    </mesh>
    <mesh position={[1.2, 0.55, 0.3]} material={flat("#2a2629")} castShadow>
      <boxGeometry args={[0.5, 0.3, 0.25]} />
    </mesh>
    <mesh position={[1.2, 0.25, 0.3]} material={flat("#3a2b26")}>
      <cylinderGeometry args={[0.18, 0.22, 0.5, 8]} />
    </mesh>
  </group>
);

export const AleStake: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1.5, 0]} rotation-z={0.7} material={flat("#3a2b26")} castShadow>
      <boxGeometry args={[0.1, 3, 0.1]} />
    </mesh>
    <mesh position={[1.1, 2.6, 0]} material={flat("#3f5a34")} castShadow>
      <icosahedronGeometry args={[0.45, 0]} />
    </mesh>
  </group>
);

export const Byre: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    {[-1.5, 1.5].map((x) => (
      <mesh key={x} position={[x, 1.0, 1.2]} material={flat("#3a2b26")} castShadow>
        <boxGeometry args={[0.14, 2.0, 0.14]} />
      </mesh>
    ))}
    <mesh position={[0, 1.0, -1]} material={flat("#6a5a50")} castShadow receiveShadow>
      <boxGeometry args={[3.2, 2.0, 0.15]} />
    </mesh>
    <mesh position={[0, 2.05, 0.1]} rotation-x={-0.25} material={flat("#4e3c30")} castShadow>
      <boxGeometry args={[3.6, 0.12, 2.8]} />
    </mesh>
    {/* the empty tether ring and dangling rope */}
    <mesh position={[0.4, 1.3, -0.88]} material={flat("#2a2629")}>
      <torusGeometry args={[0.08, 0.02, 4, 10]} />
    </mesh>
    <mesh position={[0.4, 0.95, -0.85]} material={flat("#6d5a3c")}>
      <cylinderGeometry args={[0.015, 0.015, 0.7, 4]} />
    </mesh>
  </group>
);

/** Scattered huts in the distance (a village or town silhouette). */
export const DistantRoofs: React.FC<{ center: [number, number]; count: number; spread: number; seed: number; spire?: boolean; walls?: boolean }> = ({ center, count, spread, seed, spire, walls }) => {
  const items = useMemo(() => {
    const rnd = seededRandom(seed);
    return Array.from({ length: count }, () => ({ x: center[0] + (rnd() - 0.5) * spread, z: center[1] + (rnd() - 0.5) * spread * 0.3, s: 0.8 + rnd() * 0.6 }));
  }, [center, count, spread, seed]);
  const m = flat("#2e2632");
  return (
    <group>
      {items.map((h, i) => (
        <group key={i} position={[h.x, 0, h.z]} scale={h.s}>
          <mesh position-y={1.2} material={m}>
            <boxGeometry args={[4, 2.4, 3]} />
          </mesh>
          <mesh position-y={3.0} rotation-y={Math.PI / 4} material={m}>
            <coneGeometry args={[2.8, 1.6, 4]} />
          </mesh>
        </group>
      ))}
      {spire ? (
        <group position={[center[0], 0, center[1]]}>
          <mesh position-y={7} material={m}>
            <boxGeometry args={[4, 14, 4]} />
          </mesh>
          <mesh position-y={18} material={m}>
            <coneGeometry args={[2.6, 9, 4]} />
          </mesh>
        </group>
      ) : null}
      {walls ? (
        <mesh position={[center[0], 2.5, center[1] + spread * 0.18]} material={m}>
          <boxGeometry args={[spread * 1.1, 5, 1.5]} />
        </mesh>
      ) : null}
    </group>
  );
};

export type { V3 };
