/**
 * Animals (flat 2D silhouettes, like the cast) and small 3D set dressing.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { Fill, Stroke, ellipsePts, smoothClosed, type P2 } from "../../characters/stickman/shapes2d";
import { Stook } from "../../environments/outdoor/Fields";
import { flat } from "../../environments/outdoor/sky";

export type AnimalKind = "pig" | "cow" | "ox" | "sheep" | "hen" | "hare" | "goose" | "pigeons";

const mat = (c: string) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, toneMapped: false });

/** A flat animal silhouette in its own plane; faces +X; feet at y = 0. */
export const Animal: React.FC<{ kind: AnimalKind; frame: number; seed?: number; walking?: boolean; rim?: string }> = ({ kind, frame, seed = 0, walking, rim = "#ffb35c" }) => {
  const m = useMemo(() => ({ black: mat("#121014"), white: mat("#ece6d8"), red: mat("#b8321f"), orange: mat("#e0902a"), rim: mat(rim) }), [rim]);
  const step = walking ? Math.sin(frame * 0.35 + seed) : 0;
  const bob = walking ? Math.abs(Math.sin(frame * 0.35 + seed)) * 0.02 : Math.sin(frame * 0.05 + seed) * 0.005;
  const legs = (xs: number[], top: number, len: number, w: number, color = m.black) =>
    xs.map((x, i) => {
      const sw = (i % 2 ? 1 : -1) * step * 0.12;
      return <Stroke key={i} pts={[[x, top], [x + sw, top - len]]} width={w} material={color} />;
    });
  const body = (pts: P2[], color = m.black) => (
    <group>
      <group position={[-0.015, 0.015, -0.01]}>
        <Fill pts={pts} material={m.rim} />
      </group>
      <Fill pts={pts} material={color} />
    </group>
  );
  switch (kind) {
    case "pig":
      return (
        <group position-y={bob}>
          {legs([-0.22, -0.12, 0.14, 0.24], 0.3, 0.3, 0.06)}
          {body(ellipsePts(0, 0.42, 0.42, 0.22, 24))}
          <Fill pts={ellipsePts(0.42, 0.44, 0.16, 0.13, 16)} material={m.black} />
          <Fill pts={ellipsePts(0.57, 0.42, 0.05, 0.05, 10)} material={m.black} />
          <Fill pts={[[0.36, 0.54], [0.46, 0.66], [0.47, 0.52]]} material={m.black} />
          <Fill pts={ellipsePts(0.47, 0.48, 0.022, 0.026, 8)} material={m.white} z={0.002} />
          <Stroke pts={[[-0.42, 0.46], [-0.5, 0.52], [-0.46, 0.58]]} width={0.025} material={m.black} />
        </group>
      );
    case "cow":
    case "ox": {
      const s = kind === "ox" ? 1.15 : 1;
      return (
        <group scale={s} position-y={bob}>
          {legs([-0.5, -0.36, 0.34, 0.48], 0.75, 0.75, 0.08)}
          {body(smoothClosed([[-0.66, 0.78], [-0.62, 1.2], [0.5, 1.22], [0.62, 0.9], [0.5, 0.74], [-0.5, 0.72]], 2))}
          <Fill pts={smoothClosed([[0.5, 1.15], [0.78, 1.2], [0.9, 0.95], [0.72, 0.86], [0.55, 0.95]], 2)} material={m.black} />
          <Stroke pts={[[0.66, 1.18], [0.6, 1.32], [0.5, 1.36]]} width={0.04} material={m.black} />
          <Fill pts={ellipsePts(0.78, 1.08, 0.028, 0.034, 8)} material={m.white} z={0.002} />
          <Stroke pts={[[-0.64, 1.1], [-0.76, 0.9], [-0.74, 0.7]]} width={0.04} material={m.black} />
        </group>
      );
    }
    case "sheep":
      return (
        <group position-y={bob}>
          {legs([-0.2, -0.1, 0.12, 0.22], 0.35, 0.35, 0.05)}
          <Fill pts={smoothClosed([[-0.38, 0.4], [-0.36, 0.72], [-0.1, 0.8], [0.2, 0.78], [0.38, 0.65], [0.36, 0.38], [0.0, 0.32]], 2)} material={m.white} />
          <Fill pts={ellipsePts(0.42, 0.66, 0.12, 0.09, 12, -0.3)} material={m.black} z={0.002} />
          <Fill pts={ellipsePts(0.45, 0.68, 0.018, 0.022, 8)} material={m.white} z={0.003} />
        </group>
      );
    case "hen":
      return (
        <group position-y={bob} scale={0.9}>
          {legs([-0.02, 0.04], 0.12, 0.12, 0.02, m.orange)}
          {body(smoothClosed([[-0.16, 0.18], [-0.2, 0.34], [0.06, 0.3], [0.14, 0.4], [0.2, 0.34], [0.14, 0.14], [0.0, 0.1]], 2))}
          <Fill pts={[[0.12, 0.42], [0.16, 0.47], [0.2, 0.42]]} material={m.red} z={0.002} />
          <Fill pts={[[0.2, 0.36], [0.26, 0.35], [0.2, 0.33]]} material={m.orange} z={0.002} />
        </group>
      );
    case "hare":
      return (
        <group position-y={bob}>
          {body(smoothClosed([[-0.25, 0.05], [-0.28, 0.2], [0.05, 0.26], [0.22, 0.18], [0.24, 0.05], [0.0, 0.0]], 2))}
          <Fill pts={ellipsePts(0.25, 0.25, 0.08, 0.07, 12)} material={m.black} />
          <Fill pts={ellipsePts(0.2, 0.42, 0.025, 0.12, 10, 0.25)} material={m.black} />
          <Fill pts={ellipsePts(0.25, 0.42, 0.025, 0.12, 10, -0.15)} material={m.black} />
          <Fill pts={ellipsePts(0.28, 0.27, 0.015, 0.018, 8)} material={m.white} z={0.002} />
        </group>
      );
    case "goose":
      return (
        <group position-y={bob}>
          {legs([-0.02, 0.06], 0.14, 0.14, 0.025, m.orange)}
          <Fill pts={smoothClosed([[-0.3, 0.22], [-0.28, 0.4], [0.12, 0.38], [0.18, 0.62], [0.24, 0.6], [0.2, 0.3], [0.05, 0.14]], 2)} material={m.white} />
          <Fill pts={[[0.24, 0.6], [0.34, 0.57], [0.24, 0.55]]} material={m.orange} z={0.002} />
        </group>
      );
    case "pigeons":
      return (
        <group>
          {Array.from({ length: 14 }, (_, i) => {
            const t = frame * 0.03 + i * 0.7 + seed;
            const x = Math.sin(t) * 3 + (i % 5) * 0.8;
            const y = 1.5 + Math.cos(t * 1.3) * 0.8 + (i % 3) * 0.4;
            const flap = Math.sin(frame * 0.9 + i) * 0.08;
            return (
              <group key={i} position={[x, y, (i % 4) * 0.3]}>
                <Fill pts={[[-0.18, flap], [0, 0.02], [0.18, flap], [0.05, -0.03], [-0.05, -0.03]]} material={m.black} />
              </group>
            );
          })}
        </group>
      );
  }
};

