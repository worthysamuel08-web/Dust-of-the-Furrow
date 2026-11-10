/**
 * The village of Ashcombe (fictional), c. 1320. Street along X at z≈0; the
 * camera works from +Z looking towards -Z. Anchors for scenes are in VILLAGE.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { AleStake, Byre, Church, Dovecote, Fence, Grave, House, ManorHouse, Mill, Smithy, Well, WallWithGate } from "./buildings";
import { Atmosphere, Horizon, SkyDome, Stars, SunLight, TIMES, flat, glowMat, useWindowGlow, type TimeOfDay } from "./sky";

/** Where things are, for placing actors and cameras. */
export const VILLAGE = {
  street: { z: 0 },
  well: { x: 0, z: -2.2 },
  alehouseDoor: { x: 11.5, z: -5.6 },
  aleStake: { x: 13.5, z: -5 },
  churchDoor: { x: -42, z: -9.8 },
  scratchDial: { x: -40.4, y: 2.2, z: -10.4 },
  churchyard: { x: -48, z: -5 },
  manorGate: { x: 30, z: -10.4 },
  dovecote: { x: 19, z: -13 },
  mill: { x: 46, z: -6 },
  smithy: { x: -13, z: -7 },
  johnsByre: { x: -1, z: -7.2 },
  emmasHouse: { x: 5, z: -8 },
} as const;

const BACK_ROW = [
  { x: -30, wall: "#b49c8a" },
  { x: -21, wall: "#a99482" },
  { x: -5, wall: "#ad9a8c" },
  { x: 5, wall: "#b6a08c" },
  { x: 12, wall: "#a8907c" },
  { x: 22, wall: "#b39c88" },
];
const FRONT_ROW = [-26, -10, 8, 26];

export const Village: React.FC<{ time: TimeOfDay; frame: number; center: [number, number, number] }> = ({ time, frame, center }) => {
  const t = TIMES[time];
  const win = useWindowGlow(t.glow);
  const forge = glowMat("forge");
  forge.color.set("#ff7a33").multiplyScalar(1.2 + 0.25 * Math.sin(frame * 0.4));
  const exclude = useMemo(() => (x: number, z: number) => Math.abs(z) < 30 && Math.abs(x) < 60, []);
  return (
    <group>
      <Atmosphere t={t} />
      <SkyDome t={t} />
      {t.stars ? <Stars /> : null}
      <SunLight t={t} center={center} />
      <Horizon t={t} exclude={exclude} />
      {/* ground, green and street */}
      <mesh rotation-x={-Math.PI / 2} material={flat(t.ground)} receiveShadow>
        <planeGeometry args={[400, 400]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -3.5]} material={flat(new THREE.Color(t.ground).lerp(new THREE.Color("#4f6a3c"), 0.45).getStyle())} receiveShadow>
        <planeGeometry args={[120, 9]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0.5]} material={flat(new THREE.Color(t.ground).lerp(new THREE.Color("#8a7458"), 0.4).getStyle())} receiveShadow>
        <planeGeometry args={[120, 4.5]} />
      </mesh>
      {BACK_ROW.map((h) => (
        <House key={h.x} position={[h.x, 0, -10]} wall={h.wall} windowMat={win} doorGlow={t.glow > 0.9} />
      ))}
      {FRONT_ROW.map((x) => (
        <House key={x} position={[x, 0, 12]} rotationY={Math.PI} windowMat={win} />
      ))}
      <Fence from={[-36, -6.2]} to={[-24, -6.2]} />
      <Fence from={[-9, -6.2]} to={[-3, -6.2]} />
      <Fence from={[16, -6.2]} to={[26, -6.2]} />
      <Well position={[VILLAGE.well.x, 0, VILLAGE.well.z]} />
      <AleStake position={[VILLAGE.aleStake.x, 0, VILLAGE.aleStake.z]} />
      <Byre position={[VILLAGE.johnsByre.x, 0, VILLAGE.johnsByre.z]} />
      <Smithy position={[VILLAGE.smithy.x, 0, VILLAGE.smithy.z]} glow={forge} />
      <Church position={[-44, 0, -14]} windowMat={win} />
      {[[-50, -6], [-46.5, -5.2], [-53, -4.5], [-37, -6.5], [-39.5, -5]].map(([x, z], i) => (
        <Grave key={i} position={[x, 0, z]} small={i >= 3} />
      ))}
      <WallWithGate x0={20} x1={42} z={-11} gateX={30} />
      <ManorHouse position={[31, 0, -20]} windowMat={win} />
      <Dovecote position={[VILLAGE.dovecote.x, 0, VILLAGE.dovecote.z]} />
      <Mill position={[VILLAGE.mill.x, 0, VILLAGE.mill.z]} frame={frame} />
      <mesh rotation-x={-Math.PI / 2} position={[52, 0.03, 0]} material={flat("#3e4f6e")}>
        <planeGeometry args={[4, 200]} />
      </mesh>
    </group>
  );
};
