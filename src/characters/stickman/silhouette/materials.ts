import { createContext, useContext } from "react";
import type * as THREE from "three";

/** Materials used by the silhouette look. In the rim pass, every entry is the rim material. */
export type SilMaterials = {
  body: THREE.MeshBasicMaterial;
  cloth: THREE.MeshBasicMaterial;
  clothDark: THREE.MeshBasicMaterial;
  clothPatch: THREE.MeshBasicMaterial;
  rope: THREE.MeshBasicMaterial;
  feature: THREE.MeshBasicMaterial;
  pupil: THREE.MeshBasicMaterial;
  /** Veils, coifs, aprons, swaddling: undyed linen. */
  headwear: THREE.MeshBasicMaterial;
};

export const SilContext = createContext<SilMaterials | null>(null);
export const useSil = () => {
  const m = useContext(SilContext);
  if (!m) throw new Error("Silhouette parts must be rendered inside <SilhouetteStickman>");
  return m;
};
