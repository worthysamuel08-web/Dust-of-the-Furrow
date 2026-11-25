/**
 * "The Girl Who Fell From the Sky" — a ~60 s vertical short about Juliane Koepcke,
 * sole survivor of LANSA Flight 508 (24 Dec 1971), who walked out of the Amazon after 11 days.
 * Desire-hook structure; the last frame fades into the first so the Short loops.
 *
 * Timing: src/shorts/juliane/timing.json (scripts/build-juliane-audio.py).
 */
import React from "react";
import { Audio } from "@remotion/media";
import { Loop, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { pop } from "../airpocket/kit";
import { SHORT_FPS, Sfx, ShortPlayer, beatOf, wordAt, type Timing } from "../common/ShortPlayer";
import { BEATS } from "./beats";
import TIMING_JSON from "./timing.json";

const TIMING = TIMING_JSON as Timing;
export const JULIANE_FPS = SHORT_FPS;
export const JULIANE_DURATION = Math.ceil(TIMING.total * SHORT_FPS);
const b = (id: string) => beatOf(TIMING, id);
const at = (id: string, i: number) => wordAt(TIMING, id, i);
const S: React.FC<{ file: string; t: number; vol?: number; dur?: number }> = (p) => <Sfx dir="juliane" {...p} />;

/** On-screen promise in the very first frame: SHE FELL 3 KM … AND LIVED. */
const Title: React.FC = () => {
  const t = useCurrentFrame() / SHORT_FPS;
  const end = b("hook").end;
  if (t > end) return null;
  const out = interpolate(t, [end - 0.3, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lived = pop(t, at("hook", 16) - 0.05, 0.3);
  const style: React.CSSProperties = {
    fontFamily: "Inter", fontWeight: 900, fontSize: 118, lineHeight: 1.05, letterSpacing: -2, color: "#fff",
    WebkitTextStroke: "18px #111", paintOrder: "stroke fill", textShadow: "0 10px 0 rgba(0,0,0,0.35)",
  };
  return (
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", opacity: out }}>
      <div style={style}>SHE FELL <span style={{ color: "#FF3B30" }}>3 KM</span></div>
      <div style={{ ...style, transform: `scale(${lived})`, marginTop: 10 }}>AND LIVED.</div>
    </div>
  );
};

const Soundtrack: React.FC = () => {
  const jungleFrom = b("wakes").start;
  const jungleTo = b("end").start + 1;
  return (
    <>
      <Audio src={staticFile("juliane/voice.mp3")} volume={1} />
      <Audio src={staticFile("juliane/music.mp3")} volume={(f) => interpolate(f / SHORT_FPS, [0, 1, TIMING.total - 1, TIMING.total], [0.2, 0.18, 0.18, 0.05], { extrapolateRight: "clamp" })} />
      {/* falling from the first frame: motion + sound immediately */}
      <S file="wind" t={0} vol={0.55} dur={at("hook", 14)} />
      <S file="leaves" t={at("hook", 14)} vol={0.8} />
      <S file="boom" t={at("hook", 14)} vol={0.4} />
      <S file="whoosh" t={b("question").start - 0.1} vol={0.3} />
      <S file="sting" t={b("fake").start + 0.6} vol={0.4} />
      <S file="riser" t={b("fake").end - 1.9} vol={0.3} />
      {/* the flight, the strike, the fall */}
      <S file="props" t={b("eve").start} vol={0.35} dur={b("eve").end - b("eve").start} />
      <S file="crack" t={at("strike", 0) + 0.05} vol={0.9} />
      <S file="thunder" t={at("strike", 0) + 0.1} vol={0.8} />
      <S file="boom" t={at("strike", 5)} vol={0.7} />
      <S file="wind" t={b("fall").start} vol={0.6} dur={b("fall").end - b("fall").start} />
      <S file="leaves" t={at("fall", 10) + 0.15} vol={0.9} />
      {/* the jungle */}
      <Sequence from={Math.round(jungleFrom * SHORT_FPS)} durationInFrames={Math.round((jungleTo - jungleFrom) * SHORT_FPS)} layout="none">
        <Loop durationInFrames={21 * SHORT_FPS} layout="none">
          <Audio src={staticFile("juliane/insects.mp3")} volume={0.35} />
          <Audio src={staticFile("juliane/birds.mp3")} volume={0.3} />
        </Loop>
      </Sequence>
      <Sequence from={Math.round(at("wakes", 4) * SHORT_FPS)} durationInFrames={Math.round(1.8 * SHORT_FPS)} layout="none">
        <Loop durationInFrames={Math.round(0.85 * SHORT_FPS)} layout="none"><Audio src={staticFile("juliane/heart.mp3")} volume={0.6} /></Loop>
      </Sequence>
      <S file="stream" t={b("rule").start} vol={0.5} dur={b("rule").end - b("rule").start} />
      <S file="whoosh" t={b("rivers").start - 0.1} vol={0.3} />
      <S file="wade" t={b("maggots").start} vol={0.5} />
      <S file="buzz" t={b("maggots").start + 0.2} vol={0.5} />
      <S file="wade" t={b("hut").start} vol={0.45} />
      <S file="whoosh" t={b("dog").start - 0.1} vol={0.3} />
      <S file="pour" t={at("dog", 3)} vol={0.5} />
      <S file="whoosh" t={at("dog", 10) - 0.2} vol={0.3} />
      <S file="pour" t={at("dog", 12)} vol={0.6} />
      <S file="wade" t={b("found").start + 0.3} vol={0.4} />
      <S file="bell" t={at("end", 5)} vol={0.6} />
      <S file="wind" t={TIMING.total - 0.5} vol={0.4} />
    </>
  );
};

export const Juliane: React.FC<{ captions?: boolean; audio?: boolean }> = ({ captions = true, audio = true }) => (
  <ShortPlayer timing={TIMING} beats={BEATS} captions={captions} overlay={<Title />} soundtrack={audio ? <Soundtrack /> : null} />
);
