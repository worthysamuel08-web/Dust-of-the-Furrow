/**
 * Face for the silhouette look: white features on a solid black head.
 * Driven by exactly the same FacePose as the ink look.
 */
import { clamp, lerp } from "../../../engine/animation";
import { DIMENSIONS, type FacePose } from "../rig";
import { Fill, Stroke, ellipsePts, quadPts, type P2 } from "../shapes2d";
import { useSil } from "./materials";

const R = DIMENSIONS.headRadius;

const Eye: React.FC<{ x: number; y: number; open: number; scale: number; lookX: number; lookY: number; lidTilt: number }> = ({
  x,
  y,
  open,
  scale,
  lookX,
  lookY,
  lidTilt,
}) => {
  const m = useSil();
  const rx = R * 0.12 * scale;
  const ry = R * 0.165 * scale;
  const o = clamp(open, 0, 1.1);
  if (o < 0.12) {
    // closed: a soft white arc
    return (
      <Stroke
        pts={quadPts([x - rx * 1.1, y - ry * 0.1], [x, y - ry * 0.7], [x + rx * 1.1, y - ry * 0.1], 10)}
        width={R * 0.06}
        material={m.feature}
        z={0.002}
      />
    );
  }
  // pupil follows the gaze, kept inside the eye
  const px = x + clamp(lookX, -1, 1) * rx * 0.42;
  const py = y - ry * 0.12 + clamp(lookY, -1, 1) * ry * 0.3;
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
      <Fill pts={ellipsePts(px, py, rx * 0.5, rx * 0.55, 16)} material={m.pupil} z={0.003} />
      {o < 0.98 ? <Fill pts={lid} material={m.body} z={0.004} /> : null}
    </group>
  );
};

const Brow: React.FC<{ x: number; y: number; raise: number; tilt: number; innerIsRight: boolean; scale: number }> = ({
  x,
  y,
  raise,
  tilt,
  innerIsRight,
  scale,
}) => {
  const m = useSil();
  const half = R * 0.16 * scale;
  const by = y + raise * R * 0.12;
  const innerLift = tilt * R * 0.1;
  const inner: P2 = [x + (innerIsRight ? half : -half), by + innerLift];
  const outer: P2 = [x + (innerIsRight ? -half : half), by - innerLift * 0.3];
  return <Stroke pts={[outer, inner]} width={R * 0.085} material={m.feature} z={0.005} />;
};

const Mouth: React.FC<{ x: number; y: number; smile: number; open: number; width: number; turn: number }> = ({
  x,
  y,
  smile,
  open,
  width,
  turn,
}) => {
  const m = useSil();
  const w = width * R * 1.05 * (1 - Math.abs(turn) * 0.2);
  const curve = smile * R * 0.1;
  const l: P2 = [x - w / 2, y + curve];
  const r: P2 = [x + w / 2, y + curve];
  if (open < 0.06) {
    return <Stroke pts={quadPts(l, [x, y - curve], r, 12)} width={R * 0.07} material={m.feature} z={0.002} />;
  }
  // open mouth: white shape with a dark inside, like the reference's "O" mouths
  const depth = open * R * 0.45;
  const ow = lerp(w, w * 0.75, open);
  const top = quadPts([x - ow / 2, y + curve], [x, y - curve + depth * 0.2], [x + ow / 2, y + curve], 10);
  const bottom = quadPts([x + ow / 2, y + curve], [x, y - curve - depth * 1.6], [x - ow / 2, y + curve], 10);
  const outline = [...top, ...bottom.slice(1, -1)];
  const cx = x;
  const cy = y + curve - depth * 0.4;
  const inner = outline.map(([px, py]) => [cx + (px - cx) * 0.62, cy + (py - cy) * 0.55] as P2);
  return (
    <group>
      <Fill pts={outline} material={m.feature} z={0.002} />
      {open > 0.25 ? <Fill pts={inner} material={m.pupil} z={0.003} /> : null}
    </group>
  );
};

export const SilhouetteFace: React.FC<{ face: FacePose; turn: number }> = ({ face, turn }) => {
  const fx = turn * R * 0.42;
  const spacing = R * 0.5 * (1 - Math.abs(turn) * 0.28);
  const farScaleL = turn > 0 ? 1 - turn * 0.14 : 1;
  const farScaleR = turn < 0 ? 1 + turn * 0.14 : 1;
  const eyeY = R * 0.08;
  const lx = fx - spacing / 2;
  const rx = fx + spacing / 2;
  return (
    <group>
      <Eye x={lx} y={eyeY} open={face.eyeOpenL} scale={farScaleL} lookX={face.lookX} lookY={face.lookY} lidTilt={face.browTiltL} />
      <Eye x={rx} y={eyeY} open={face.eyeOpenR} scale={farScaleR} lookX={face.lookX} lookY={face.lookY} lidTilt={-face.browTiltR} />
      <Brow x={lx} y={R * 0.4} raise={face.browRaiseL} tilt={face.browTiltL} innerIsRight scale={farScaleL} />
      <Brow x={rx} y={R * 0.4} raise={face.browRaiseR} tilt={face.browTiltR} innerIsRight={false} scale={farScaleR} />
      <Mouth x={fx + turn * R * 0.06} y={-R * 0.45} smile={face.mouthSmile} open={face.mouthOpen} width={face.mouthWidth} turn={turn} />
    </group>
  );
};
