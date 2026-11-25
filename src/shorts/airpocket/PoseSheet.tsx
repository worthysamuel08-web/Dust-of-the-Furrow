import React from "react";
import { AbsoluteFill } from "remotion";
import { ARMS_OUT_WATER, HANDS_ON_FACE, Harrison } from "./Harrison";

/** Model sheet: the rig in the reference poses (front, turned, scared, praying) plus extras. */
export const PoseSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <svg viewBox="0 0 2400 1500" width="100%" height="100%">
      <Harrison x={250} y={720} pose={{ expression: "neutral" }} />
      <Harrison x={700} y={720} pose={{ expression: "smile", turn: -0.8, lookX: -1 }} />
      <Harrison x={1150} y={720} pose={{ expression: "scared", sweat: 1, ...HANDS_ON_FACE }} />
      <Harrison x={1600} y={720} pose={{ expression: "calm", pray: { x: 0, y: -360 } }} />
      <Harrison x={2080} y={720} pose={{ expression: "shock", ...ARMS_OUT_WATER }} />
      <Harrison x={300} y={1460} scale={1} pose={{ expression: "determined", handR: { x: 150, y: -700 }, elbowUpR: true }} />
      <Harrison x={800} y={1460} pose={{ expression: "cold", holdFlashlight: true, flashlightOn: 1, handR: { x: 120, y: -330 } }} />
      <Harrison x={1300} y={1460} pose={{ expression: "tired" }} />
      <Harrison x={1800} y={1460} pose={{ expression: "no", turn: 0.5, handL: { x: 40, y: -320 }, handR: { x: -40, y: -300 } }} />
    </svg>
  </AbsoluteFill>
);
