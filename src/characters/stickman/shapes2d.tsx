/**
 * Flat 2D drawing primitives rendered as Three.js meshes in the XY plane.
 * This is what keeps the character genuinely 2D while it lives inside the 3D set.
 */
import { createContext, useContext, useEffect, useMemo } from "react";
import * as THREE from "three";

export type P2 = [number, number];

// ---- point generators -------------------------------------------------------

export const ellipsePts = (cx: number, cy: number, rx: number, ry: number, n = 28, rot = 0): P2[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
  });

/** Quadratic bezier sampled into points. */
export const quadPts = (p0: P2, c: P2, p1: P2, n = 12): P2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
  });

/** Chaikin corner-cutting: turns a rough polygon into a soft, hand-drawn-looking outline. */
export const smoothClosed = (pts: P2[], iterations = 2): P2[] => {
  let out = pts;
  for (let k = 0; k < iterations; k++) {
    const next: P2[] = [];
    for (let i = 0; i < out.length; i++) {
      const a = out[i];
      const b = out[(i + 1) % out.length];
      next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      next.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    out = next;
  }
  return out;
};

// ---- geometry builders --------------------------------------------------------

export function fillGeometry(pts: P2[]): THREE.BufferGeometry {
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  return new THREE.ShapeGeometry(shape, 1);
}

/** A constant-width ribbon along a polyline, with round caps on open paths. */
export function strokeGeometry(pts: P2[], width: number, closed = false): THREE.BufferGeometry {
  const hw = width / 2;
  const n = pts.length;
  const pos: number[] = [];
  const idx: number[] = [];
  const segNormal = (a: P2, b: P2): P2 => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  for (let i = 0; i < n; i++) {
    const prev = closed ? pts[(i - 1 + n) % n] : pts[Math.max(0, i - 1)];
    const next = closed ? pts[(i + 1) % n] : pts[Math.min(n - 1, i + 1)];
    const p = pts[i];
    const n1 = i > 0 || closed ? segNormal(prev, p) : segNormal(p, next);
    const n2 = i < n - 1 || closed ? segNormal(p, next) : n1;
    let mx = n1[0] + n2[0];
    let my = n1[1] + n2[1];
    const ml = Math.hypot(mx, my) || 1;
    mx /= ml;
    my /= ml;
    const scale = Math.min(2, 1 / Math.max(0.3, mx * n1[0] + my * n1[1]));
    pos.push(p[0] + mx * hw * scale, p[1] + my * hw * scale, 0, p[0] - mx * hw * scale, p[1] - my * hw * scale, 0);
  }
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    const b = ((i + 1) % n) * 2;
    idx.push(a, a + 1, b, a + 1, b + 1, b);
  }
  if (!closed) {
    for (const p of [pts[0], pts[n - 1]]) {
      const c = pos.length / 3;
      pos.push(p[0], p[1], 0);
      const seg = 10;
      for (let s = 0; s <= seg; s++) {
        const a = (s / seg) * Math.PI * 2;
        pos.push(p[0] + Math.cos(a) * hw, p[1] + Math.sin(a) * hw, 0);
        if (s > 0) idx.push(c, c + s, c + s + 1);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

// ---- materials context -------------------------------------------------------

export type InkMaterials = {
  line: THREE.Material;
  skin: THREE.MeshBasicMaterial;
  cloth: THREE.MeshBasicMaterial;
  clothDark: THREE.MeshBasicMaterial;
  clothPatch: THREE.MeshBasicMaterial;
  rope: THREE.MeshBasicMaterial;
  shine: THREE.MeshBasicMaterial;
  stubble: THREE.MeshBasicMaterial;
};

export const InkContext = createContext<InkMaterials | null>(null);
export const useInk = () => {
  const ctx = useContext(InkContext);
  if (!ctx) throw new Error("Stickman parts must be rendered inside <Stickman>");
  return ctx;
};

// ---- React primitives ------------------------------------------------------

const useDisposable = (geo: THREE.BufferGeometry) => {
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
};

/** Stable cache key for a point list (rounded to 0.1 mm). */
const keyOf = (pts: P2[], extra = "") => pts.map((p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`).join(";") + extra;

export const Fill: React.FC<{ pts: P2[]; material: THREE.Material; z?: number }> = ({ pts, material, z = 0 }) => {
  const key = keyOf(pts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geo = useDisposable(useMemo(() => fillGeometry(pts), [key]));
  return <mesh geometry={geo} material={material} position-z={z} />;
};

export const Stroke: React.FC<{
  pts: P2[];
  width: number;
  material: THREE.Material;
  closed?: boolean;
  z?: number;
}> = ({ pts, width, material, closed = false, z = 0 }) => {
  const key = keyOf(pts, `|${width}|${closed}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geo = useDisposable(useMemo(() => strokeGeometry(pts, width, closed), [key]));
  return <mesh geometry={geo} material={material} position-z={z} />;
};

/** Filled shape with an ink outline — the basic cartoon building block. */
export const Outlined: React.FC<{
  pts: P2[];
  material: THREE.Material;
  line: number;
  z?: number;
}> = ({ pts, material, line, z = 0 }) => {
  const ink = useInk();
  return (
    <group position-z={z}>
      <Fill pts={pts} material={material} />
      <Stroke pts={pts} width={line} material={ink.line} closed z={0.0006} />
    </group>
  );
};
