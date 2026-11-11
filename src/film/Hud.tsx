/**
 * The persistent on-screen counter (the reference film's "CITY CALM" meter,
 * re-imagined): everything taken from Walter today. It ticks up, with a pop
 * and a label, at the moment the script says it is taken.
 */
import "@fontsource/inter/800.css";
import { Audio } from "@remotion/media";
import { Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PICTURE_ASPECT } from "../style/Frame";
import { sceneStart } from "./scenes";
import { sec } from "./specs/helpers";

type Taking = { scene: number; word: string; occurrence?: number; label: string };
const TAKINGS: Taking[] = [
  { scene: 12, word: "toll", label: "FLOUR · THE MILLER'S TOLL" },
  { scene: 14, word: "seed", label: "SEED CORN · THE LORD'S PIGEONS" },
  { scene: 21, word: "Everyone", label: "A DAY'S LABOUR · THE LORD'S FIELD" },
  { scene: 24, word: "Every", label: "1 SHEAF IN 10 · THE CHURCH" },
  { scene: 32, word: "eggs", label: "LAMBS AND EGGS · THE TITHE" },
  { scene: 33, word: "merchet", label: "MERCHET · TO MARRY" },
  { scene: 35, word: "Eventually", label: "A SACK OF GRAIN · THE KING" },
  { scene: 42, word: "Amerced", label: "A FINE · THE MANOR COURT" },
  { scene: 49, word: "dung", label: "EVEN THE DUNG · THE LORD" },
];
const VISIBLE: [number, number] = [9, 54]; // scenes during which the counter is on screen

export const TakenCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const events = TAKINGS.map((t) => ({ ...t, at: sceneStart(t.scene) + Math.round(sec(t.scene, t.word, t.occurrence) * fps) }));
  const from = sceneStart(VISIBLE[0]);
  const to = sceneStart(VISIBLE[1] + 1);
  const bar = Math.max(0, (height - width / PICTURE_ASPECT) / 2);
  const fade = interpolate(frame, [from, from + 15, to - 15, to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const passed = events.filter((e) => frame >= e.at);
  const latest = passed[passed.length - 1];
  const pop = latest ? spring({ frame: frame - latest.at, fps, config: { damping: 9, stiffness: 180 } }) : 1;
  const labelO = latest ? interpolate(frame - latest.at, [0, 6, 75, 90], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <>
      {fade > 0 ? (
        <div style={{ position: "absolute", top: bar + height * 0.035, left: width * 0.03, opacity: fade, zIndex: 41, fontFamily: "Inter", fontWeight: 800 }}>
          <div style={{ display: "inline-block", fontSize: height * 0.016, letterSpacing: "0.18em", color: "#1a1320", background: "rgba(240,232,220,0.85)", borderRadius: height * 0.006, padding: `${height * 0.002}px ${height * 0.008}px` }}>TAKEN FROM YOU TODAY</div>
          <div style={{ marginTop: height * 0.006, display: "flex", alignItems: "center", gap: height * 0.012 }}>
            <div style={{ fontSize: height * 0.05, color: "#fff7ea", background: "rgba(26,19,32,0.7)", border: "2px solid rgba(255,179,92,0.8)", borderRadius: height * 0.012, padding: `0 ${height * 0.014}px`, transform: `scale(${0.85 + 0.15 * pop})`, textShadow: "0 0 10px rgba(255,170,80,0.8)" }}>
              {passed.length}
            </div>
            <div style={{ opacity: labelO, fontSize: height * 0.022, letterSpacing: "0.06em", color: "#ffd8a8", textShadow: "0 0 8px rgba(0,0,0,0.9)" }}>+ {latest?.label}</div>
          </div>
        </div>
      ) : null}
      {events.map((e) => (
        <Sequence key={e.at} from={e.at} durationInFrames={10} layout="none">
          <Audio src={staticFile("audio/sfx/tick.mp3")} volume={0.5} />
        </Sequence>
      ))}
    </>
  );
};
