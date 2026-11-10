import { useMemo } from "react";
import { clamp, lerp } from "../../engine/animation";
import { DIMENSIONS, earVisibility, type FacePose } from "./rig";
import { Fill, Stroke, ellipsePts, quadPts, useInk, type P2 } from "./shapes2d";
import { seededRandom } from "../../engine/animation";

const R = DIMENSIONS.headRadius;
const LINE = R * 0.06;

/** One eye. Openness lowers the upper lid; below ~0.12 it becomes a closed-lid curve. */
const Eye: React.FC<{ x: number; y: number; open: number; scale: number; lookX: number; lookY: number }> = ({
  x,
  y,
  open,
  scale,
  lookX,
  lookY,
}) => {
  const ink = useInk();
  const rx = R * 0.085 * scale;
  const ry = R * 0.135 * scale;
  const o = clamp(open, 0, 1.15);
  if (o < 0.12) {
    // closed: gentle downward arc (sleeping / blinking)
    const pts = quadPts([x - rx * 1.5, y - ry * 0.15], [x, y - ry * 0.85], [x + rx * 1.5, y - ry * 0.15], 10);
    return <Stroke pts={pts} width={LINE * 0.9} material={ink.line} z={0.002} />;
  }
  const px = x + lookX * R * 0.05;
  const py = y + lookY * R * 0.04;
  const h = ry * o;
  const cy = py - ry + h; // lid comes down from the top, the bottom of the eye stays put
  return (
    <group>
      <Fill pts={ellipsePts(px, cy, rx, h, 20)} material={ink.line} z={0.002} />
      {o > 0.45 ? (
        <Fill pts={ellipsePts(px + rx * 0.35, cy + h * 0.35, rx * 0.32, rx * 0.32, 10)} material={ink.shine} z={0.003} />
      ) : null}
      {o < 0.85 ? (
        // heavy upper lid line for a tired, half-lidded look
        <Stroke
          pts={quadPts([px - rx * 1.45, cy + h * 0.8], [px, cy + h * 1.25], [px + rx * 1.45, cy + h * 0.8], 8)}
          width={LINE * 0.8}
          material={ink.line}
          z={0.003}
        />
      ) : null}
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
  const ink = useInk();
  const half = R * 0.17 * scale;
  const by = y + raise * R * 0.12;
  const innerLift = tilt * R * 0.09;
  const inner: P2 = [x + (innerIsRight ? half : -half), by + innerLift];
  const outer: P2 = [x + (innerIsRight ? -half : half), by - innerLift * 0.4];
  const ctrl: P2 = [(inner[0] + outer[0]) / 2, Math.max(inner[1], outer[1]) + R * 0.035];
  return <Stroke pts={quadPts(outer, ctrl, inner, 8)} width={LINE * 1.15} material={ink.line} z={0.002} />;
};

const Mouth: React.FC<{ x: number; y: number; smile: number; open: number; width: number; turn: number }> = ({
  x,
  y,
  smile,
  open,
  width,
  turn,
}) => {
  const ink = useInk();
  const w = width * R * (1 - Math.abs(turn) * 0.2);
  const curve = smile * R * 0.09;
  // corners rise with a smile; the middle stays roughly put
  const l: P2 = [x - w / 2, y + curve];
  const r: P2 = [x + w / 2, y + curve];
  if (open < 0.06) {
    return <Stroke pts={quadPts(l, [x, y - curve], r, 12)} width={LINE} material={ink.line} z={0.002} />;
  }
  const depth = open * R * 0.42;
  const ow = lerp(w, w * 0.7, open); // yawning narrows the mouth into an oval
  const top = quadPts([x - ow / 2, y + curve], [x, y - curve + depth * 0.25], [x + ow / 2, y + curve], 10);
  const bottom = quadPts([x + ow / 2, y + curve], [x, y - curve - depth * 1.6], [x - ow / 2, y + curve], 10);
  const outline = [...top, ...bottom.slice(1, -1)];
  return (
    <group>
      <Fill pts={outline} material={ink.line} z={0.002} />
      {open > 0.5 ? (
        // tongue
        <Fill
          pts={ellipsePts(x, y - depth * 0.55, ow * 0.25, depth * 0.18, 12)}
          material={ink.clothPatch}
          z={0.003}
        />
      ) : null}
    </group>
  );
};

/** Face features drawn on top of the head disc (head-local space, head centre = origin). */
export const Face: React.FC<{ face: FacePose; turn: number }> = ({ face, turn }) => {
  const ink = useInk();
  const fx = turn * R * 0.42; // whole face slides across the head to fake a 3/4 turn
  const spacing = R * 0.46 * (1 - Math.abs(turn) * 0.28);
  const farScaleL = turn > 0 ? 1 - turn * 0.12 : 1;
  const farScaleR = turn < 0 ? 1 + turn * 0.12 : 1;
  const eyeY = R * 0.1;
  const lx = fx - spacing / 2;
  const rx = fx + spacing / 2;

  const earV = earVisibility(turn);
  const earX = -Math.sign(turn) * R * 0.62 + fx * 0.2;

  const stubble = useMemo(() => {
    const rnd = seededRandom(42);
    return Array.from({ length: 16 }, () => [(rnd() - 0.5) * 1.1, -0.45 - rnd() * 0.4, 0.008 + rnd() * 0.006] as const);
  }, []);

  return (
    <group>
      {/* ear on the far side of the face */}
      {earV > 0.01 ? (
        <group position={[earX, -R * 0.02, 0.001]} scale={[earV, earV, 1]}>
          <Stroke
            pts={quadPts([0, R * 0.12], [-Math.sign(turn) * R * 0.2, 0], [0, -R * 0.12], 8)}
            width={LINE * 0.9}
            material={ink.line}
          />
          <Stroke
            pts={quadPts([0, R * 0.05], [-Math.sign(turn) * R * 0.07, 0], [0, -R * 0.04], 6)}
            width={LINE * 0.6}
            material={ink.line}
          />
        </group>
      ) : null}

      {/* stubble */}
      {stubble.map(([sx, sy, r], i) => {
        const px = fx * 0.8 + sx * R * 0.55;
        const py = sy * R;
        if (px * px + py * py > R * R * 0.8) return null;
        return <Fill key={i} pts={ellipsePts(px, py, r * R * 0.5, r * R * 0.5, 6)} material={ink.stubble} z={0.0015} />;
      })}

      <Eye x={lx} y={eyeY} open={face.eyeOpenL} scale={farScaleL} lookX={face.lookX} lookY={face.lookY} />
      <Eye x={rx} y={eyeY} open={face.eyeOpenR} scale={farScaleR} lookX={face.lookX} lookY={face.lookY} />
      <Brow x={lx} y={R * 0.38} raise={face.browRaiseL} tilt={face.browTiltL} innerIsRight scale={farScaleL} />
      <Brow x={rx} y={R * 0.38} raise={face.browRaiseR} tilt={face.browTiltR} innerIsRight={false} scale={farScaleR} />

      {/* nose: a small hook pointing the way the face is turned */}
      <Stroke
        pts={quadPts(
          [fx + turn * R * 0.12, R * 0.02],
          [fx + turn * R * 0.32 + R * 0.01, -R * 0.13],
          [fx + turn * R * 0.08 - R * 0.02 * (1 - Math.abs(turn)), -R * 0.2],
          8,
        )}
        width={LINE * 0.85}
        material={ink.line}
        z={0.002}
      />

      <Mouth
        x={fx + turn * R * 0.06}
        y={-R * 0.45}
        smile={face.mouthSmile}
        open={face.mouthOpen}
        width={face.mouthWidth}
        turn={turn}
      />
    </group>
  );
};
