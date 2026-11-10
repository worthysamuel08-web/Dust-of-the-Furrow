# Video Studio — Three.js + Remotion

## The Dust of the Furrow — Scene 1: "The Soil of 1320"

A villein wakes at dawn in his cottage (English manor, c. 1320). 15 s, 30 fps.
2D cartoon stickman composited into a stylised 3D interior.

### Preview
```bash
npm run dev
```
Open http://localhost:3000 and pick **Dust-of-the-Furrow → Scene1-SoilOf1320**
(or the `-720p` variant, which is smoother on an older PC). Scrub the timeline;
every frame is deterministic.
**Dev → Character-RigPreview** shows the stickman alone, cycling poses/expressions.

### Render
```bash
npm run render:scene1          # 1920x1080 → out/scene1-soil-of-1320.mp4
npm run render:scene1:720p     # 1280x720, about 2x faster
npm run still:scene1           # single frame (300) → out/scene1-frame300.png
```
On an older Windows PC: render the 720p version first. If the 3D layer is black or
the render fails with a WebGL error, add `-- --gl=swangle` (software rendering: slow but always works),
e.g. `npm run render:scene1:720p -- --gl=swangle`. With a decent GPU, add `-- --concurrency=2` to speed up.

### Where things live
| Path | Purpose |
|---|---|
| `src/scenes/scene1/timeline.ts` | **All timing**: camera keys, sunrise, body + face keyframes, blinks, IK reaches |
| `src/scenes/scene1/Scene1.tsx` | Assembles the 3D world, character, title card, vignette, fade |
| `src/characters/stickman/` | Reusable 2D character: `Stickman.tsx` (rig/body), `Face.tsx`, `rig.ts` (pose type, presets, IK, blink), `shapes2d.tsx` (flat drawing primitives) |
| `src/environments/cottage/` | Reusable cottage set: `layout.ts` (dimensions), `Structure.tsx` (frame, walls, roof, cruck), `Furnishings.tsx`, `Lighting.tsx`, `materials.ts` |
| `src/engine/` | Shared: deterministic keyframing/easing (`animation.ts`), `CameraRig.tsx`, seeded procedural textures (`textures.ts`) |
| `src/dev/RigPreview.tsx` | Character test bench |

### Animating the character
A pose is plain numbers (degrees), so poses interpolate:
```ts
import { buildTrack, animate, ease } from "./engine/animation";
import { LYING_ON_BACK, reachArm, blink } from "./characters/stickman";

const track = buildTrack(LYING_ON_BACK, [
  { frame: 0 },
  { frame: 40, set: { torso: 0, head: -10, face: { eyeOpenL: 0.7, eyeOpenR: 0.7 } }, ease: ease.heavy },
]);
const pose = animate(frame, track);          // every key only lists what changes
pose.armNear = reachArm(pose.torso, pose.armNear, [0.2, 0.3], weight); // IK hand target
```
Controls: `rootX/rootY/rootRot`, `torso`, `head`, `headTurn` (-1..1 fake 3/4 turn), `breath`,
`armFar/armNear {shoulder, elbow, wrist}`, `legFar/legNear {hip, knee, ankle}`, and `face`
(`eyeOpenL/R`, `lookX/Y`, `browRaiseL/R`, `browTiltL/R`, `mouthSmile`, `mouthOpen`, `mouthWidth`).
`<Stickman light tint>` lets the flat character match the scene's lighting; `yaw` turns its drawing plane towards the camera.

### Performance choices (older GPUs)
Lambert materials only, one shadow-casting light (1024² map), the light beam and dust are additive
fakes (no volumetrics or post-processing), small seeded canvas textures, `dpr=1`, low-poly geometry.

---

## General template notes

3D animation (Three.js via react-three-fiber) + captions, audio and MP4 rendering (Remotion).

## Commands
```bash
npm run dev        # open Remotion Studio (live preview + timeline) at http://localhost:3000
npm run render     # render composition "Main" to out/video.mp4
npm run still      # render one frame to out/thumbnail.png
npm run typecheck
```

## Layout
| File | What it does |
|---|---|
| `src/Root.tsx` | Registers compositions (size, fps, duration) |
| `src/Main.tsx` | Stacks the layers: 3D canvas, captions, audio |
| `src/Scene.tsx` | The Three.js scene (meshes, lights, materials) |
| `src/Captions.tsx` | Word-by-word highlighted captions from `public/captions.json` |
| `public/` | Your assets: audio, captions, textures, 3D models (`staticFile("name")`) |
| `remotion.config.ts` | Render settings (image format, WebGL renderer, concurrency) |

## Rules for 3D in Remotion
- Animate only with `useCurrentFrame()` / `interpolate()` / `spring()`. **Don't** use r3f's `useFrame()` or `THREE.Clock` — frames render out of order.
- Use `<ThreeCanvas>` from `@remotion/three`, not r3f's `<Canvas>`.
- Load GLTF models with drei's `useGLTF(staticFile("model.glb"))`.

## Captions
`public/captions.json` is an array of `{ text, startMs, endMs, timestampMs, confidence }`
(Remotion's `Caption` type). Put a leading space on every word except the first.
Generate them from speech with `@remotion/install-whisper-cpp`, or convert an `.srt` file with `parseSrt()` from `@remotion/captions`.

## Audio
Drop an mp3/wav in `public/` and set `audioFile` in `src/Root.tsx` (or use `<Audio>` from `@remotion/media` anywhere, wrapped in `<Sequence from={...}>` to offset it).

## Render troubleshooting
- Black 3D output on a server without GPU: `npx remotion render Main out/video.mp4 --gl=swangle`
- Render faster on a machine with a GPU: raise `Config.setConcurrency()` in `remotion.config.ts`.
