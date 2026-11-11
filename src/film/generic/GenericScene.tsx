/**
 * Renders any scene described by a SceneSpec in the house style:
 * set + time-of-day light, posed silhouette cast, animals and dressing,
 * automatic multi-shot camera with focus on the subject's face, graphics,
 * grade, rain, ambience and sound effects.
 */
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Loop, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SilhouetteStickman, headCenter, type StickmanPose } from "../../characters/stickman";
import { clamp, ease, lerp, progress, seededRandom } from "../../engine/animation";
import { CameraRig, type Vec3 } from "../../engine/CameraRig";
import { faceCameraYaw } from "../../engine/shots";
import { Cottage } from "../../environments/cottage/Cottage";
import { BarnInterior, ChurchInterior, HallInterior, Stage } from "../../environments/interiors/Interiors";
import { Fields, Pasture } from "../../environments/outdoor/Fields";
import { TIMES, type TimeOfDay } from "../../environments/outdoor/sky";
import { Village } from "../../environments/outdoor/Village";
import { CinematicFX } from "../../style/CinematicFX";
import { FilmGrain, Letterbox, Vignette } from "../../style/Frame";
import { actionPose } from "./actions";
import { CAST } from "./cast";
import { faceAt } from "./expressions";
import { Overlays, Rain } from "./overlays";
import { NARRATION, mouthAt } from "../narration";
import { useMemo } from "react";
import { Animal, Dressing } from "./props3d";
import type { ActorSpec, SceneSpec, SetId, ShotSpec, ShotType } from "./spec";

// ---- camera templates -----------------------------------------------------------------
type Tpl = { d: number; h: number; l: number; lead: number; fov: number; bokeh: number; range: number; ty: number };
const TPL: Record<ShotType, Tpl> = {
  wide: { d: 6.5, h: 1.3, l: 1.4, lead: 0.12, fov: 42, bokeh: 1.8, range: 3.5, ty: -0.5 },
  medium: { d: 2.7, h: 0.12, l: 0.55, lead: 0.17, fov: 40, bokeh: 4, range: 0.9, ty: -0.12 },
  close: { d: 1.35, h: 0.06, l: 0.28, lead: 0.15, fov: 34, bokeh: 6, range: 0.45, ty: -0.02 },
  extreme: { d: 0.9, h: 0.02, l: 0.18, lead: 0.1, fov: 30, bokeh: 7, range: 0.3, ty: 0 },
  high: { d: 5.2, h: 4.2, l: 0.8, lead: 0.06, fov: 44, bokeh: 2, range: 4.5, ty: -0.7 },
  low: { d: 2.3, h: -0.6, l: 0.55, lead: 0.15, fov: 46, bokeh: 3.5, range: 1.1, ty: 0.15 },
  group: { d: 4.2, h: 0.5, l: 0.6, lead: 0, fov: 42, bokeh: 2.5, range: 2.5, ty: -0.35 },
  ots: { d: 1.7, h: 0.1, l: 0.85, lead: 0, fov: 38, bokeh: 6, range: 0.5, ty: -0.05 },
};

const BOUNDS: Partial<Record<SetId, [Vec3, Vec3]>> = {
  cottage: [[-2.55, 0.35, -1.95], [2.55, 2.0, 2.25]],
  church: [[-3.7, 0.5, -17], [3.7, 5.5, 3.8]],
  hall: [[-5.6, 0.5, -9.5], [5.6, 5, 4.6]],
  barn: [[-4.6, 0.5, -3.5], [4.6, 3.2, 2.8]],
};

const autoShots = (seconds: number): ShotSpec[] => {
  if (seconds < 6.5) return [{ type: "medium", at: 0 }];
  if (seconds < 10) return [{ type: "wide", at: 0 }, { type: "medium", at: 0.5 }];
  if (seconds < 15) return [{ type: "wide", at: 0 }, { type: "medium", at: 0.36 }, { type: "close", at: 0.7 }];
  return [{ type: "wide", at: 0 }, { type: "medium", at: 0.28 }, { type: "close", at: 0.56 }, { type: "medium", at: 0.8, side: -1 }];
};

