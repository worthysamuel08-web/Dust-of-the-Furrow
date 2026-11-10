/**
 * The film's running order: all 56 scenes.
 * Scenes 1–2 are hand-built components; 3–56 are SceneSpecs rendered by the
 * generic scene engine (src/film/generic). Lengths come from the narration
 * build (src/film/narration-timing.json), so picture and voice stay in sync.
 */
import { createElement } from "react";
import { Scene1 } from "../scenes/scene1/Scene1";
import { SCENE1_DURATION } from "../scenes/scene1/timeline";
import { Scene2 } from "../scenes/scene2/Scene2";
import { SCENE2_DURATION } from "../scenes/scene2/timeline";
import { GenericScene } from "./generic/GenericScene";
import type { SceneSpec } from "./generic/spec";
import { SCENE_TIMING } from "./narration";
import { SECTION_1_2 } from "./specs/section1-2";
import { SECTION_3_4 } from "./specs/section3-4";
import { SECTION_5_6 } from "./specs/section5-6";

export const FILM_FPS = 30;

export type FilmScene = {
  number: number;
  title: string;
  component: React.FC;
  durationInFrames: number;
  /** Background loop for hand-built scenes (generic scenes handle their own). */
  ambience?: "fire" | "wind" | "rain";
};

const SPECS: SceneSpec[] = [...SECTION_1_2, ...SECTION_3_4, ...SECTION_5_6];

const generic = (spec: SceneSpec): FilmScene => {
  const durationInFrames = SCENE_TIMING[spec.n].frames;
  const component: React.FC = () => createElement(GenericScene, { spec, durationInFrames });
  component.displayName = `Scene${spec.n}`;
  return { number: spec.n, title: SCENE_TIMING[spec.n].title, component, durationInFrames };
};

export const FILM_SCENES: FilmScene[] = [
  { number: 1, title: "The Soil of 1320", component: Scene1, durationInFrames: SCENE1_DURATION, ambience: "fire" },
  { number: 2, title: "Three Promises", component: Scene2, durationInFrames: SCENE2_DURATION, ambience: "fire" },
  ...SPECS.sort((a, b) => a.n - b.n).map(generic),
];

export const FILM_DURATION = FILM_SCENES.reduce((sum, s) => sum + s.durationInFrames, 0);

/** Frame at which each scene starts in the full film. */
export const sceneStart = (n: number) => FILM_SCENES.filter((s) => s.number < n).reduce((sum, s) => sum + s.durationInFrames, 0);
