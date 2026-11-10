/**
 * The open fields: long strips (selions) running away from the camera (-Z),
 * ploughed into ridge and furrow. The lord's demesne (x < 4) is half reaped,
 * with stooks on the stubble (z > 0); tenant strips (x > 4) stand ripe —
 * Walter's strip is x 20–24. A road at x≈-62 runs to a walled town.
 * Also: the modern pasture where the furrows survive (Scene 56).
 */
import { useMemo } from "react";
import * as THREE from "three";
import { seededRandom } from "../../engine/animation";
import { DistantRoofs } from "./buildings";
import { Atmosphere, Horizon, SkyDome, Stars, SunLight, TIMES, flat, type TimeOfDay } from "./sky";

export const STRIP = 4; // metres between furrows
export const FIELDS = {
  reapLine: { z: 0 }, // standing wheat begins here (towards -Z)
  demesne: { x0: -36, x1: 4 },
  walterStrip: { x: 22, z: 4 },
  road: { x: -62 },
  hedge: { z: 16 },
} as const;

/** Ridge-and-furrow terrain: a corrugated plane, ridges along Z. */
const RidgeGround: React.FC<{ color: string; w: number; d: number; z: number; amp?: number }> = ({ color, w, d, z, amp = 0.16 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, d, Math.round(w * 3), 4);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setY(i, amp * (0.5 + 0.5 * Math.cos(((x % STRIP) / STRIP) * Math.PI * 2 + Math.PI)) * -1 + amp);
    }
    g.computeVertexNormals();
    return g;
  }, [w, d, amp]);
  return <mesh geometry={geo} position={[0, 0, z]} material={flat(color)} receiveShadow />;
};

type Crop = "wheat" | "barley" | "peas" | "fallow" | "stubble";
const CROP: Record<Crop, { h: number; color: string }> = {
  wheat: { h: 1.0, color: "#c9984a" },
  barley: { h: 0.85, color: "#b9a35a" },
  peas: { h: 0.45, color: "#5f7440" },
  fallow: { h: 0.08, color: "#6a5a40" },
  stubble: { h: 0.12, color: "#a88a52" },
};

/** One strip's standing crop: a flat-topped block sitting on the ridge. */
const CropBlock: React.FC<{ x: number; z0: number; z1: number; crop: Crop; glow?: number }> = ({ x, z0, z1, crop, glow = 0 }) => {
  const c = CROP[crop];
  const color = glow > 0 ? new THREE.Color(c.color).lerp(new THREE.Color("#f2c060"), glow).getStyle() : c.color;
  return (
    <mesh position={[x, 0.16 + c.h / 2, (z0 + z1) / 2]} material={flat(color)} castShadow receiveShadow>
      <boxGeometry args={[STRIP * 0.86, c.h, Math.abs(z1 - z0)]} />
    </mesh>
  );
};

export const Stook: React.FC<{ position: [number, number, number]; s?: number }> = ({ position, s = 1 }) => (
  <group position={position} scale={s}>
    <mesh position-y={0.55} material={flat("#c4934a")} castShadow>
      <coneGeometry args={[0.38, 1.1, 7]} />
    </mesh>
    <mesh position-y={0.82} material={flat("#9c7438")}>
      <cylinderGeometry args={[0.2, 0.22, 0.08, 7]} />
    </mesh>
  </group>
);