// ---- actors -------------------------------------------------------------------------
type ActorState = { spec: ActorSpec; pose: StickmanPose; pos: Vec3; face: 1 | -1; visible: boolean };

/** Does this actor speak lines written for `who`? (Walter in his hood is still Walter.) */
export const speaks = (actorWho: string, lineWho: string) => actorWho === lineWho || (actorWho === "walterHooded" && lineWho === "walter");

const actorStates = (spec: SceneSpec, frame: number, fps: number, duration: number): ActorState[] =>
  spec.actors.map((a, i) => {
    const seed = a.seed ?? i * 3 + spec.n;
    const { body, pelvis } = actionPose(a.act, frame, seed);
    const face = faceAt(a.expr ?? "neutral", frame, duration, seed + 7, a.look ?? 0);
    // lip-sync: the mouth follows this character's own voice
    const speech = mouthAt(NARRATION[spec.n], a.who === "walterHooded" ? "walter" : a.who, frame, fps);
    if (speech > 0) {
      face.mouthOpen = Math.max(face.mouthOpen, speech * 0.8);
      face.browRaiseL += speech * 0.15;
      face.browRaiseR += speech * 0.15;
    }
    const pose: StickmanPose = { ...body, face, headTurn: a.turn ?? 0.5, head: body.head + speech * 3 };
    const tMove = Math.max(0, frame / fps - (a.moveFrom ?? 0));
    const x = a.x + (a.vx ?? 0) * tMove;
    const scale = CAST[a.who].scale;
    const f = frame / duration;
    const visible = !a.show || (f >= a.show[0] && f < a.show[1]);
    return { spec: a, pose, pos: [x, (a.y ?? 0) + pelvis * scale, a.z], face: a.face ?? 1, visible };
  });

const headOf = (s: ActorState): Vec3 => {
  const [hx, hy] = headCenter(s.pose);
  const sc = CAST[s.spec.who].scale;
  return [s.pos[0] + hx * sc * s.face, s.pos[1] + hy * sc, s.pos[2]];
};

const clampTo = (p: Vec3, set: SetId): Vec3 => {
  const b = BOUNDS[set];
  if (!b) return [p[0], Math.max(0.3, p[1]), p[2]];
  return [clamp(p[0], b[0][0], b[1][0]), clamp(p[1], b[0][1], b[1][1]), clamp(p[2], b[0][2], b[1][2])];
};

type Cam = { position: Vec3; target: Vec3; fov: number; bokeh: number; range: number; focus: Vec3 };

/** One shot in the edit: frames [start, end). `listener` is the foreground head for over-the-shoulder shots. */
export type PlannedShot = { start: number; end: number; shot: ShotSpec; listener?: number; dialogue?: boolean };

const visibleAt = (a: ActorSpec, f: number) => !a.show || (f >= a.show[0] && f < a.show[1]);

/**
 * The edit for a scene: the scene's base shots, with a cut to whoever is
 * speaking on each line of dialogue (shot-reverse-shot between two speakers,
 * over the listener's shoulder when someone is listening).
 */
