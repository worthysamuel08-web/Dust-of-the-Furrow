/**
 * Scenes 3–19: Section 1 (Dawn at home) and Section 2 (The manor's rules).
 * Each entry follows its scene in docs/storyboard.md.
 */
import type { SceneSpec } from "../generic/spec";
import { A, COT, dur, sec } from "./helpers";

export const SECTION_1_2: SceneSpec[] = [
  // 3 · The Cold Half of the Bed
  {
    n: 3,
    set: "cottage",
    sun: 0.9,
    ember: 0.5,
    actors: [A("walter", COT.bedEdge.x, COT.bedEdge.z, "sitBed", { expr: [[0, "tired"], [0.55, "smile"]], turn: 0.35 })],
    shots: [{ type: "close", at: 0 }, { type: "medium", at: 0.5, side: -1 }],
  },
  // 4 · Born Unfree
  {
    n: 4,
    set: "cottage",
    sun: 0.9,
    actors: [A("walter", 0.1, -0.7, "stand", { expr: [[0, "neutral"], [0.55, "stern"]] })],
    shots: [{ type: "medium", at: 0 }, { type: "close", at: 0.55 }],
    overlays: [
      { kind: "roll", lines: ["Walterus atte Broke", "nativus domini", "— born unfree —"], caption: "THE LORD'S COURT ROLL", from: 0.6, to: sec(4, "Your") - 0.1 },
      { kind: "list", items: ["YOUR LAND", "YOUR LABOUR", "YOUR DAUGHTERS' MARRIAGES"], from: sec(4, "Your"), to: dur(4) - 0.3 },
    ],
  },
  // 5 · Mud, Oak and Smoke
  {
    n: 5,
    set: "cottage",
    sun: 0.9,
    ember: 0.8,
    actors: [A("walter", 1.6, -1.5, "stand", { face: -1, expr: [[0, "neutral"], [0.55, "squint"]], turn: 0.3 })],
    shots: [
      { type: "medium", at: 0 },
      { type: "wide", at: 0.5, pos: [0.6, 1.4, 1.9], target: [0.1, 3.1, -1.2], fov: 46 },
    ],
    overlays: [
      { kind: "list", items: ["OAK", "HAZEL", "MUD"], from: 0.4, to: sec(5, "No") - 0.1 },
      { kind: "label", text: "NO CHIMNEY", where: "top", from: sec(5, "No"), to: dur(5) - 0.4 },
    ],
  },
  // 6 · Alice at the Hearth
  {
    n: 6,
    set: "cottage",
    sun: 0.9,
    ember: 1,
    actors: [A("alice", 0.55, 0.3, "crouch", { expr: "determined", turn: 0.6 })],
    dressing: [{ kind: "pot", x: 1.25, z: 0.55 }],
    shots: [{ type: "medium", at: 0 }, { type: "close", at: 0.5 }],
  },
  // 7 · Four Children, Two Graves
  {
    n: 7,
    set: "cottage",
    sun: 0.9,
    ember: 0.8,
    actors: [
      A("walter", -1.2, 0.25, "stand", { expr: [[0, "smile"], [0.78, "sad"]] }),
      A("joan", -0.35, 0.55, "stand", { expr: [[0, "dreamy"], [0.78, "sad"]], look: 0.3 }),
      A("hugh", 0.3, 0.85, "akimbo", { expr: [[0, "proud"], [0.78, "sad"]] }),
      A("agnes", 0.85, 1.1, "stand", { face: -1, expr: [[0, "neutral"], [0.78, "sad"]] }),
      A("alice", 1.45, 0.85, "hold", { face: -1, prop: "baby", expr: [[0, "smile"], [0.6, "worried"], [0.78, "sad"]] }),
    ],
    focus: 0,
    shots: [
      { type: "group", at: 0 },
      { type: "medium", at: 0.22, on: 1 },
      { type: "close", at: 0.48, on: 4 },
      { type: "close", at: 0.74, on: 0 },
    ],
    overlays: [{ kind: "label", text: "TWO MORE IN THE CHURCHYARD", from: sec(7, "Two"), to: dur(7) - 0.3 }],
  },
  // 8 · Bread, Ale and a Hood
  {
    n: 8,
    set: "cottage",
    sun: 0.95,
    ember: 0.6,
    actors: [
      A("walter", 0.75, -1.0, "eat", { expr: [[0, "neutral"], [0.25, "grimace"]], show: [0, 0.5] }),
      A("hugh", 1.75, -0.9, "drink", { face: -1, prop: "cup", show: [0, 0.5], expr: "happy" }),
      A("walterHooded", 0.2, -0.3, "akimbo", { expr: "proud", show: [0.5, 1] }),
    ],
    dressing: [{ kind: "stool", x: 0.75, z: -1.0 }],
    shots: [{ type: "medium", at: 0 }, { type: "medium", at: 0.5, on: 2 }, { type: "close", at: 0.78, on: 2 }],
    overlays: [
      { kind: "list", items: ["DARK BREAD", "WEAK ALE"], from: 0.4, to: sec(8, "You") - 0.1 },
      { kind: "list", items: ["HOSE", "SHOES", "HOOD"], from: sec(8, "Add"), to: dur(8) - 0.3 },
    ],
  },
  // 9 · The Knock
  {
    n: 9,
    set: "cottage",
    sun: 0.95,
    actors: [
      A("walter", 1.35, 0.9, "stand", { expr: [[0, "neutral"], [0.45, "tired"], [0.7, "angry"], [0.85, "worried"]] }),
      A("gilbert", 2.3, 1.0, "talk", { face: -1, prop: "tally", expr: "worried" }),
    ],
    shots: [{ type: "medium", at: 0, on: 1 }, { type: "medium", at: 0.42, on: 0 }, { type: "close", at: 0.72, on: 0 }],
    overlays: [
      { kind: "title", text: "BOON DAY", from: sec(9, "Boon"), to: sec(9, "Boon") + 2.4 },
      { kind: "label", text: "YOUR PIG  →  THE LORD'S BARLEY", from: sec(9, "pig"), to: dur(9) - 0.3 },
    ],
  },

  // ---------------- SECTION 2 · THE MANOR'S RULES ----------------
  // 10 · The Village Wakes
  {
    n: 10,
    set: "village",
    time: "morning",
    actors: [
      A("walter", -9, 0.8, "walk", { vx: 0.85, prop: "sickle", expr: [[0, "neutral"], [0.7, "confused"]] }),
      A("villagerC", 1.6, -0.9, "talk", { face: -1 }),
      A("villagerD", 0.6, -1.0, "talk", { face: 1, seed: 4 }),
      A("villagerA", 7, 1.4, "walk", { face: -1, vx: -0.7, prop: "staff" }),
      A("child", -2, 1.8, "run", { vx: 1.3, expr: "happy" }),
    ],
    animals: [
      { kind: "goose", x: -4, z: 2.2, vx: 0.3 },
      { kind: "goose", x: -4.8, z: 2.0, vx: 0.3 },
      { kind: "hen", x: 3.5, z: 1.9, face: -1 },
    ],
    shots: [{ type: "wide", at: 0 }, { type: "medium", at: 0.42 }, { type: "close", at: 0.72 }],
  },
  // 11 · No Clocks
  {
    n: 11,
    set: "village",
    time: "morning",
    actors: [A("walter", 3, 0.8, "stand", { face: -1, prop: "sickle", expr: [[0, "squint"], [0.5, "neutral"]] })],
    shots: [{ type: "medium", at: 0 }, { type: "wide", at: 0.45, pos: [-24, 5, 12], target: [-52, 9, -14], fov: 40 }],
    sfx: [{ id: "bell", at: sec(11, "church") }, { id: "bell", at: sec(11, "church") + 1.6 }],
    overlays: [{ kind: "label", text: "NO CLOCKS", where: "top", from: 0.5, to: sec(11, "Your") }],
  },
  // 12 · The Lord's Mill
  {
    n: 12,
    set: "village",
    time: "morning",
    actors: [
      A("walter", 42.6, -2.1, "hold", { prop: "sack", expr: [[0, "neutral"], [0.6, "stern"]] }),
      A("miller", 44.5, -2.3, "carry", { face: -1, prop: "bowl", expr: "smile" }),
    ],
    shots: [{ type: "wide", at: 0 }, { type: "medium", at: 0.38, on: 1 }, { type: "close", at: 0.7, on: 0 }],
    overlays: [
      { kind: "label", text: "THE LORD'S MILL: COMPULSORY", where: "top", from: 0.5, to: sec(12, "The", 2) },
      { kind: "label", text: "THE MILLER TAKES HIS TOLL", from: sec(12, "toll"), to: dur(12) - 0.3 },
    ],
  },
  // 13 · The Quern Under the Straw
  {
    n: 13,
    set: "cottage",
    sun: 0.75,
    ember: 0.5,
    actors: [A("walter", -2.0, 0.25, "crouch", { face: -1, expr: [[0, "scared"], [0.5, "shocked"]], look: 0.4 })],
    dressing: [{ kind: "quern", x: -2.5, z: 0.45 }],
    shots: [{ type: "medium", at: 0 }, { type: "close", at: 0.45 }],
    grade: "none",
    overlays: [
      { kind: "label", text: "HAND-MILLS: FORBIDDEN", where: "top", from: 0.5, to: sec(13, "At") - 0.1 },
      { kind: "year", text: "ST ALBANS · c.1331", from: sec(13, "At"), to: dur(13) - 0.3 },
      { kind: "label", text: "QUERNS PAVE THE ABBOT'S FLOOR", from: sec(13, "abbot"), to: sec(13, "rebels") },
      { kind: "label", text: "1381: REBELS RIP THEM UP", from: sec(13, "rebels"), to: dur(13) - 0.3 },
    ],
  },
  // 14 · The Lord's Pigeons
  {
    n: 14,
    set: "village",
    time: "morning",
    actors: [
      A("walter", 16.8, -5.4, "gesture", { expr: "angry", show: [0, 0.55] }),
      A("walter", 16.8, -5.4, "stand", { expr: "worried", show: [0.55, 1] }),
      A("gilbert", 21.5, -6.0, "crossArms", { face: -1, prop: "tally", expr: "stern" }),
    ],
    animals: [{ kind: "pigeons", x: 17, z: -8, y: 1.2 }],
    shots: [{ type: "wide", at: 0 }, { type: "medium", at: 0.45, on: 2 }, { type: "close", at: 0.7, on: 1 }],
    overlays: [{ kind: "label", text: "ONLY THE LORD MAY KEEP DOVES", where: "top", from: 0.4, to: dur(14) - 0.3 }],
  },
  // 15 · Ten Men, One Rope
  {
    n: 15,
    set: "stage",
    actors: [
      ...(["villagerA", "villagerB", "villagerE", "john", "walter", "gilbert", "villagerA", "villagerB", "smith"] as const).map((who, i) =>
        A(who, -4.4 + i * 1.0, 0, "stand", { seed: i * 5, expr: [[0, "neutral"], [0.62, "angry"]], look: 0.6 }),
      ),
      A("villagerE", 4.6, 0, "walk", { vx: 0.8, moveFrom: sec(15, "If"), expr: [[0, "neutral"], [0.6, "scared"]], seed: 99 }),
    ],
    focus: 4,
    shots: [{ type: "group", at: 0 }, { type: "close", at: 0.6, on: 9 }, { type: "group", at: 0.8 }],
    overlays: [
      { kind: "title", text: "THE TITHING", from: 0.4, to: sec(15, "If") - 0.1 },
      { kind: "label", text: "ONE RUNS · NINE PAY", from: sec(15, "If"), to: dur(15) - 0.3 },
    ],
  },
  // 16 · The Lord You Never See
  {
    n: 16,
    set: "village",
    time: "morning",
    actors: [A("walter", 30.4, -7.4, "stand", { face: -1, prop: "sickle", expr: [[0, "neutral"], [0.5, "worried"], [0.75, "sad"]], turn: 0.2, look: 0.3 })],
    shots: [
      { type: "low", at: 0 },
      { type: "wide", at: 0.4, pos: [33, 1.4, 2], target: [31, 5, -20], fov: 44 },
      { type: "close", at: 0.72 },
    ],
    overlays: [{ kind: "label", text: "SIR ROGER · LORD OF THE MANOR", where: "top", from: 0.6, to: sec(16, "You") }],
  },
  // 17 · Joan at the Well
  {
    n: 17,
    set: "village",
    time: "morning",
    actors: [
      A("joan", -0.7, -0.5, "stand", { face: -1, expr: "dreamy", look: -0.5 }),
      A("millerBoy", 0.7, -0.5, "stand", { face: 1, expr: "dreamy", look: -0.5 }),
      A("walter", -3.4, 0.9, "stand", { prop: "sickle", expr: [[0, "neutral"], [0.55, "confused"]] }),
    ],
    shots: [{ type: "group", at: 0, on: 0 }, { type: "close", at: 0.55, on: 2 }],
  },
  // 18 · The Open Fields
  {
    n: 18,
    set: "fields",
    time: "morning",
    actors: [A("walter", -6, 7, "stand", { prop: "sickle", expr: [[0, "neutral"], [0.72, "confused"]] })],
    shots: [
      { type: "medium", at: 0 },
      { type: "high", at: 0.3, pos: [-3, 19, 32], target: [2, 0, -35], fov: 46 },
      { type: "close", at: 0.72 },
    ],
    overlays: [
      { kind: "label", text: "≈30 STRIPS · ≈15 ACRES", where: "top", from: sec(18, "It's"), to: dur(18) - 0.3 },
      { kind: "label", text: "NO HEDGES · NO FENCES", from: sec(18, "unfenced"), to: dur(18) - 0.3 },
    ],
  },
  // 19 · Ridge and Furrow
  {
    n: 19,
    set: "fields",
    time: "morning",
    fields: { demesneDone: false },
    actors: [A("walter", 12, 9, "crouch", { expr: "dreamy", look: -0.3 })],
    shots: [
      { type: "low", at: 0, pos: [12.2, 0.55, 15], target: [12, 0.3, -10], fov: 44 },
      { type: "close", at: 0.5 },
    ],
    overlays: [
      { kind: "title", text: "RIDGE AND FURROW", from: 0.6, to: sec(19, "Remember") - 0.2 },
      { kind: "label", text: "REMEMBER THESE SHAPES", from: sec(19, "Remember"), to: dur(19) - 0.2 },
    ],
  },
];
