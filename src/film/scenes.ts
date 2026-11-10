/**
 * The film's running order. To add a scene: build it under src/scenes/sceneN,
 * then append one entry here. The Documentary composition and its duration
 * update automatically.
 */
import { Scene1 } from "../scenes/scene1/Scene1";
import { SCENE1_DURATION } from "../scenes/scene1/timeline";
import { Scene2 } from "../scenes/scene2/Scene2";
import { SCENE2_DURATION } from "../scenes/scene2/timeline";

export const FILM_FPS = 30;

export type FilmScene = {
  number: number;
  title: string;
  component: React.FC;
  durationInFrames: number;
};

export const FILM_SCENES: FilmScene[] = [
  { number: 1, title: "The Soil of 1320", component: Scene1, durationInFrames: SCENE1_DURATION },
  { number: 2, title: "Three Promises", component: Scene2, durationInFrames: SCENE2_DURATION },
];

export const FILM_DURATION = FILM_SCENES.reduce((sum, s) => sum + s.durationInFrames, 0);