export const shotPlan = (spec: SceneSpec, duration: number, fps: number): PlannedShot[] => {
  const base = spec.shots ?? autoShots(duration / fps);
  const segs: PlannedShot[] = base.map((sh, i) => ({ start: Math.round(sh.at * duration), end: Math.round((base[i + 1]?.at ?? 1) * duration), shot: sh }));
  const lines = NARRATION[spec.n]?.lines ?? [];
  const windows: PlannedShot[] = [];
  let k = 0;
  for (const line of lines) {
    if (line.who === "narrator") continue;
    const mid = (line.start + line.end) / 2 / (duration / fps);
    const speaker = spec.actors.findIndex((a) => speaks(a.who, line.who) && visibleAt(a, mid));
    if (speaker < 0) continue;
    const sp = spec.actors[speaker];
    // the nearest other visible actor listens
    let listener: number | undefined;
    let best = 1e9;
    spec.actors.forEach((a, j) => {
      if (j === speaker || !visibleAt(a, mid)) return;
      const d = Math.hypot(a.x - sp.x, a.z - sp.z);
      if (d < best && d < 4.5) {
        best = d;
        listener = j;
      }
    });
    const type: ShotType = listener !== undefined && k % 2 === 1 ? "ots" : listener !== undefined ? "close" : k % 2 ? "close" : "medium";
    windows.push({ start: Math.max(0, Math.round((line.start - 0.15) * fps)), end: Math.min(duration, Math.round((line.end + 0.35) * fps)), shot: { type, at: 0, on: speaker }, listener, dialogue: true });
    k++;
  }
  // overlay dialogue windows on the base edit
  let out: PlannedShot[] = segs;
  for (const w of windows) {
    const next: PlannedShot[] = [];
    for (const s of out) {
      if (s.end <= w.start || s.start >= w.end) next.push(s);
      else {
        if (s.start < w.start) next.push({ ...s, end: w.start });
        if (s.end > w.end) next.push({ ...s, start: w.end });
      }
    }
    next.push(w);
    out = next.sort((x, y) => x.start - y.start);
  }
  // absorb fragments shorter than 0.6 s into their neighbour
  const min = Math.round(0.6 * fps);
  const merged: PlannedShot[] = [];
  for (const s of out) {
    const prev = merged[merged.length - 1];
    if (prev && s.end - s.start < min) prev.end = s.end;
    else if (prev && prev.end - prev.start < min && !prev.dialogue) merged[merged.length - 1] = { ...s, start: prev.start };
    else merged.push({ ...s });
  }
  return merged;
};

const cameraFor = (spec: SceneSpec, actors: ActorState[], frame: number, plan: PlannedShot[]): Cam => {
  let i = 0;
  for (let k = 0; k < plan.length; k++) if (frame >= plan[k].start) i = k;
  const seg = plan[i];
  const shot = seg.shot;
  const t = progress(frame, seg.start, seg.end, ease.inOut);
  const tpl = { ...TPL[shot.type] };
  const subject = actors[shot.on ?? spec.focus ?? 0] ?? actors[0];
  let H = subject ? headOf(subject) : ([0, 1.4, 0] as Vec3);
  if (shot.type === "group" && actors.length > 1) {
    const heads = actors.filter((a) => a.visible).map(headOf);
    const xs = heads.map((h) => h[0]);
    H = [(Math.min(...xs) + Math.max(...xs)) / 2, heads.reduce((s, h) => s + h[1], 0) / heads.length, heads.reduce((s, h) => s + h[2], 0) / heads.length];
    const spread = Math.max(...xs) - Math.min(...xs);
    tpl.d = clamp(spread * 0.95 + 1.6, 3.2, 8);
    tpl.fov = spread > 6 ? 48 : tpl.fov;
  }
  const face = subject?.face ?? 1;
  const focus = H;
  if (shot.pos && shot.target) {
    return { position: shot.pos, target: shot.target, fov: shot.fov ?? tpl.fov, bokeh: tpl.bokeh, range: tpl.range, focus };
  }
  if (shot.type === "ots" && seg.listener !== undefined && actors[seg.listener]) {
    // behind the listener's shoulder: their head big and soft in the foreground, the speaker sharp
    const L = headOf(actors[seg.listener]);
    const dir = Math.sign(H[0] - L[0]) || 1;
    const want: Vec3 = [L[0] - dir * tpl.l, L[1] + tpl.h, L[2] + tpl.d - 0.06 * t];
    const pos = clampTo(want, spec.set);
    // a wall in the way would jam the lens into the listener's head: fall back to a clean close-up
    if (Math.hypot(pos[0] - want[0], pos[2] - want[2]) < 0.25) {
      const target: Vec3 = [H[0] - dir * 0.15, H[1] + tpl.ty, H[2]];
      return { position: pos, target, fov: tpl.fov, bokeh: tpl.bokeh, range: tpl.range, focus };
    }
    Object.assign(tpl, TPL.close);
  }
  const rnd = seededRandom(spec.n * 31 + i * 7);
  const side = shot.side ?? (rnd() > 0.5 ? 1 : -1) * face;
  const start: Vec3 = [H[0] + side * tpl.l, H[1] + tpl.h, H[2] + tpl.d];
  const target: Vec3 = [H[0] + face * tpl.lead * tpl.d, H[1] + tpl.ty, H[2]];
  // slow push in (or drift for wide shots)
  const push = shot.type === "wide" || shot.type === "high" ? 0.06 : 0.09;
  const pos: Vec3 = [lerp(start[0], target[0], push * t) + (shot.type === "wide" ? side * 0.4 * t : 0), lerp(start[1], target[1], push * t), lerp(start[2], target[2], push * t)];
  return { position: clampTo(pos, spec.set), target, fov: shot.fov ?? tpl.fov, bokeh: tpl.bokeh, range: tpl.range, focus };
};

