/**
 * Shared outdoor kit: time-of-day presets, sky dome, distant hills and trees,
 * sun + ambient light, and a cached flat-material helper. House style: flat
 * colours, mood from light; purple shadows, amber light.
 */
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { seededRandom } from "../../engine/animation";

export type TimeOfDay = "dawn" | "morning" | "midday" | "afternoon" | "dusk" | "night" | "storm";

export type TimePreset = {
  skyTop: string;
  skyHorizon: string;
  sun: string;
  sunIntensity: number;
  /** Direction the light travels (from the sun towards the ground). */
  sunDir: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  fog: string;
  fogDensity: number;
  /** How brightly windows and doorways glow (0..1+). */
  glow: number;
  ground: string;
  stars?: boolean;
};

export const TIMES: Record<TimeOfDay, TimePreset> = {
  dawn: { skyTop: "#352a5c", skyHorizon: "#f29a6a", sun: "#ffb27a", sunIntensity: 1.6, sunDir: [-0.8, -0.35, -0.3], hemiSky: "#8a78c0", hemiGround: "#2a1f33", hemi: 0.75, fog: "#5a4466", fogDensity: 0.012, glow: 0.8, ground: "#5b4a52" },
  morning: { skyTop: "#4f68a6", skyHorizon: "#f2c595", sun: "#ffd7a3", sunIntensity: 2.6, sunDir: [-0.7, -0.55, -0.4], hemiSky: "#a59ad0", hemiGround: "#3a2e33", hemi: 0.9, fog: "#8c80a2", fogDensity: 0.008, glow: 0.25, ground: "#6a5a4c" },
  midday: { skyTop: "#5a84c4", skyHorizon: "#dcd6c6", sun: "#fff0d4", sunIntensity: 3.0, sunDir: [-0.25, -0.9, -0.35], hemiSky: "#b8bee0", hemiGround: "#4a3d33", hemi: 1.0, fog: "#a9a6b8", fogDensity: 0.006, glow: 0, ground: "#74644f" },
  afternoon: { skyTop: "#5672b0", skyHorizon: "#f1c58c", sun: "#ffcc85", sunIntensity: 2.7, sunDir: [0.6, -0.55, -0.45], hemiSky: "#a898c8", hemiGround: "#3e3030", hemi: 0.9, fog: "#ab968e", fogDensity: 0.008, glow: 0.15, ground: "#6e5c48" },
  dusk: { skyTop: "#261f4c", skyHorizon: "#ff8a52", sun: "#ff8a46", sunIntensity: 1.5, sunDir: [0.85, -0.25, -0.35], hemiSky: "#7a64b0", hemiGround: "#24182c", hemi: 0.65, fog: "#563a5c", fogDensity: 0.014, glow: 1.0, ground: "#4a3a44" },
  night: { skyTop: "#090b1e", skyHorizon: "#1e2448", sun: "#8ea2e0", sunIntensity: 0.55, sunDir: [-0.3, -0.85, -0.4], hemiSky: "#3a4a80", hemiGround: "#0e0a18", hemi: 0.42, fog: "#12142a", fogDensity: 0.02, glow: 1.25, ground: "#1e1c2a", stars: true },
  storm: { skyTop: "#26263a", skyHorizon: "#4a4a5c", sun: "#b8b8c8", sunIntensity: 0.6, sunDir: [0.3, -0.8, -0.4], hemiSky: "#6a6a8a", hemiGround: "#1e1c24", hemi: 0.6, fog: "#38384a", fogDensity: 0.03, glow: 0.7, ground: "#3a3640" },
};

// ---- cached flat materials ----------------------------------------------------------
const cache = new Map<string, THREE.Material>();
export const flat = (color: string, side: THREE.Side = THREE.FrontSide): THREE.MeshLambertMaterial => {
  const k = `l:${color}:${side}`;
  if (!cache.has(k)) cache.set(k, new THREE.MeshLambertMaterial({ color, side }));
  return cache.get(k) as THREE.MeshLambertMaterial;
};
/** Unlit, self-coloured (windows, embers, sky elements). Colour may be scaled per frame. */
export const glowMat = (key: string): THREE.MeshBasicMaterial => {
  const k = `g:${key}`;
  if (!cache.has(k)) cache.set(k, new THREE.MeshBasicMaterial({ color: "#ffb35c", toneMapped: false, fog: false }));
  return cache.get(k) as THREE.MeshBasicMaterial;
};

