/**
 * Face for the silhouette look: white features on a solid black head, styled
 * after the reference films: gleaming pupils, thin expressive brows, ^ ^ happy
 * eyes, huge "O O" shock eyes, tear streaks and sweat drops, thin mouths that
 * open into "D" laughs and "o" gasps. Driven by FacePose (optional extras:
 * happyEyes, pupil, tears, sweat).
 */
import { clamp, lerp } from "../../../engine/animation";
import { DIMENSIONS, type FacePose } from "../rig";
import { Fill, Stroke, ellipsePts, quadPts, type P2 } from "../shapes2d";
import { useSil } from "./materials";

const R = DIMENSIONS.headRadius;
const LINE = R * 0.055;

const Eye: React.FC<{
  x: number;
  y: number;
  open: number;
  scale: number;
  lookX: number;
  lookY: number;
  lidTilt: number;
  happy: number;
  pupil: number;
}> = ({ x, y, open, scale, lookX, lookY, lidTilt, happy, pupil }) => {
  const m = useSil();
  const rx = R * 0.13 * scale * (1 + Math.max(0, open - 1) * 0.6);
  const ry = R * 0.17 * scale * (1 + Math.max(0, open - 1) * 0.6);
  const o = clamp(open, 0, 1.4);
  if (happy > 0.5) {
    // ^ ^ : an upward arc
    return <Stroke pts={quadPts([x - rx * 1.1, y - ry * 0.25], [x, y + ry * 0.9], [x + rx * 1.1, y - ry * 0.25], 10)} width={LINE * 1.1} material={m.feature} z={0.002} />;
  }
  if (o < 0.12) {
    // closed: a soft downward arc
    return <Stroke pts={quadPts([x - rx * 1.1, y - ry * 0.05], [x, y - ry * 0.65], [x + rx * 1.1, y - ry * 0.05], 10)} width={LINE} material={m.feature} z={0.002} />;
  }
  const pr = rx * clamp(pupil, 0.2, 0.75);
  const px = x + clamp(lookX, -1, 1) * (rx - pr) * 0.75;
  const py = y - ry * 0.1 + clamp(lookY, -1, 1) * (ry - pr) * 0.6;
  // the upper lid is a black shape cutting into the white from above (tired / squinting)
  const lidY = y + ry - ry * 2 * (1 - Math.min(1, o)) * 0.85;
  const tilt = lidTilt * ry * 0.5;
  const lid: P2[] = [
    [x - rx * 1.4, lidY - tilt],
    [x + rx * 1.4, lidY + tilt],
    [x + rx * 1.4, y + ry * 1.6],
    [x - rx * 1.4, y + ry * 1.6],
  ];
  return (
    <group>
      <Fill pts={ellipsePts(x, y, rx, ry, 24)} material={m.feature} z={0.002} />
      <Fill pts={ellipsePts(px, py, pr, pr * 1.08, 16)} material={m.pupil} z={0.003} />
      {/* the gleam */}
      <Fill pts={ellipsePts(px + pr * 0.38, py + pr * 0.42, pr * 0.32, pr * 0.32, 10)} material={m.feature} z={0.0035} />
      {o < 0.98 ? <Fill pts={lid} material={m.body} z={0.004} /> : null}
    </group>
  );
};

const Brow: React.FC<{ x: number; y: number; raise: number; tilt: number; innerIsRight: boolean; scale: number }> = ({ x, y, raise, tilt, innerIsRight, scale }) => {
  const m = useSil();
  const half = R * 0.15 * scale;
  const by = y + raise * R * 0.16;
  const innerLift = tilt * R * 0.13;
  const inner: P2 = [x + (innerIsRight ? half : -half), by + innerLift];
  const outer: P2 = [x + (innerIsRight ? -half : half), by - innerLift * 0.35];
  const arch = R * 0.05 * (1 - Math.abs(tilt) * 0.6);
  const mid: P2 = [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 + arch];
  return <Stroke pts={quadPts(outer, mid, inner, 8)} width={LINE * 0.95} material={m.feature} z={0.005} />;
};

