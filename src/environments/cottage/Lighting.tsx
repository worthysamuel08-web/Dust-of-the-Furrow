/**
 * Morning light for the cottage. Budget-conscious for older GPUs:
 *  - ONE shadow-casting light (the sun through the window), 1024² soft shadow map
 *  - hemisphere + two small point lights without shadows
 *  - the visible light beam and dust are cheap additive fakes (no volumetrics)
 */
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { lerp, seededRandom, softNoise } from "../../engine/animation";
import { radialTexture, shaftTexture } from "../../engine/textures";
import { DOOR, HEARTH, ROOM, SUN_DIRECTION, WINDOW } from "./layout";

const SUN_DIR = new THREE.Vector3(...SUN_DIRECTION).normalize();
const SUN_TARGET = new THREE.Vector3(-1.3, 0.5, -1.0);
const SHAFT_LENGTH = 2.9;

export type CottageLightingProps = {
  frame: number;
  /** 0 = pre-dawn gloom, 1 = full morning sun through the window. */
  sun: number;
  /** Hearth embers brightness 0..1. */
  ember: number;
};

/** Window rectangle corners on the inside face of the back wall. */
const windowCorners = (inset = 0) => [
  new THREE.Vector3(WINDOW.x0 + inset, WINDOW.y0 + inset, ROOM.zBack + 0.01),
  new THREE.Vector3(WINDOW.x1 - inset, WINDOW.y0 + inset, ROOM.zBack + 0.01),
  new THREE.Vector3(WINDOW.x1 - inset, WINDOW.y1 - inset, ROOM.zBack + 0.01),
  new THREE.Vector3(WINDOW.x0 + inset, WINDOW.y1 - inset, ROOM.zBack + 0.01),
];