// ---- 3D set dressing ----------------------------------------------------------------
export type DressingKind = "cradle" | "stool" | "pot" | "quern" | "hurdles" | "cart" | "sack" | "stook" | "candle" | "bench";

export const Dressing: React.FC<{ kind: DressingKind }> = ({ kind }) => {
  switch (kind) {
    case "cradle":
      return (
        <group>
          <mesh position-y={0.22} material={flat("#5a4236")} castShadow>
            <boxGeometry args={[0.8, 0.3, 0.45]} />
          </mesh>
          <mesh position-y={0.39} material={flat("#d8cdb8")}>
            <boxGeometry args={[0.7, 0.05, 0.38]} />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation-x={Math.PI / 2} material={flat("#3a2b26")}>
            <torusGeometry args={[0.38, 0.03, 4, 12, Math.PI]} />
          </mesh>
        </group>
      );
    case "stool":
      return (
        <group>
          <mesh position-y={0.44} material={flat("#5a4236")} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.06, 12]} />
          </mesh>
          {[0, 2.1, 4.2].map((a) => (
            <mesh key={a} position={[Math.cos(a) * 0.13, 0.21, Math.sin(a) * 0.13]} material={flat("#3a2b26")}>
              <cylinderGeometry args={[0.025, 0.03, 0.42, 5]} />
            </mesh>
          ))}
        </group>
      );
    case "pot":
      return (
        <mesh position-y={0.18} material={flat("#5a3a2e")} castShadow>
          <sphereGeometry args={[0.22, 12, 8]} />
        </mesh>
      );
    case "quern":
      return (
        <group>
          <mesh position-y={0.06} material={flat("#6a6470")} castShadow>
            <cylinderGeometry args={[0.25, 0.27, 0.1, 14]} />
          </mesh>
          <mesh position-y={0.15} material={flat("#7a7480")} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.08, 14]} />
          </mesh>
        </group>
      );
    case "hurdles":
      return (
        <group>
          {[-1.5, 0, 1.5].map((x) => (
            <mesh key={x} position={[x, 0.5, 0]} material={flat("#6a5440")} castShadow>
              <boxGeometry args={[1.45, 0.9, 0.06]} />
            </mesh>
          ))}
          {[-1.5, 1.5].map((x) => (
            <mesh key={`s${x}`} position={[x * 1.5, 0.5, 1.2]} rotation-y={Math.PI / 2} material={flat("#6a5440")} castShadow>
              <boxGeometry args={[2.4, 0.9, 0.06]} />
            </mesh>
          ))}
        </group>
      );
    case "cart":
      return (
        <group>
          <mesh position-y={0.9} material={flat("#5a4236")} castShadow>
            <boxGeometry args={[2.4, 0.5, 1.3]} />
          </mesh>
          {[-0.75, 0.75].map((z) => (
            <mesh key={z} position={[0, 0.55, z]} material={flat("#3a2b26")} castShadow>
              <torusGeometry args={[0.55, 0.06, 5, 14]} />
            </mesh>
          ))}
          <mesh position={[1.8, 0.75, 0]} rotation-z={0.15} material={flat("#3a2b26")}>
            <boxGeometry args={[1.6, 0.08, 0.08]} />
          </mesh>
        </group>
      );
    case "sack":
      return (
        <mesh position-y={0.32} scale={[0.32, 0.38, 0.28]} material={flat("#8a7452")} castShadow>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
      );
    case "stook":
      return <Stook position={[0, 0, 0]} />;
    case "candle":
      return (
        <mesh position-y={0.1} material={flat("#e8dcc0")}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
        </mesh>
      );
    case "bench":
      return (
        <mesh position-y={0.45} material={flat("#4a372c")} castShadow>
          <boxGeometry args={[2, 0.1, 0.4]} />
        </mesh>
      );
  }
};