const Mouth: React.FC<{ x: number; y: number; smile: number; open: number; width: number; turn: number }> = ({ x, y, smile, open, width, turn }) => {
  const m = useSil();
  const w = width * R * 1.05 * (1 - Math.abs(turn) * 0.2);
  const curve = smile * R * 0.11;
  const l: P2 = [x - w / 2, y + curve];
  const r: P2 = [x + w / 2, y + curve];
  if (open < 0.06) {
    return <Stroke pts={quadPts(l, [x, y - curve], r, 12)} width={LINE} material={m.feature} z={0.002} />;
  }
  const depth = open * R * 0.5;
  // a laughing "D" when smiling, a round "o" otherwise
  const laugh = smile > 0.25;
  const ow = laugh ? w * (1.05 + open * 0.2) : lerp(w, w * 0.55, Math.min(1, open * 1.2));
  const topY = laugh ? y + curve * 0.6 : y + depth * 0.35;
  const top = quadPts([x - ow / 2, topY], [x, laugh ? topY + R * 0.01 : topY + depth * 0.3], [x + ow / 2, topY], 10);
  const bottom = quadPts([x + ow / 2, topY], [x, topY - depth * (laugh ? 1.9 : 1.7)], [x - ow / 2, topY], 12);
  const outline = [...top, ...bottom.slice(1, -1)];
  const cx = x;
  const cy = topY - depth * 0.55;
  const inner = outline.map(([px, py]) => [cx + (px - cx) * 0.7, cy + (py - cy) * 0.6] as P2);
  return (
    <group>
      <Fill pts={outline} material={m.feature} z={0.002} />
      {open > 0.2 ? <Fill pts={inner} material={m.pupil} z={0.003} /> : null}
      {laugh && open > 0.3 ? <Fill pts={[[cx - ow * 0.3, topY - depth * 0.08], [cx + ow * 0.3, topY - depth * 0.08], [cx + ow * 0.28, topY - depth * 0.3], [cx - ow * 0.28, topY - depth * 0.3]]} material={m.feature} z={0.0035} /> : null}
    </group>
  );
};

/** Tear streak running down from the lower lid. */
const Tear: React.FC<{ x: number; y: number; amount: number }> = ({ x, y, amount }) => {
  const m = useSil();
  if (amount < 0.05) return null;
  const len = R * 0.55 * amount;
  return (
    <group>
      <Stroke pts={quadPts([x, y], [x + R * 0.03, y - len * 0.5], [x - R * 0.01, y - len], 8)} width={LINE * 0.8} material={m.feature} z={0.0045} />
      <Fill pts={ellipsePts(x - R * 0.01, y - len - R * 0.03, R * 0.035, R * 0.05, 10)} material={m.feature} z={0.0045} />
    </group>
  );
};

/** A sweat drop on the side of the head. */
const Sweat: React.FC<{ amount: number; side: number }> = ({ amount, side }) => {
  const m = useSil();
  if (amount < 0.05) return null;
  const s = amount;
  const x = -side * R * 0.68;
  const y = R * 0.45;
  const drop: P2[] = [[x, y + R * 0.13 * s], [x + R * 0.06 * s, y - R * 0.02 * s], [x, y - R * 0.08 * s], [x - R * 0.06 * s, y - R * 0.02 * s]];
  return <Fill pts={drop} material={m.feature} z={0.005} />;
};

export const SilhouetteFace: React.FC<{ face: FacePose; turn: number }> = ({ face, turn }) => {
  const fx = turn * R * 0.42;
  const spacing = R * 0.52 * (1 - Math.abs(turn) * 0.28);
  const farScaleL = turn > 0 ? 1 - turn * 0.14 : 1;
  const farScaleR = turn < 0 ? 1 + turn * 0.14 : 1;
  const eyeY = R * 0.08;
  const lx = fx - spacing / 2;
  const rx = fx + spacing / 2;
  const happy = face.happyEyes ?? 0;
  const pupil = face.pupil ?? 0.5;
  const tears = face.tears ?? 0;
  return (
    <group>
      <Eye x={lx} y={eyeY} open={face.eyeOpenL} scale={farScaleL} lookX={face.lookX} lookY={face.lookY} lidTilt={face.browTiltL} happy={happy} pupil={pupil} />
      <Eye x={rx} y={eyeY} open={face.eyeOpenR} scale={farScaleR} lookX={face.lookX} lookY={face.lookY} lidTilt={-face.browTiltR} happy={happy} pupil={pupil} />
      <Brow x={lx} y={R * 0.42} raise={face.browRaiseL} tilt={face.browTiltL} innerIsRight scale={farScaleL} />
      <Brow x={rx} y={R * 0.42} raise={face.browRaiseR} tilt={face.browTiltR} innerIsRight={false} scale={farScaleR} />
      <Tear x={lx} y={eyeY - R * 0.16} amount={tears} />
      <Tear x={rx} y={eyeY - R * 0.16} amount={tears * 0.85} />
      <Sweat amount={face.sweat ?? 0} side={turn >= 0 ? 1 : -1} />
      <Mouth x={fx + turn * R * 0.06} y={-R * 0.45} smile={face.mouthSmile} open={face.mouthOpen} width={face.mouthWidth} turn={turn} />
    </group>
  );
};