/** Four faces of a prism from the window along the sun direction (UV v: 1 at window, 0 far). */
const shaftGeometry = (spread: number) => {
  const near = windowCorners();
  const centre = near.reduce((a, c) => a.add(c), new THREE.Vector3()).multiplyScalar(0.25);
  const far = near.map((c) =>
    c.clone().add(SUN_DIR.clone().multiplyScalar(SHAFT_LENGTH)).add(c.clone().sub(centre).multiplyScalar(spread)),
  );
  const pos: number[] = [];
  const uv: number[] = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    for (const [p, u, v] of [
      [near[i], 0, 1],
      [near[j], 1, 1],
      [far[j], 1, 0],
      [near[i], 0, 1],
      [far[j], 1, 0],
      [far[i], 0, 0],
    ] as const) {
      pos.push(p.x, p.y, p.z);
      uv.push(u, v);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
};

const DUST_COUNT = 140;

export const CottageLighting: React.FC<CottageLightingProps> = ({ frame, sun, ember }) => {
  const sunRef = useRef<THREE.DirectionalLight>(null);

  const shaft = useMemo(() => {
    const alpha = shaftTexture();
    const mk = () =>
      new THREE.MeshBasicMaterial({
        color: "#ffd9a0",
        alphaMap: alpha,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
        fog: false,
      });
    return { inner: shaftGeometry(0.15), outer: shaftGeometry(0.6), innerMat: mk(), outerMat: mk() };
  }, []);

  const dust = useMemo(() => {
    const rnd = seededRandom(101);
    const seeds = Array.from({ length: DUST_COUNT }, () => ({
      a: rnd(),
      b: rnd(),
      u: 0.05 + rnd() * 0.85,
      ph: rnd() * 10,
      sp: 0.6 + rnd() * 0.8,
    }));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(DUST_COUNT * 3), 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(DUST_COUNT * 3), 3));
    const mat = new THREE.PointsMaterial({
      size: 0.011,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { seeds, geo, mat };
  }, []);

  const glow = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffe2b0",
        alphaMap: radialTexture(),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const skyMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, fog: false }), []);
  const leakMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, fog: false }), []);

  // --- per-frame updates (pure functions of frame/sun) ---------------------
  shaft.innerMat.opacity = 0.16 * sun;
  shaft.outerMat.opacity = 0.07 * sun;
  glow.opacity = 0.22 * sun;
  skyMat.color.setRGB(lerp(0.16, 1.5, sun), lerp(0.2, 1.32, sun), lerp(0.3, 1.0, sun));
  leakMat.color.setRGB(lerp(0.12, 1.1, sun), lerp(0.13, 0.95, sun), lerp(0.16, 0.75, sun));
  dust.mat.opacity = 0.9 * sun;
  {
    const pos = dust.geo.attributes.position as THREE.BufferAttribute;
    const col = dust.geo.attributes.color as THREE.BufferAttribute;
    const [c0, c1, , c3] = windowCorners(0.03);
    const ex = c1.clone().sub(c0);
    const ey = c3.clone().sub(c0);
    dust.seeds.forEach((s, i) => {
      const t = frame * s.sp;
      const p = c0
        .clone()
        .addScaledVector(ex, s.a)
        .addScaledVector(ey, s.b)
        .addScaledVector(SUN_DIR, s.u * SHAFT_LENGTH);
      p.x += Math.sin(t / 97 + s.ph) * 0.05;
      p.y += Math.sin(t / 131 + s.ph * 2) * 0.04 - ((t * 0.0004) % 0.08);
      p.z += Math.cos(t / 113 + s.ph) * 0.04;
      pos.setXYZ(i, p.x, p.y, p.z);
      const twinkle = 0.55 + 0.45 * Math.sin(t / 23 + s.ph * 3);
      const fade = Math.sin(Math.PI * s.u); // dimmer at the ends of the beam
      const k = twinkle * fade;
      col.setXYZ(i, 1.0 * k, 0.85 * k, 0.6 * k);
    });
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }

  useLayoutEffect(() => {
    const l = sunRef.current;
    if (!l) return;
    l.target.position.copy(SUN_TARGET);
    l.target.updateMatrixWorld();
  }, []);

  const sunPos = SUN_TARGET.clone().addScaledVector(SUN_DIR, -9);
  const flicker = 1 + softNoise(frame * 2.2, 3) * 0.18;

  return (
    <group>
      {/* sky seen through the window */}
      <mesh position={[(WINDOW.x0 + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2 + 0.2, ROOM.zBack - 0.6]} material={skyMat}>
        <planeGeometry args={[2.2, 1.6]} />
      </mesh>
      {/* sunlight */}
      <directionalLight
        ref={sunRef}
        position={sunPos}
        color="#ffd7a8"
        intensity={lerp(0.05, 3.4, sun)}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={4.5}
        shadow-camera-bottom={-4.5}
        shadow-camera-near={1}
        shadow-camera-far={18}
      />
      {/* ambient skylight seeping through the thatch, door gaps and window */}
      <hemisphereLight args={["#b3aa9a", "#4a3826", lerp(0.55, 0.95, sun)]} />
      {/* warm bounce from the sunlit patch */}
      <pointLight position={[-1.2, 0.5, -0.9]} color="#ffbe80" intensity={lerp(0, 1.4, sun)} distance={4} decay={1.6} />
      {/* hearth embers */}
      <pointLight
        position={[HEARTH.x, 0.3, HEARTH.z]}
        color="#ff8a3d"
        intensity={1.6 * ember * flicker}
        distance={5}
        decay={1.5}
      />

      {/* visible beam, halo and dust */}
      <mesh geometry={shaft.outer} material={shaft.outerMat} renderOrder={10} />
      <mesh geometry={shaft.inner} material={shaft.innerMat} renderOrder={11} />
      <mesh
        position={[(WINDOW.x0 + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, ROOM.zBack + 0.04]}
        material={glow}
        renderOrder={12}
      >
        <planeGeometry args={[0.95, 0.85]} />
      </mesh>
      <points geometry={dust.geo} material={dust.mat} renderOrder={13} />

      {/* daylight leaking around the door */}
      <mesh position={[ROOM.x1 - 0.005, 0.015, (DOOR.z0 + DOOR.z1) / 2]} rotation-y={-Math.PI / 2} material={leakMat}>
        <planeGeometry args={[DOOR.z1 - DOOR.z0 - 0.02, 0.025]} />
      </mesh>
    </group>
  );
};