const Hedge: React.FC<{ z: number; x0: number; x1: number; gap?: [number, number]; seed: number }> = ({ z, x0, x1, gap, seed }) => {
  const bushes = useMemo(() => {
    const rnd = seededRandom(seed);
    const out: { x: number; s: number }[] = [];
    for (let x = x0; x < x1; x += 1.6 + rnd()) if (!gap || x < gap[0] || x > gap[1]) out.push({ x, s: 1.0 + rnd() * 0.7 });
    return out;
  }, [z, x0, x1, gap, seed]);
  return (
    <group>
      {bushes.map((b, i) => (
        <mesh key={i} position={[b.x, b.s * 0.7, z]} scale={[b.s * 1.2, b.s, b.s]} material={flat("#2f3b2a")} castShadow>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  );
};

export const Fields: React.FC<{ time: TimeOfDay; center: [number, number, number]; walterReaped?: number; demesneDone?: boolean }> = ({ time, center, walterReaped = 0, demesneDone = false }) => {
  const t = TIMES[time];
  const strips = useMemo(() => {
    const crops: Crop[] = ["wheat", "barley", "wheat", "peas", "fallow", "wheat", "barley"];
    const out: { x: number; crop: Crop }[] = [];
    for (let x = -58; x <= 58; x += STRIP) out.push({ x, crop: crops[Math.abs(Math.round(x / STRIP)) % crops.length] });
    return out;
  }, []);
  const stooks = useMemo(() => {
    const rnd = seededRandom(77);
    const out: [number, number, number][] = [];
    for (let x = FIELDS.demesne.x0 + 2; x < FIELDS.demesne.x1; x += STRIP) for (let z = 2.5; z < 13; z += 3.2 + rnd()) out.push([x + (rnd() - 0.5) * 0.8, 0.12, z]);
    return out;
  }, []);
  const exclude = useMemo(() => (x: number, z: number) => Math.abs(x) < 70 && z > -100 && z < 25, []);
  return (
    <group>
      <Atmosphere t={t} />
      <SkyDome t={t} />
      {t.stars ? <Stars /> : null}
      <SunLight t={t} center={center} extent={22} />
      <Horizon t={t} seed={8} exclude={exclude} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02} material={flat(t.ground)} receiveShadow>
        <planeGeometry args={[400, 400]} />
      </mesh>
      <RidgeGround color={new THREE.Color(t.ground).lerp(new THREE.Color("#7a6040"), 0.35).getStyle()} w={120} d={130} z={-50} />
      {strips.map((s) => {
        const demesne = s.x >= FIELDS.demesne.x0 && s.x < FIELDS.demesne.x1;
        const walter = Math.abs(s.x - FIELDS.walterStrip.x) < STRIP / 2;
        if (demesne) {
          return demesneDone ? (
            <CropBlock key={s.x} x={s.x} z0={14} z1={-110} crop="stubble" />
          ) : (
            <group key={s.x}>
              <CropBlock x={s.x} z0={FIELDS.reapLine.z} z1={-110} crop="wheat" />
              <CropBlock x={s.x} z0={14} z1={FIELDS.reapLine.z} crop="stubble" />
            </group>
          );
        }
        if (walter) {
          const cut = 14 - walterReaped * 14;
          return (
            <group key={s.x}>
              <CropBlock x={s.x} z0={cut} z1={-110} crop="wheat" glow={0.35} />
              {walterReaped > 0 ? <CropBlock x={s.x} z0={14} z1={cut} crop="stubble" /> : null}
            </group>
          );
        }
        return <CropBlock key={s.x} x={s.x} z0={14} z1={-110} crop={s.crop} />;
      })}
      {stooks.map((p, i) => (
        <Stook key={i} position={p} />
      ))}
      <Hedge z={FIELDS.hedge.z} x0={-60} x1={60} gap={[-6, 6]} seed={5} />
      <Hedge z={-112} x0={-60} x1={60} seed={6} />
      {/* the village beyond the fields, and the road to the town */}
      <DistantRoofs center={[0, -135]} count={10} spread={60} seed={4} spire />
      <mesh rotation-x={-Math.PI / 2} position={[FIELDS.road.x, 0.01, -60]} material={flat("#8a7458")} receiveShadow>
        <planeGeometry args={[3.5, 180]} />
      </mesh>
      <DistantRoofs center={[-72, -160]} count={14} spread={50} seed={9} spire walls />
    </group>
  );
};

/** Present-day English pasture: grass over medieval ridge and furrow, sheep, a hedge. */
export const Pasture: React.FC<{ time: TimeOfDay; center: [number, number, number] }> = ({ time, center }) => {
  const t = TIMES[time];
  const sheep = useMemo(() => {
    const rnd = seededRandom(12);
    return Array.from({ length: 9 }, () => [(rnd() - 0.5) * 50, -10 - rnd() * 50] as [number, number]);
  }, []);
  const exclude = useMemo(() => (x: number, z: number) => Math.abs(x) < 60 && z > -80 && z < 20, []);
  return (
    <group>
      <Atmosphere t={t} />
      <SkyDome t={t} />
      <SunLight t={t} center={center} extent={30} />
      <Horizon t={t} seed={21} exclude={exclude} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02} material={flat("#3f5a34")} receiveShadow>
        <planeGeometry args={[400, 400]} />
      </mesh>
      <RidgeGround color="#5d7a42" w={120} d={110} z={-40} amp={0.32} />
      {sheep.map(([x, z], i) => (
        <group key={i} position={[x, 0.3, z]}>
          <mesh scale={[0.7, 0.45, 0.4]} material={flat("#e6e0d0")} castShadow>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
          <mesh position={[0.65, 0.12, 0]} scale={[0.25, 0.2, 0.18]} material={flat("#1a1618")}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        </group>
      ))}
      <Hedge z={14} x0={-60} x1={60} seed={31} />
      <Hedge z={-95} x0={-60} x1={60} seed={32} />
      {/* a line of telegraph poles: quietly, this is today */}
      {[-40, -20, 0, 20, 40].map((x) => (
        <mesh key={x} position={[x, 4, -70]} material={flat("#2a2428")}>
          <boxGeometry args={[0.25, 8, 0.25]} />
        </mesh>
      ))}
      {t.stars ? <Stars /> : null}
    </group>
  );
};
