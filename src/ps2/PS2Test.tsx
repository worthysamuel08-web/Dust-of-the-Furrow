/**
 * PS2-style look test: Harrison (as a low-poly 3D stickman) treading water in the flooded,
 * upside-down cabin, with game HUD and subtitles. Rendered small (360x640, like PS2-era
 * resolution) and enlarged with nearest-neighbour scaling afterwards (scripts/render-ps2.sh).
 *
 * The look: few polygons + flat shading, tiny textures with nearest filtering (no smoothing),
 * distance fog, one warm flashlight against cold ambient light, no antialiasing.
 */
import "@fontsource/inter/700.css";
import "@fontsource/inter/900.css";
import React, { useMemo } from "react";
import * as THREE from "three";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraRig } from "../engine/CameraRig";

export const PS2_FPS = 30;
export const PS2_DURATION = 8 * PS2_FPS;
const KNOCK1 = 5.2;
const KNOCK2 = 5.75;

// ---------- tiny canvas textures (nearest filtered = crunchy PS2 texels) ----------
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat: [number, number] = [1, 1]) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  return t;
}
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function useTextures() {
  return useMemo(() => {
    const r = rng(7);
    const tiles = canvasTex(16, 16, (g) => {
      g.fillStyle = "#6F8794";
      g.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.5 ? "#677F8B" : "#7A919D"; g.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 1, 1); }
      g.fillStyle = "#4C616C";
      g.fillRect(0, 0, 16, 1);
      g.fillRect(0, 0, 1, 16);
    }, [8, 6]);
    const plate = canvasTex(16, 16, (g) => {
      g.fillStyle = "#3E4A53";
      g.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 30; i++) { g.fillStyle = r() > 0.5 ? "#36424A" : "#47545D"; g.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 1, 1); }
      g.fillStyle = "#2A333A";
      g.fillRect(3, 3, 1, 1); g.fillRect(12, 3, 1, 1); g.fillRect(3, 12, 1, 1); g.fillRect(12, 12, 1, 1);
    }, [4, 4]);
    // face on a 64x32 wrap (front of the sphere = u 0.25 = x 16)
    const face = canvasTex(64, 32, (g) => {
      g.fillStyle = "#ECEBE6";
      g.fillRect(0, 0, 64, 32);
      g.fillStyle = "#151515";
      g.fillRect(11, 11, 3, 4); g.fillRect(18, 11, 3, 4); // eyes
      g.fillStyle = "#FFFFFF";
      g.fillRect(12, 11, 1, 1); g.fillRect(19, 11, 1, 1); // catch-lights
      g.fillStyle = "#151515";
      g.fillRect(10, 8, 4, 1); g.fillRect(18, 8, 4, 1); // brows (worried: inner ends up)
      g.fillRect(13, 7, 1, 1); g.fillRect(18, 7, 1, 1);
      g.fillStyle = "#1B1B1B"; // stubble beard along the jaw
      for (let x = 2; x < 31; x++) { const d = Math.abs(x - 16); const top = 18 + Math.floor(d / 6); g.fillRect(x, top, 1, 32 - top); }
      g.fillStyle = "#ECEBE6";
      g.fillRect(13, 18, 6, 2); // skin around the mouth
      g.fillStyle = "#3A1010";
      g.fillRect(14, 19, 4, 2); // open mouth
      g.fillStyle = "#1B1B1B";
      g.fillRect(13, 17, 6, 1); // moustache
    });
    return { tiles, plate, face };
  }, []);
}

// ---------- props ----------
const flat = (color: string, extra: Partial<THREE.MeshLambertMaterialParameters> = {}) => <meshLambertMaterial color={color} flatShading {...extra} />;

const Limb: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; r?: number; color?: string }> = ({ a, b, r = 0.028, color = "#151515" }) => {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, dir.length(), 5]} />
      {flat(color)}
    </mesh>
  );
};

