/**
 * Interior sets in the house style: the parish church, the manor hall (court),
 * the shared ox-house, and a dark graphic "stage" for montage scenes.
 * Floor at y = 0; camera works from +Z.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { makeTexture } from "../../engine/textures";
import { Roof } from "../outdoor/buildings";
import { flat, glowMat } from "../outdoor/sky";

const Room: React.FC<{ w: number; d: number; h: number; z: number; wall: string; floor: string; ceiling?: string }> = ({ w, d, h, z, wall, floor, ceiling }) => (
  <group position-z={z}>
    <mesh rotation-x={-Math.PI / 2} material={flat(floor)} receiveShadow>
      <planeGeometry args={[w, d]} />
    </mesh>
    <mesh position={[0, h / 2, -d / 2]} material={flat(wall)} receiveShadow>
      <planeGeometry args={[w, h]} />
    </mesh>
    <mesh position={[-w / 2, h / 2, 0]} rotation-y={Math.PI / 2} material={flat(wall)} receiveShadow>
      <planeGeometry args={[d, h]} />
    </mesh>
    <mesh position={[w / 2, h / 2, 0]} rotation-y={-Math.PI / 2} material={flat(wall)} receiveShadow>
      <planeGeometry args={[d, h]} />
    </mesh>
    {ceiling ? (
      <mesh position={[0, h, 0]} rotation-x={Math.PI / 2} material={flat(ceiling)}>
        <planeGeometry args={[w, d]} />
      </mesh>
    ) : null}
  </group>
);

/** The Doom (Judgement Day) painted over the chancel arch, drawn on a canvas. */
const doomTexture = () =>
  makeTexture(
    "doom",
    (ctx, s) => {
      ctx.fillStyle = "#d9c9a8";
      ctx.fillRect(0, 0, s, s);
      // heaven above, hell-mouth below right
      ctx.fillStyle = "#c7a25a";
      ctx.beginPath();
      ctx.arc(s / 2, s * 0.22, s * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7a2a1e";
      ctx.fillRect(s / 2 - s * 0.05, s * 0.3, s * 0.1, s * 0.22);
      ctx.fillStyle = "#f4ecd8";
      ctx.beginPath();
      ctx.arc(s / 2, s * 0.24, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // the hell-mouth: a monster's open jaws
      ctx.fillStyle = "#8f2416";
      ctx.beginPath();
      ctx.ellipse(s * 0.76, s * 0.78, s * 0.2, s * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2a0d0a";
      ctx.beginPath();
      ctx.ellipse(s * 0.74, s * 0.8, s * 0.13, s * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f4ecd8";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(s * (0.63 + i * 0.04), s * 0.71);
        ctx.lineTo(s * (0.65 + i * 0.04), s * 0.75);
        ctx.lineTo(s * (0.67 + i * 0.04), s * 0.71);
        ctx.fill();
      }
      // little stick figures: the saved (left) and the damned (right)
      ctx.strokeStyle = "#1b1611";
      ctx.lineWidth = s * 0.008;
      const figure = (x: number, y: number, sc: number) => {
        ctx.fillStyle = "#1b1611";
        ctx.beginPath();
        ctx.arc(x, y, sc * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + sc);
        ctx.moveTo(x - sc * 0.4, y + sc * 0.4);
        ctx.lineTo(x + sc * 0.4, y + sc * 0.4);
        ctx.moveTo(x, y + sc);
        ctx.lineTo(x - sc * 0.3, y + sc * 1.6);
        ctx.moveTo(x, y + sc);
        ctx.lineTo(x + sc * 0.3, y + sc * 1.6);
        ctx.stroke();
      };
      for (let i = 0; i < 5; i++) figure(s * (0.12 + i * 0.07), s * 0.55, s * 0.05);
      for (let i = 0; i < 4; i++) figure(s * (0.6 + i * 0.07), s * (0.48 + (i % 2) * 0.05), s * 0.05);
      // red devils with pitchforks
      ctx.fillStyle = "#a3271c";
      for (const [x, y] of [[0.88, 0.5], [0.55, 0.62]]) {
        ctx.beginPath();
        ctx.arc(s * x, s * y, s * 0.035, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(s * x - s * 0.012, s * y, s * 0.024, s * 0.1);
        ctx.strokeStyle = "#a3271c";
        ctx.beginPath();
        ctx.moveTo(s * x + s * 0.03, s * y + s * 0.02);
        ctx.lineTo(s * x - s * 0.06, s * y - s * 0.08);
        ctx.stroke();
      }
    },
    { size: 512, seed: 1 },
  );

export const ChurchInterior: React.FC<{ frame: number }> = ({ frame }) => {
  const doom = useMemo(() => new THREE.MeshLambertMaterial({ map: doomTexture() }), []);
  const candle = glowMat("candle");
  candle.color.set("#ffbe6a").multiplyScalar(1.6 + 0.15 * Math.sin(frame * 0.5));
  const win = glowMat("lancet");
  win.color.set("#ffd29a").multiplyScalar(1.4);
  return (
    <group>
      <color attach="background" args={["#141019"]} />
      <fogExp2 attach="fog" args={["#1d1628", 0.04]} />
      <Room w={8} d={24} h={7} z={-8} wall="#8a8296" floor="#4a3e40" />
      {/* chancel arch wall with the Doom */}
      <mesh position={[0, 5.2, -18.9]} material={doom}>
        <planeGeometry args={[7.6, 3.6]} />
      </mesh>
      <mesh position={[0, 1.8, -18.95]} material={flat("#2a2128")}>
        <planeGeometry args={[3.2, 3.6]} />
      </mesh>
      {/* rood beam and cross */}
      <mesh position={[0, 3.9, -18.4]} material={flat("#3a2b26")} castShadow>
        <boxGeometry args={[7.8, 0.25, 0.25]} />
      </mesh>
      <mesh position={[0, 4.6, -18.4]} material={flat("#3a2b26")}>
        <boxGeometry args={[0.15, 1.3, 0.15]} />
      </mesh>
      <mesh position={[0, 4.75, -18.4]} material={flat("#3a2b26")}>
        <boxGeometry args={[0.7, 0.15, 0.15]} />
      </mesh>
      {/* lancet windows on the south wall, candles at the altar */}
      {[-14, -9, -4, 1].map((z) => (
        <mesh key={z} position={[3.98, 3.6, z]} rotation-y={-Math.PI / 2} material={win}>
          <planeGeometry args={[0.5, 2.0]} />
        </mesh>
      ))}
      {[-0.6, 0.6].map((x) => (
        <group key={x} position={[x, 0, -18.2]}>
          <mesh position-y={0.6} material={flat("#4a3e40")}>
            <boxGeometry args={[0.15, 1.2, 0.15]} />
          </mesh>
          <mesh position-y={1.3} material={candle}>
            <sphereGeometry args={[0.06, 8, 6]} />
          </mesh>
          <pointLight position={[0, 1.4, 0.2]} color="#ffb060" intensity={2.2} distance={8} decay={1.5} />
        </group>
      ))}
      <hemisphereLight args={["#8a78c0", "#2a1f33", 0.55]} />
      <directionalLight position={[8, 7, -6]} color="#ffcf90" intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
    </group>
  );
};

export const HallInterior: React.FC<{ frame: number }> = ({ frame }) => {
  const fire = glowMat("hallfire");
  fire.color.set("#ff8a3d").multiplyScalar(1.4 + 0.2 * Math.sin(frame * 0.35));
  const win = glowMat("hallwin");
  win.color.set("#ffd29a").multiplyScalar(1.3);
  return (
    <group>
      <color attach="background" args={["#141019"]} />
      <fogExp2 attach="fog" args={["#1d1628", 0.035]} />
      <Room w={12} d={16} h={7} z={-3} wall="#8c8090" floor="#4e4038" />
      {/* steward's table on a dais, with a cloth and the court roll */}
      <mesh position={[0, 0.15, -8]} material={flat("#5a4840")} receiveShadow>
        <boxGeometry args={[8, 0.3, 3]} />
      </mesh>
      <mesh position={[0, 1.05, -8]} material={flat("#3e2c24")} castShadow receiveShadow>
        <boxGeometry args={[5, 0.12, 1.2]} />
      </mesh>
      <mesh position={[0, 0.98, -7.38]} material={flat("#5a2a3a")}>
        <boxGeometry args={[5, 0.6, 0.04]} />
      </mesh>
      <mesh position={[0.6, 1.13, -8]} material={flat("#e8dcc0")}>
        <boxGeometry args={[0.8, 0.02, 0.55]} />
      </mesh>
      {/* benches for the jurors */}
      {[-3.5, 3.5].map((x) => (
        <mesh key={x} position={[x, 0.45, -3.5]} rotation-y={Math.PI / 2} material={flat("#4a372c")} castShadow>
          <boxGeometry args={[4, 0.12, 0.45]} />
        </mesh>
      ))}
      {/* banner and windows */}
      <mesh position={[0, 4.8, -10.95]} material={flat("#7a1f2a")}>
        <planeGeometry args={[2.2, 2.8]} />
      </mesh>
      {[-4, 4].map((x) => (
        <mesh key={x} position={[x, 4.4, -10.95]} material={win}>
          <planeGeometry args={[0.8, 2.2]} />
        </mesh>
      ))}
      {/* the hearth */}
      <mesh position={[5.6, 0.3, -2]} material={fire}>
        <boxGeometry args={[0.6, 0.6, 1.4]} />
      </mesh>
      <pointLight position={[5, 1, -2]} color="#ff8a3d" intensity={4} distance={10} decay={1.4} />
      <hemisphereLight args={["#8a78c0", "#2a1f33", 0.6]} />
      <directionalLight position={[-6, 8, 2]} color="#ffcf90" intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
    </group>
  );
};

export const BarnInterior: React.FC = () => (
  <group>
    <color attach="background" args={["#120e16"]} />
    <fogExp2 attach="fog" args={["#1d1628", 0.05]} />
    <Room w={10} d={8} h={4} z={-1} wall="#5a4a48" floor="#6a5640" />
    {/* stall partitions and an empty manger */}
    {[-3, -0.5, 2, 4.5].map((x) => (
      <group key={x}>
        <mesh position={[x, 0.7, -3]} material={flat("#3a2b26")} castShadow>
          <boxGeometry args={[0.12, 1.4, 2.2]} />
        </mesh>
        <mesh position={[x, 1.6, -1.9]} material={flat("#3a2b26")} castShadow>
          <boxGeometry args={[0.15, 3.2, 0.15]} />
        </mesh>
      </group>
    ))}
    <mesh position={[0.75, 0.6, -4.6]} material={flat("#4a372c")} castShadow>
      <boxGeometry args={[7, 0.5, 0.6]} />
    </mesh>
    {/* the unused yoke hanging on the wall */}
    <mesh position={[0.75, 2.4, -4.85]} material={flat("#3a2b26")} castShadow>
      <boxGeometry args={[2.4, 0.16, 0.16]} />
    </mesh>
    {[-0.1, 1.6].map((x) => (
      <mesh key={x} position={[x, 2.15, -4.85]} material={flat("#3a2b26")}>
        <torusGeometry args={[0.22, 0.04, 4, 10, Math.PI]} />
      </mesh>
    ))}
    <Roof w={10} d={8} h={2} y={4} color="#3e3026" overhang={0} />
    <hemisphereLight args={["#8a78c0", "#2a1f33", 0.45]} />
    <spotLight position={[-3, 6, 3]} angle={0.5} penumbra={0.8} color="#ffcf90" intensity={30} castShadow />
  </group>
);

/** A dark stage with a soft spotlight pool: for graphic and "what if" montages. */
export const Stage: React.FC<{ tint?: string }> = ({ tint = "#ffb35c" }) => (
  <group>
    <color attach="background" args={["#0e0b14"]} />
    <fogExp2 attach="fog" args={["#140f1c", 0.06]} />
    <mesh rotation-x={-Math.PI / 2} material={flat("#2a2234")} receiveShadow>
      <planeGeometry args={[80, 80]} />
    </mesh>
    <hemisphereLight args={["#6a5a9a", "#120e18", 0.5]} />
    <spotLight position={[0, 9, 3]} angle={0.85} penumbra={0.9} color={tint} intensity={70} castShadow />
    <pointLight position={[0, 2.5, 4]} color="#b9a6e8" intensity={6} distance={14} decay={1.2} />
  </group>
);
