/**
 * <Cottage> — interior of a poor villein's cottage, English manor c. 1320.
 * Reusable: drive `sun` (0..1) and `ember` (0..1) from any scene timeline.
 */
import { Furnishings } from "./Furnishings";
import { CottageLighting } from "./Lighting";
import { useCottageMaterials } from "./materials";
import { Structure } from "./Structure";

export type CottageProps = {
  frame: number;
  sun: number;
  ember?: number;
  /** Set false to provide your own lights. */
  withLighting?: boolean;
};

export const Cottage: React.FC<CottageProps> = ({ frame, sun, ember = 0.8, withLighting = true }) => {
  const m = useCottageMaterials();
  return (
    <group>
      <Structure m={m} />
      <Furnishings m={m} ember={ember} />
      {withLighting ? <CottageLighting frame={frame} sun={sun} ember={ember} /> : null}
    </group>
  );
};

export * from "./layout";