/** Harrison as a low-poly stickman: sphere head with a 64x32 face texture, shirt, shorts, stick limbs. */
const Harrison3D: React.FC<{ t: number; face: THREE.Texture; knock: number }> = ({ t, face, knock }) => {
  const bob = Math.sin(t * 2.1) * 0.025;
  const paddle = Math.sin(t * 2.6);
  const sh = (s: number) => new THREE.Vector3(0.17 * s, 0.33, 0);
  const handL = new THREE.Vector3(-0.55, 0.06 + paddle * 0.03, 0.12 + paddle * 0.06);
  // right hand holds the flashlight forward; on the knocks it shoots up to the ceiling
  const handR = new THREE.Vector3(0.42 - knock * 0.2, 0.18 + knock * 0.95, 0.3 - knock * 0.2);
  const elbow = (s: THREE.Vector3, h: THREE.Vector3, out: number) => s.clone().add(h).multiplyScalar(0.5).add(new THREE.Vector3(out, -0.08, 0));
  return (
    <group position={[0, bob, 0]}>
      {/* head */}
      <mesh position={[0, 0.66, 0]} rotation={[0.1, Math.sin(t * 0.7) * 0.3 - 0.15, 0]}>
        <sphereGeometry args={[0.19, 10, 7]} />
        <meshLambertMaterial map={face} flatShading />
      </mesh>
      {/* messy hair tufts */}
      {[-0.07, -0.025, 0.02, 0.065].map((x, i) => (
        <mesh key={i} position={[x, 0.86, -0.02]} rotation={[0.2, 0, -x * 4]}>
          <coneGeometry args={[0.012, 0.09, 3]} />
          {flat("#151515")}
        </mesh>
      ))}
      <Limb a={new THREE.Vector3(0, 0.47, 0)} b={new THREE.Vector3(0, 0.38, 0)} />
      {/* T-shirt torso + sleeves */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.2, 0.19, 0.42, 7]} />
        {flat("#E9EEF1")}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.22 * s, 0.3, 0]} rotation={[0, 0, s * 1.0]}>
          <cylinderGeometry args={[0.06, 0.075, 0.12, 6]} />
          {flat("#E9EEF1")}
        </mesh>
      ))}
      {/* shorts + legs (under water) */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.19, 0.2, 0.18, 7]} />
        {flat("#1D2440")}
      </mesh>
      <Limb a={new THREE.Vector3(-0.08, -0.2, 0)} b={new THREE.Vector3(-0.12 + paddle * 0.04, -0.72, 0.08 * paddle)} />
      <Limb a={new THREE.Vector3(0.08, -0.2, 0)} b={new THREE.Vector3(0.12 - paddle * 0.04, -0.72, -0.08 * paddle)} />
      {/* arms */}
      <Limb a={sh(-1)} b={elbow(sh(-1), handL, -0.05)} />
      <Limb a={elbow(sh(-1), handL, -0.05)} b={handL} />
      <Limb a={sh(1)} b={elbow(sh(1), handR, 0.06)} />
      <Limb a={elbow(sh(1), handR, 0.06)} b={handR} />
      {[handL, handR].map((h, i) => (
        <mesh key={i} position={h}>
          <icosahedronGeometry args={[0.045, 0]} />
          {flat("#ECEBE6")}
        </mesh>
      ))}
      {/* flashlight */}
      <group position={handR} rotation={[-0.5 - knock * 0.9, 0, -0.3]}>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.16, 6]} />
          {flat("#3B4250")}
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.04, 0.03, 0.04, 6]} />
          <meshBasicMaterial color="#FFF3C2" />
        </mesh>
      </group>
    </group>
  );
};

