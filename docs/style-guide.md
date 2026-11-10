# The Dust of the Furrow — Style Guide

The house look, matched to the reference film the director supplied
("What If Your Reaction Time Was 10x Faster", 1280×720, 24 fps, 7:13).
We match the *look*, not that channel's characters, props or branding.

Test composition: **Dev → StyleTest-Silhouette** (`src/dev/StyleTest.tsx`).

## 1. Characters: black silhouettes
Component: `<SilhouetteStickman>` (`src/characters/stickman/silhouette/`). It uses the same `StickmanPose`, rig, IK and presets as the original ink Stickman.

| Element | Rule |
|---|---|
| Head and body | Solid near-black (`#121014`), big round head (radius 0.17 m), thick rounded limbs (arms 4.6 cm, legs 5.4 cm), mitten hands, rounded feet |
| Face | **White** features on black: oval eyes with black pupils that follow the gaze, black eyelids that cut into the eye for tired or squinting looks, bar eyebrows, line mouth (open = white shape with a dark inside). No nose, ears or stubble |
| Clothing | Flat colour blocks with no outlines; one darker shade panel at most. Long sleeves cover the arms; hands stay black |
| Rim light | Warm amber edge (`#ffb35c`) on the side facing the key light, about 1.4 cm wide. Set `rimAngle` to the direction the light comes from, and `rimStrength` 1.2–1.4 so it catches the bloom |
| Walter | Muted brown tunic `#8a5c38`, rope belt, patch. His hood is added later as a costume piece |
| Others | Same body, colour and props only (Alice: blue-grey kirtle and white veil; reeve: green hood; and so on, per `docs/storyboard.md`) |

## 2. Environments: flat and moody
- `<Cottage look="stylized">`: no surface textures; flat Lambert colours shaded softly by the lights. Future sets follow the same rule: shapes and light, not texture.
- Palette: dusky purple and mauve shadows (hemisphere sky `#8a78c0`, ground `#2a1f33`); amber key light (`#ffad5c`); glowing windows and doorways; fog `#1d1628`.
- Night and outdoor scenes: navy and teal skies, silhouetted trees and rooftops, warm lit windows.

## 3. Camera and lens
- Every shot gets **depth of field**: `<CinematicFX focus={face} …>`.
  - Wide shots: bokeh 2, focus range 1.5 m.
  - Medium shots: bokeh 4, range 0.7 m.
  - Close-ups: bokeh 6–7, range 0.35 m, so the background melts away.
- Use the reference's variety: wide views from above, medium shots, over-the-shoulder shots with a blurred foreground figure, extreme close-ups of faces, and occasional tilted angles for tension.
- Move the camera slowly within a shot (push, drift, crane). No shaky camera unless the story calls for it.

## 4. Editing rhythm
- The reference: about 66 shots in 7:13. **Median shot 3 s**; most 2–7 s; a few long holds (up to 40 s) for big moments.
- Each storyboard scene becomes **2–4 shots** (for example wide → medium → close-up), cut on narration beats. Scene lengths stay as in `docs/storyboard.md`.
- Hard cuts by default; occasional quick flash transitions.

## 5. Light and finish
- Bloom on bright things: windows, the sun shaft, embers, rim light, white eyes (`CinematicFX` bloom 0.7–0.8).
- Vignette (`<Vignette strength={0.55}>`), film grain (`<FilmGrain opacity={0.08}>`). The grain is seeded from the frame number, so it's deterministic.
- **Letterbox** to a 2:1 picture (`<Letterbox>`: 60 px bars at 1080p).

## 6. Graphics and type
- Titles: bold white Inter 800 with a warm amber glow (`<GlowTitle>`), e.g. "ENGLAND, 1320".
- Facts and figures as on-screen labels in the same style (for example "1 SHEAF IN 10 → THE CHURCH").
- Comic accents where they fit: speed lines, impact bursts, big numbers.
- Subtitles (temporary, until the voice-over is recorded): `NarrationSubtitles`.

## 7. Technical rules
- Everything deterministic: animation from `useCurrentFrame()`, randomness from seeded generators, no time-based shader noise.
- `CinematicFX` holds the first frame each render tab draws until the effect composer is ready (otherwise that frame renders black).
- Cost: post-processing adds about two full-screen passes. On an older PC, preview at 720p, or pass `enabled={false}` to `CinematicFX` while blocking out a scene.
