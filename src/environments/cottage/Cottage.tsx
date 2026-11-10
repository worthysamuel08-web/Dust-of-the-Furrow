/**
 * <Cottage> — interior of a poor villein's cottage, English manor c. 1320.
 * Reusable: drive `sun` (0..1) and `ember` (0..1) from any scene timeline.
 */
import { Furnishings } from "./Furnishings";
import { CottageLighting } from "./Lighting";
import { useCottageMaterials, type CottageLook } from "./materials";
import { Structure } from "./Structure";

export type CottageProps = {
  frame: number;
  sun: number;
  ember?: number;
  /** Set false to provide your own lights. */
  withLighting?: boolean;
  /** "textured" (Scenes 1–2) or "stylized" (flat shapes, purple/amber palette). */
  look?: CottageLook;
};

export const Cottage: React.FC<CottageProps> = ({ frame, sun, ember = 0.8, withLighting = true, look = "textured" }) => {
  const m = useCottageMaterials(look);
  return (
    <group>
      <Structure m={m} />
      <Furnishings m={m} ember={ember} />
      {withLighting ? <CottageLighting frame={frame} sun={sun} ember={ember} look={look} /> : null}
    </group>
  );
};

export * from "./layout";