// ---- lighting helpers for the flat cast -------------------------------------------------
const castLight = (spec: SceneSpec): { light: number; rim: number; tint: string } => {
  if (spec.set === "cottage") {
    const sun = spec.sun ?? 0.8;
    return { light: 0.62 + 0.33 * sun + 0.1 * (spec.ember ?? 0), rim: 0.45 + sun + 0.3 * (spec.ember ?? 0), tint: "#ffe2c8" };
  }
  if (spec.set === "church" || spec.set === "hall" || spec.set === "barn") return { light: 0.85, rim: 1.2, tint: "#ffe2c8" };
  if (spec.set === "stage") return { light: 0.9, rim: 1.4, tint: "#ffe2c8" };
  const time: TimeOfDay = spec.time ?? "morning";
  const map: Record<TimeOfDay, [number, number, string]> = {
    dawn: [0.85, 1.4, "#ffd8c0"],
    morning: [0.95, 1.25, "#ffeedd"],
    midday: [1.0, 1.0, "#fff6ea"],
    afternoon: [0.95, 1.2, "#ffe8d0"],
    dusk: [0.78, 1.45, "#ffcfb0"],
    night: [0.5, 0.75, "#c8d0ff"],
    storm: [0.6, 0.6, "#d8dcf0"],
  };
  const [light, rim, tint] = map[time];
  return { light, rim, tint };
};

const SetView: React.FC<{ spec: SceneSpec; frame: number; center: Vec3 }> = ({ spec, frame, center }) => {
  const time = spec.time ?? "morning";
  switch (spec.set) {
    case "cottage": {
      const sun = spec.sun ?? 0.8;
      return (
        <>
          <color attach="background" args={["#120d1a"]} />
          <fogExp2 attach="fog" args={["#1d1628", 0.06]} />
          <Cottage frame={frame + 1000} sun={sun} ember={spec.ember ?? 0.6} look="stylized" />
        </>
      );
    }
    case "village":
      return <Village time={time} frame={frame} center={center} />;
    case "fields":
      return <Fields time={time} center={center} walterReaped={spec.fields?.walterReaped} demesneDone={spec.fields?.demesneDone} />;
    case "pasture":
      return <Pasture time={time} center={center} />;
    case "church":
      return <ChurchInterior frame={frame} />;
    case "hall":
      return <HallInterior frame={frame} />;
    case "barn":
      return <BarnInterior />;
    case "stage":
      return <Stage />;
  }
};

const World: React.FC<{ spec: SceneSpec; duration: number; plan: PlannedShot[] }> = ({ spec, duration, plan }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const actors = actorStates(spec, frame, fps, duration);
  const cam = cameraFor(spec, actors, frame, plan);
  const { light, rim, tint } = castLight(spec);
  return (
    <>
      <CameraRig position={cam.position} target={cam.target} fov={cam.fov} />
      <SetView spec={spec} frame={frame} center={cam.focus} />
      {(spec.dressing ?? []).map((d, i) => (
        <group key={`d${i}`} position={[d.x, d.y ?? 0, d.z]} rotation-y={d.rot ?? 0} scale={d.scale ?? 1}>
          <Dressing kind={d.kind} />
        </group>
      ))}
      {(spec.animals ?? []).map((a, i) => {
        const x = a.x + (a.vx ?? 0) * (frame / fps);
        const yaw = faceCameraYaw(cam.position, { x, z: a.z });
        return (
          <group key={`a${i}`} position={[x, a.y ?? 0, a.z]} rotation-y={yaw}>
            <group scale={[(a.face ?? 1) * (a.scale ?? 1), a.scale ?? 1, 1]}>
              <Animal kind={a.kind} frame={frame} seed={i} walking={!!a.vx} />
            </group>
          </group>
        );
      })}
      {actors.map((s, i) => {
        if (!s.visible) return null;
        const c = CAST[s.spec.who];
        const yaw = faceCameraYaw(cam.position, { x: s.pos[0], z: s.pos[2] });
        return (
          <group key={i} position={s.pos} rotation-y={yaw}>
            <group scale={[s.face, 1, 1]}>
              <SilhouetteStickman
                pose={s.pose}
                palette={c.palette}
                costume={c.costume}
                scale={c.scale}
                prop={s.spec.prop}
                farProp={s.spec.farProp}
                light={light}
                tint={tint}
                rimAngle={s.face > 0 ? 140 : 40}
                rimStrength={rim}
              />
            </group>
          </group>
        );
      })}
      <CinematicFX focus={cam.focus} focusRange={cam.range} bokeh={cam.bokeh} bloom={0.75} />
    </>
  );
};

