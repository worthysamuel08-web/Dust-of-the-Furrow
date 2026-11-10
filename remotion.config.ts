import { Config } from "@remotion/cli/config";

// JPEG frames render faster; switch to "png" if you need transparency.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Three.js needs WebGL. "angle" works in headless Chromium on most machines;
// try "swangle" (software) if renders come out black on a server without a GPU.
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(1); // WebGL renders are GPU-bound; raise if you have a GPU
