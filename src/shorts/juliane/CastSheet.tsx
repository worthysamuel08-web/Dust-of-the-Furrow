import React from "react";
import { AbsoluteFill } from "remotion";
import { Harrison } from "../airpocket/Harrison";
import { DAD, JULIANE, LOCAL_A, LOCAL_B, MOM } from "./cast";

/** Model sheet for the Juliane short. */
export const CastSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <svg viewBox="0 0 2400 1500" width="100%" height="100%">
      <Harrison x={250} y={720} pose={{ look: JULIANE, expression: "neutral" }} />
      <Harrison x={700} y={720} pose={{ look: JULIANE, expression: "scared", sweat: 1, handL: { x: -78, y: -478 }, handR: { x: 78, y: -478 } }} />
      <Harrison x={1150} y={720} pose={{ look: JULIANE, expression: "determined", turn: 0.6, lookX: 1, footL: { x: -20, y: -60 }, footR: { x: 60, y: -8 }, handL: { x: -60, y: -230 }, handR: { x: 150, y: -220 } }} />
      <Harrison x={1600} y={720} pose={{ look: MOM, expression: "smile" }} />
      <Harrison x={2080} y={720} pose={{ look: DAD, expression: "smile", handR: { x: 230, y: -480 }, elbowUpR: true }} />
      <Harrison x={300} y={1460} pose={{ look: LOCAL_A, expression: "shock" }} />
      <Harrison x={800} y={1460} pose={{ look: LOCAL_B, expression: "neutral" }} />
      <Harrison x={1300} y={1460} pose={{ look: JULIANE, expression: "tired", footL: { x: -90, y: -60 }, footR: { x: 90, y: -60 } }} />
    </svg>
  </AbsoluteFill>
);