const GRADE: Record<string, string> = {
  flashback: "sepia(0.7) saturate(0.75) brightness(0.88) contrast(1.06)",
  vision: "saturate(0.65) brightness(1.06) hue-rotate(-8deg)",
  none: "none",
};

const AMBIENCE_VOL = { fire: 0.22, wind: 0.2, rain: 0.35, none: 0 } as const;

export const GenericScene: React.FC<{ spec: SceneSpec; durationInFrames: number }> = ({ spec, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const ambience = spec.ambience ?? (spec.set === "cottage" ? "fire" : spec.rain ? "rain" : spec.set === "village" || spec.set === "fields" || spec.set === "pasture" ? "wind" : "none");
  const plan = useMemo(() => shotPlan(spec, durationInFrames, fps), [spec, durationInFrames, fps]);
  // sound accents: a whoosh on roughly a third of the cuts, a blip when a graphic lands
  const whooshes = plan.slice(1).filter((_, i) => i % 3 === 0).map((p) => p.start);
  const blips = (spec.overlays ?? []).map((o) => Math.round(o.from * fps));
  const fadeIn = spec.fadeIn ?? 0;
  const fadeOut = spec.fadeOut ?? 0;
  const black = Math.max(
    fadeIn ? interpolate(frame, [0, fadeIn], [1, 0], { extrapolateRight: "clamp" }) : 0,
    fadeOut ? interpolate(frame, [durationInFrames - fadeOut, durationInFrames], [0, 1], { extrapolateLeft: "clamp" }) : 0,
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ filter: GRADE[spec.grade ?? "none"] }}>
        <ThreeCanvas width={width} height={height} shadows="soft" dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }} camera={{ fov: 40, near: 0.05, far: 400, position: [0, 1.5, 6] }}>
          <World spec={spec} duration={durationInFrames} plan={plan} />
        </ThreeCanvas>
      </AbsoluteFill>
      {spec.rain ? <Rain /> : null}
      <Vignette strength={spec.grade === "flashback" ? 0.8 : 0.55} />
      <FilmGrain opacity={spec.grade === "flashback" ? 0.14 : 0.08} />
      <Overlays items={spec.overlays ?? []} />
      {black > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: black, zIndex: 45 }} /> : null}
      <Letterbox />
      {ambience !== "none" ? (
        <Loop durationInFrames={20 * fps}>
          <Audio src={staticFile(`audio/sfx/${ambience}.mp3`)} volume={AMBIENCE_VOL[ambience]} />
        </Loop>
      ) : null}
      {whooshes.map((f) => (
        <Sequence key={`w${f}`} from={Math.max(0, f - 6)} durationInFrames={30} layout="none">
          <Audio src={staticFile("audio/sfx/whoosh.mp3")} volume={0.32} />
        </Sequence>
      ))}
      {blips.map((f, i) => (
        <Sequence key={`b${i}`} from={f} durationInFrames={15} layout="none">
          <Audio src={staticFile("audio/sfx/blip.mp3")} volume={0.35} />
        </Sequence>
      ))}
      {(spec.sfx ?? []).map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * fps)} durationInFrames={Math.round(4 * fps)} layout="none">
          <Audio src={staticFile(`audio/sfx/${s.id}.mp3`)} volume={0.8} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export { TIMES };