/** Amber window glow, scaled by the time of day. */
export const useWindowGlow = (glow: number) => {
  const m = glowMat("window");
  m.color.set("#ffb867").multiplyScalar(0.35 + glow * 1.15);
  return m;
};

// ---- sky dome -------------------------------------------------------------------------
export const SkyDome: React.FC<{ t: TimePreset }> = ({ t }) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(160, 32, 16);
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, toneMapped: false, depthWrite: false }), []);
  const top = new THREE.Color(t.skyTop);
  const hor = new THREE.Color(t.skyHorizon);
  const pos = geo.attributes.position;
  const col = geo.attributes.color as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 160;
    const c = hor.clone().lerp(top, Math.pow(Math.max(0, y), 0.55));
    col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
  return <mesh geometry={geo} material={mat} renderOrder={-10} />;
};

export const Stars: React.FC = () => {
  const geo = useMemo(() => {
    const rnd = seededRandom(404);
    const p: number[] = [];
    for (let i = 0; i < 500; i++) {
      const a = rnd() * Math.PI * 2;
      const e = 0.15 + rnd() * 1.3;
      p.push(Math.cos(a) * Math.cos(e) * 150, Math.sin(e) * 150, Math.sin(a) * Math.cos(e) * 150);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.PointsMaterial({ color: "#dfe6ff", size: 0.5, fog: false, toneMapped: false }), []);
  return <points geometry={geo} material={mat} />;
};

/** Low rolling hills and copses on the horizon (silhouettes in the fog). */
export const Horizon: React.FC<{ t: TimePreset; seed?: number; exclude?: (x: number, z: number) => boolean }> = ({ t, seed = 3, exclude }) => {
  const items = useMemo(() => {
    const rnd = seededRandom(seed);
    const hills = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + rnd() * 0.2;
      const r = 95 + rnd() * 25;
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, sx: 30 + rnd() * 30, sy: 6 + rnd() * 8 };
    });
    const trees: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 45 + rnd() * 45;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (exclude?.(x, z)) continue;
      trees.push({ x, z, s: 2.2 + rnd() * 2.5 });
    }
    return { hills, trees };
  }, [seed, exclude]);
  const hill = flat(new THREE.Color(t.fog).lerp(new THREE.Color("#141018"), 0.55).getStyle());
  const tree = flat(new THREE.Color(t.hemiGround).lerp(new THREE.Color("#2a3a2a"), 0.5).getStyle());
  const trunk = flat("#2a1e1a");
  return (
    <group>
      {items.hills.map((h, i) => (
        <mesh key={i} position={[h.x, -2, h.z]} scale={[h.sx, h.sy, h.sx * 0.6]} material={hill}>
          <sphereGeometry args={[1, 12, 6]} />
        </mesh>
      ))}
      {items.trees.map((tr, i) => (
        <group key={i} position={[tr.x, 0, tr.z]}>
          <mesh position-y={tr.s * 0.5} material={trunk}>
            <cylinderGeometry args={[0.15 * tr.s * 0.4, 0.2 * tr.s * 0.4, tr.s, 5]} />
          </mesh>
          <mesh position-y={tr.s * 1.25} scale={[tr.s, tr.s * 0.9, tr.s]} material={tree}>
            <icosahedronGeometry args={[1, 0]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Sun (one soft shadow-casting light around `center`) + hemisphere ambient. */
export const SunLight: React.FC<{ t: TimePreset; center: [number, number, number]; extent?: number }> = ({ t, center, extent = 18 }) => {
  const ref = useRef<THREE.DirectionalLight>(null);
  const dir = new THREE.Vector3(...t.sunDir).normalize();
  const target = new THREE.Vector3(...center);
  const pos = target.clone().addScaledVector(dir, -40);
  useLayoutEffect(() => {
    const l = ref.current;
    if (!l) return;
    l.target.position.copy(target);
    l.target.updateMatrixWorld();
  });
  return (
    <>
      <directionalLight
        ref={ref}
        position={pos}
        color={t.sun}
        intensity={t.sunIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-camera-near={1}
        shadow-camera-far={90}
      />
      <hemisphereLight args={[t.hemiSky, t.hemiGround, t.hemi]} />
    </>
  );
};

export const Atmosphere: React.FC<{ t: TimePreset }> = ({ t }) => (
  <>
    <color attach="background" args={[t.fog]} />
    <fogExp2 attach="fog" args={[t.fog, t.fogDensity]} />
  </>
);
