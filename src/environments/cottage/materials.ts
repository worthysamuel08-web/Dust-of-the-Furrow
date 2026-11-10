import { useMemo } from "react";
import * as THREE from "three";
import {
  daubTexture,
  earthTexture,
  radialTexture,
  strawTickTexture,
  thatchTexture,
  woodTexture,
  woolTexture,
} from "../../engine/textures";

/**
 * All cottage materials, created once. Lambert shading only — far cheaper than
 * PBR (MeshStandardMaterial) on older integrated GPUs and looks right for a
 * stylised, matte, smoky interior.
 */
export const useCottageMaterials = () =>
  useMemo(() => {
    const lambert = (p: THREE.MeshLambertMaterialParameters) =>
      new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, ...p });

    const daub = daubTexture();
    daub.repeat.set(0.55, 0.55); // ShapeGeometry UVs are in metres → ~1.8 m per tile

    const earth = earthTexture();
    earth.repeat.set(3, 2.5);

    const thatch = thatchTexture();
    thatch.repeat.set(4, 2);

    const tick = strawTickTexture();
    const wool = woolTexture();
    wool.repeat.set(1.5, 1.5);

    return {
      daub: lambert({ map: daub, color: "#d9ccb4" }),
      earth: lambert({ map: earth, color: "#cfc2b0", side: THREE.FrontSide }),
      thatch: lambert({ map: thatch, color: "#b8a68e" }),
      timber: lambert({ map: woodTexture(11, "dark"), color: "#b9a690" }),
      timberMid: lambert({ map: woodTexture(17, "mid"), color: "#c9b59c" }),
      plank: lambert({ map: woodTexture(23, "light"), color: "#bba78f" }),
      tick: lambert({ map: tick, color: "#d8cdb6" }),
      wool: lambert({ map: wool, color: "#e6d8c2" }),
      stone: lambert({ color: "#6f6a62" }),
      stoneDark: lambert({ color: "#4f4a44" }),
      ash: lambert({ color: "#3b3836", map: radialTexture("ash", "#7a7570", "#2a2624") }),
      charcoal: lambert({ color: "#1d1915" }),
      iron: lambert({ color: "#2f2e2c" }),
      clay: lambert({ color: "#9a5f3c" }),
      clayDark: lambert({ color: "#6e4129" }),
      bread: lambert({ color: "#8a5f33" }),
      cloak: lambert({ color: "#4e5340" }),
      herbs: lambert({ color: "#5d6b3c" }),
      onion: lambert({ color: "#a67a45" }),
      wicker: lambert({ map: thatchTexture(31), color: "#e2c9a0" }),
      rope: lambert({ color: "#6d5a3c" }),
    };
  }, []);

export type CottageMaterials = ReturnType<typeof useCottageMaterials>;