/** Faceted water surface: a coarse grid whose vertices move with the frame. */
const Water: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(4, 4, 10, 10), []);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 2.3 + t * 2.0) * 0.025 + Math.cos(y * 2.9 - t * 1.6) * 0.02);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <meshPhongMaterial color="#1E6E9A" transparent opacity={0.72} flatShading shininess={60} specular="#9FE3FF" side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Upside-down bathroom: the old floor is the ceiling; the sink and toilet hang from it. */
const Room: React.FC<{ tiles: THREE.Texture; plate: THREE.Texture }> = ({ tiles, plate }) => (
  <group>
    {/* walls (inside of a box) */}
    <mesh position={[0, -0.1, 0]}>
      <boxGeometry args={[4, 3, 4]} />
      <meshLambertMaterial map={tiles} side={THREE.BackSide} />
    </mesh>
    {/* ceiling = old floor plating */}
    <mesh position={[0, 1.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4, 4]} />
      <meshLambertMaterial map={plate} />
    </mesh>
    {/* sink hanging upside down */}
    <group position={[-1.2, 1.4, -1.4]}>
      <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.04, 0.04, 0.4, 5]} />{flat("#AEB6BC")}</mesh>
      <mesh position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}><cylinderGeometry args={[0.32, 0.22, 0.16, 7]} />{flat("#E6E8EA")}</mesh>
    </group>
    {/* toilet hanging upside down */}
    <group position={[1.25, 1.4, -1.3]}>
      <mesh position={[0, -0.18, 0]}><boxGeometry args={[0.36, 0.36, 0.3]} />{flat("#E6E8EA")}</mesh>
      <mesh position={[0, -0.45, 0.12]} rotation={[Math.PI, 0, 0]}><cylinderGeometry args={[0.24, 0.17, 0.26, 7]} />{flat("#E6E8EA")}</mesh>
    </group>
    {/* door on the side wall, handle near the top (it's upside down) */}
    <mesh position={[-1.99, 0.3, 0.6]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.8, 1.9]} />{flat("#6B4E33")}</mesh>
    <mesh position={[-1.97, 1.0, 0.3]}><sphereGeometry args={[0.04, 5, 4]} />{flat("#C9B26A")}</mesh>
    {/* floating debris */}
    <mesh position={[0.9, 0.02, 0.6]} rotation={[0, 0.6, 0]}><boxGeometry args={[0.5, 0.05, 0.18]} />{flat("#6B4E33")}</mesh>
    <mesh position={[-0.8, 0.03, 0.9]} rotation={[0, -0.3, 0]}><cylinderGeometry args={[0.06, 0.06, 0.25, 6]} />{flat("#C0392B")}</mesh>
  </group>
);

/** Warm spotlight; its target object has to live in the scene for the direction to apply. */
const Flashlight: React.FC<{ t: number }> = ({ t }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <>
      <primitive object={target} position={[0.3, 1.4, -1.5]} />
      <spotLight position={[0.45, 0.4, 0.4]} angle={0.55} penumbra={0.3} intensity={9 + Math.sin(t * 13) * 0.6} distance={6} decay={1.5} color="#FFE6A8" target={target} />
    </>
  );
};

