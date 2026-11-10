/**
 * Procedural, seeded canvas textures. Generated once per page (cached), fully
 * deterministic, no image downloads, small sizes for older GPUs.
 */
import * as THREE from "three";
import { seededRandom } from "./animation";

type Painter = (ctx: CanvasRenderingContext2D, size: number, rnd: () => number) => void;

const cache = new Map<string, THREE.CanvasTexture>();

export function makeTexture(
  key: string,
  painter: Painter,
  { size = 256, seed = 1, repeat = [1, 1] as [number, number], color = true } = {},
): THREE.CanvasTexture {
  const id = `${key}:${seed}:${size}:${repeat.join("x")}`;
  const hit = cache.get(id);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  painter(ctx, size, seededRandom(seed));
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.anisotropy = 2;
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(id, tex);
  return tex;
}

// ----- helpers --------------------------------------------------------------

const blotches = (
  ctx: CanvasRenderingContext2D,
  size: number,
  rnd: () => number,
  count: number,
  colors: string[],
  rMin: number,
  rMax: number,
  alpha: number,
) => {
  for (let i = 0; i < count; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = rMin + rnd() * (rMax - rMin);
    ctx.globalAlpha = alpha * (0.4 + rnd() * 0.6);
    ctx.fillStyle = colors[Math.floor(rnd() * colors.length)];
    // draw wrapped so the texture tiles seamlessly
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        ctx.beginPath();
        ctx.ellipse(x + dx, y + dy, r, r * (0.6 + rnd() * 0.5), rnd() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;
};

const strokes = (
  ctx: CanvasRenderingContext2D,
  size: number,
  rnd: () => number,
  count: number,
  colors: string[],
  len: [number, number],
  angle: [number, number],
  width: [number, number],
  alpha: number,
) => {
  ctx.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const l = len[0] + rnd() * (len[1] - len[0]);
    const a = angle[0] + rnd() * (angle[1] - angle[0]);
    ctx.strokeStyle = colors[Math.floor(rnd() * colors.length)];
    ctx.lineWidth = width[0] + rnd() * (width[1] - width[0]);
    ctx.globalAlpha = alpha * (0.5 + rnd() * 0.5);
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        ctx.beginPath();
        ctx.moveTo(x + dx, y + dy);
        ctx.lineTo(x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
};

// ----- materials' textures ------------------------------------------------

/** Lime-washed wattle-and-daub with cracks and patches where the daub has fallen away. */
export const daubTexture = (seed = 3) =>
  makeTexture(
    "daub",
    (ctx, s, rnd) => {
      ctx.fillStyle = "#b8a688";
      ctx.fillRect(0, 0, s, s);
      blotches(ctx, s, rnd, 260, ["#a8946f", "#c4b394", "#9d8a68", "#cbbd9f"], 6, 30, 0.35);
      blotches(ctx, s, rnd, 500, ["#8f7c5c", "#d2c5a8"], 1, 4, 0.5);
      // exposed wattle (woven hazel rods) in a couple of spots
      for (let p = 0; p < 2; p++) {
        const cx = rnd() * s * 0.8 + s * 0.1;
        const cy = rnd() * s * 0.8 + s * 0.1;
        const w = 16 + rnd() * 16;
        const h = 12 + rnd() * 12;
        // ragged outline where the daub has crumbled away
        const outline: [number, number][] = [];
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * Math.PI * 2;
          const r = 0.6 + rnd() * 0.5;
          outline.push([cx + Math.cos(a) * w * r, cy + Math.sin(a) * h * r]);
        }
        ctx.save();
        ctx.beginPath();
        outline.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = "#4a3828";
        ctx.fillRect(cx - w, cy - h, w * 2, h * 2);
        for (let y = cy - h; y < cy + h; y += 7) {
          ctx.strokeStyle = (y / 7) % 2 < 1 ? "#7a5e3e" : "#6a5034";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(cx - w, y);
          for (let x = cx - w; x < cx + w; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.3) * 1.5);
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = "#6e5b42";
        ctx.lineWidth = 2;
        ctx.beginPath();
        outline.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // hairline cracks
      ctx.strokeStyle = "#6f5f45";
      for (let i = 0; i < 14; i++) {
        let x = rnd() * s;
        let y = rnd() * s;
        ctx.lineWidth = 0.6 + rnd();
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 6; j++) {
          x += (rnd() - 0.5) * 22;
          y += rnd() * 14;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // soot staining towards the top (smoke from the open hearth)
      const g = ctx.createLinearGradient(0, 0, 0, s);
      g.addColorStop(0, "rgba(40,30,20,0.25)");
      g.addColorStop(0.5, "rgba(40,30,20,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
    },
    { size: 512, seed },
  );

/** Beaten-earth floor strewn with rushes and straw. */
export const earthTexture = (seed = 7) =>
  makeTexture(
    "earth",
    (ctx, s, rnd) => {
      ctx.fillStyle = "#4e3d2b";
      ctx.fillRect(0, 0, s, s);
      blotches(ctx, s, rnd, 350, ["#5b4733", "#433324", "#625039", "#3a2c1f"], 8, 40, 0.35);
      blotches(ctx, s, rnd, 900, ["#2f2418", "#6d5a42"], 0.8, 3, 0.6);
      strokes(ctx, s, rnd, 180, ["#a08850", "#8a7444", "#b39a5e", "#6f6038"], [12, 40], [0, Math.PI], [1, 2.4], 0.65);
    },
    { size: 512, seed },
  );

/** Rough adzed oak/elm with grain running along U. */
export const woodTexture = (seed = 11, tone: "dark" | "mid" | "light" = "mid") =>
  makeTexture(
    `wood-${tone}`,
    (ctx, s, rnd) => {
      const base = { dark: "#3b2a1c", mid: "#5a4129", light: "#7a5c3b" }[tone];
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 70; i++) {
        const y = rnd() * s;
        ctx.strokeStyle = rnd() > 0.5 ? "rgba(20,12,6,0.35)" : "rgba(150,110,70,0.18)";
        ctx.lineWidth = 0.6 + rnd() * 2.2;
        ctx.beginPath();
        const amp = 1 + rnd() * 3;
        const f = 0.01 + rnd() * 0.03;
        const ph = rnd() * 10;
        for (let x = -2; x <= s + 2; x += 4) {
          const yy = y + Math.sin(x * f + ph) * amp;
          if (x === -2) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      // knots and adze marks
      for (let i = 0; i < 4; i++) {
        const x = rnd() * s;
        const y = rnd() * s;
        ctx.fillStyle = "rgba(25,15,8,0.5)";
        ctx.beginPath();
        ctx.ellipse(x, y, 4 + rnd() * 5, 2 + rnd() * 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      blotches(ctx, s, rnd, 60, ["#00000022", "#ffffff10"], 10, 30, 0.6);
    },
    { size: 256, seed },
  );

/** Underside of an old, smoke-darkened thatch. */
export const thatchTexture = (seed = 5) =>
  makeTexture(
    "thatch",
    (ctx, s, rnd) => {
      ctx.fillStyle = "#2c2116";
      ctx.fillRect(0, 0, s, s);
      strokes(
        ctx,
        s,
        rnd,
        1400,
        ["#5b4626", "#6e5630", "#4a381f", "#806539", "#3b2c18"],
        [18, 60],
        [Math.PI / 2 - 0.25, Math.PI / 2 + 0.25],
        [1, 2.6],
        0.85,
      );
      // horizontal sways / binding rods
      for (let y = 0; y < s; y += s / 4) {
        ctx.strokeStyle = "#23180e";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, y + 10);
        ctx.lineTo(s, y + 10);
        ctx.stroke();
      }
    },
    { size: 256, seed },
  );

/** Coarse linen ticking stuffed with straw (the mattress). */
export const strawTickTexture = (seed = 9) =>
  makeTexture(
    "tick",
    (ctx, s, rnd) => {
      ctx.fillStyle = "#9a8762";
      ctx.fillRect(0, 0, s, s);
      // weave
      ctx.globalAlpha = 0.18;
      for (let i = 0; i < s; i += 3) {
        ctx.fillStyle = i % 6 === 0 ? "#6d5d40" : "#b8a67e";
        ctx.fillRect(i, 0, 1, s);
        ctx.fillRect(0, i, s, 1);
      }
      ctx.globalAlpha = 1;
      blotches(ctx, s, rnd, 80, ["#7b6a4a", "#8a6f45", "#ab9a74"], 8, 26, 0.3);
      // straw poking through
      strokes(ctx, s, rnd, 120, ["#c9a85c", "#b8954a", "#dcc078"], [6, 20], [0, Math.PI * 2], [1, 1.8], 0.8);
    },
    { size: 256, seed },
  );

/** Coarse undyed wool coverlet. */
export const woolTexture = (seed = 13) =>
  makeTexture(
    "wool",
    (ctx, s, rnd) => {
      ctx.fillStyle = "#6b5f52";
      ctx.fillRect(0, 0, s, s);
      ctx.globalAlpha = 0.22;
      for (let i = 0; i < s; i += 4) {
        ctx.fillStyle = (i / 4) % 2 ? "#4f453b" : "#857868";
        ctx.fillRect(i, 0, 2, s);
      }
      ctx.globalAlpha = 1;
      blotches(ctx, s, rnd, 120, ["#5a5046", "#7a6e60", "#4a4038"], 6, 24, 0.35);
    },
    { size: 256, seed },
  );

/** Soft radial blob (contact shadows, glow sprites). Used as alphaMap / map. */
export const radialTexture = (key = "radial", inner = "#ffffff", outer = "#000000") =>
  makeTexture(
    key,
    (ctx, s) => {
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, inner);
      g.addColorStop(1, outer);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
    },
    { size: 128, color: false },
  );

/** Alpha map for the light shaft: fades along length (V) and at the edges (U). */
export const shaftTexture = () =>
  makeTexture(
    "shaft",
    (ctx, s) => {
      const img = ctx.createImageData(s, s);
      for (let y = 0; y < s; y++) {
        const v = y / (s - 1); // 0 = window, 1 = far end
        const along = Math.pow(1 - v, 1.4) * Math.min(1, v * 12);
        for (let x = 0; x < s; x++) {
          const u = x / (s - 1);
          const edge = Math.sin(Math.PI * u) ** 1.5;
          const a = Math.round(255 * along * edge);
          const i = (y * s + x) * 4;
          img.data[i] = img.data[i + 1] = img.data[i + 2] = a;
          img.data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    },
    { size: 64, color: false },
  );