// ---------- HUD ----------
const Hud: React.FC<{ t: number }> = ({ t }) => {
  const air = interpolate(t, [0, 8], [0.74, 0.69]);
  const line = "Hello...? Is anyone out there?";
  const shown = line.slice(0, Math.floor(interpolate(t, [1.0, 2.6], [0, line.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const knockOn = t > KNOCK1 - 0.05;
  const sub = knockOn ? "*KNOCK* ... *KNOCK*" : shown;
  const who = knockOn ? "" : "HARRISON";
  const font: React.CSSProperties = { fontFamily: "Inter", fontWeight: 700, color: "#fff", textShadow: "1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000" };
  return (
    <AbsoluteFill>
      {/* top-left status */}
      <div style={{ position: "absolute", top: 16, left: 14, ...font, fontSize: 11, letterSpacing: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 13 }}>DAY 2 · 30 m DOWN</div>
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span>AIR</span>
          <div style={{ width: 110, height: 9, border: "1px solid #fff", background: "rgba(0,0,0,0.5)" }}>
            <div style={{ width: `${air * 100}%`, height: "100%", background: "linear-gradient(#9FF0FF, #2F9BD0)" }} />
          </div>
        </div>
      </div>
      {/* subtitle box */}
      {t > 0.8 && (
        <div style={{ position: "absolute", left: 14, right: 14, bottom: 120, padding: "8px 10px", background: "rgba(10,20,60,0.72)", border: "2px solid #C9D6FF", borderRadius: 4, ...font }}>
          {who && <div style={{ fontSize: 10, color: "#FFD23F", fontWeight: 900, letterSpacing: 1 }}>{who}</div>}
          <div style={{ fontSize: 15, marginTop: 2 }}>{sub}</div>
        </div>
      )}
      {/* title card at the start */}
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", ...font, fontWeight: 900, fontSize: 30, letterSpacing: 2,
        opacity: interpolate(t, [0, 0.2, 1.0, 1.3], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        AIR POCKET
        <div style={{ fontSize: 10, letterSpacing: 4, marginTop: 4 }}>CHAPTER 2 — THE DARK</div>
      </div>
    </AbsoluteFill>
  );
};

export const PS2Test: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / PS2_FPS;
  const { tiles, plate, face } = useTextures();
  const k = (at: number) => (t > at - 0.12 && t < at + 0.25 ? Math.sin(Math.min(1, (t - at + 0.12) / 0.37) * Math.PI) : 0);
  const knock = Math.max(k(KNOCK1), k(KNOCK2));
  const shake = (t > KNOCK1 && t < KNOCK1 + 0.3) || (t > KNOCK2 && t < KNOCK2 + 0.3) ? Math.sin(frame * 3.1) * 0.03 : 0;
  const ang = interpolate(t, [0, 8], [-0.55, 0.35], { easing: Easing.inOut(Easing.sin) });
  const rad = interpolate(t, [0, 8], [2.6, 1.55], { easing: Easing.inOut(Easing.quad) });
  const camY = interpolate(t, [0, 8], [0.75, 0.62]) + Math.sin(t * 1.3) * 0.02;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={width} height={height} dpr={1} gl={{ antialias: false }} camera={{ fov: 62, near: 0.05, far: 30, position: [0, 0.7, 2.5] }}>
        <color attach="background" args={["#05101A"]} />
        <fog attach="fog" args={["#05101A", 1.6, 5.2]} />
        <CameraRig position={[Math.sin(ang) * rad + shake, camY + shake, Math.cos(ang) * rad]} target={[0, 0.52, 0]} />
        <ambientLight intensity={0.45} color="#5F86A8" />
        <hemisphereLight args={["#8FB8D8", "#0A2233", 0.8]} />
        {/* the flashlight: warm spot pointing ahead/up */}
        <Flashlight t={t} />
        <pointLight position={[0.42, 0.25, 0.32]} intensity={1.2} distance={1.6} color="#FFD98A" />
        <Room tiles={tiles} plate={plate} />
        <Harrison3D t={t} face={face} knock={knock} />
        <Water t={t} />
        {/* bubbles rising in front of him */}
        {Array.from({ length: 8 }, (_, i) => {
          const life = 2.2;
          const age = (t + i * 0.37) % life;
          return (
            <mesh key={i} position={[Math.sin(i * 2.3) * 0.8, -1.2 + age * 0.55, 0.5 + Math.cos(i * 1.7) * 0.4]}>
              <icosahedronGeometry args={[0.025 + (i % 3) * 0.01, 0]} />
              <meshBasicMaterial color="#BFEFFF" transparent opacity={0.55} />
            </mesh>
          );
        })}
      </ThreeCanvas>
      <Hud t={t} />
      <Audio src={staticFile("airpocket/underwater.mp3")} volume={0.55} />
      <Sequence from={Math.round(0.9 * PS2_FPS)} layout="none"><Audio src={staticFile("ps2test/line.mp3")} /></Sequence>
      <Sequence from={Math.round(KNOCK1 * PS2_FPS)} layout="none"><Audio src={staticFile("airpocket/knock.mp3")} /></Sequence>
      <Sequence from={Math.round(KNOCK2 * PS2_FPS)} layout="none"><Audio src={staticFile("airpocket/knock.mp3")} /></Sequence>
    </AbsoluteFill>
  );
};
