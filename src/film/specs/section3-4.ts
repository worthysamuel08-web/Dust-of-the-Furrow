/**
 * Scenes 20–39: Section 3 (The lord's harvest) and Section 4 (Life beyond the fields).
 */
import type { ActorSpec, SceneSpec } from "../generic/spec";
import { A, dur, sec } from "./helpers";

/** A line of reapers working the lord's corn along the reap line. */
const reapers = (xs: number[], seed = 0): ActorSpec[] =>
  xs.map((x, i) => A((["villagerA", "villagerB", "villagerE", "john", "villagerC"] as const)[i % 5], x, 0.7, i % 5 === 4 ? "bind" : "reap", { prop: i % 5 === 4 ? undefined : "sickle", seed: seed + i * 7, expr: "tired" }));

export const SECTION_3_4: SceneSpec[] = [
  // 20 · The Hayward's Horn
  {
    n: 20,
    set: "fields",
    time: "morning",
    actors: [
      A("hayward", -2, 7.5, "blowHorn", { face: -1, prop: "horn", expr: "determined" }),
      A("walter", -9, 5, "stand", { prop: "sickle", expr: [[0, "neutral"], [0.5, "tired"]] }),
    ],
    shots: [{ type: "low", at: 0, on: 0 }, { type: "medium", at: 0.55, on: 1 }],
    sfx: [{ id: "horn", at: 0.2 }],
  },
  // 21 · Boon Day
  {
    n: 21,
    set: "fields",
    time: "morning",
    actors: [
      A("walter", -14, 3.2, "walk", { vx: -0.6, face: -1, prop: "sickle", expr: [[0, "tired"], [0.72, "worried"]] }),
      A("joan", -12.6, 3.8, "walk", { vx: -0.6, face: -1, seed: 3 }),
      A("hugh", -11.4, 4.3, "walk", { vx: -0.6, face: -1, seed: 6, expr: "neutral" }),
      A("alice", -9, 9, "hold", { face: -1, prop: "baby", expr: "worried" }),
      ...reapers([-26, -23, -20]),
    ],
    shots: [{ type: "wide", at: 0 }, { type: "medium", at: 0.42 }, { type: "close", at: 0.72, side: 1 }],
    overlays: [
      { kind: "title", text: "BOON DAY", from: 0.4, to: sec(21, "Every") },
      { kind: "label", text: "THE LORD'S HARVEST FIRST", where: "top", from: sec(21, "Every"), to: dur(21) - 0.3 },
    ],
  },
  // 22 · The Rhythm of the Sickle
  {
    n: 22,
    set: "fields",
    time: "midday",
    actors: [A("walter", -12, 0.8, "reap", { prop: "sickle", expr: [[0, "determined"], [0.45, "tired"], [0.8, "grimace"]] }), ...reapers([-16, -8, -20])],
    shots: [{ type: "close", at: 0 }, { type: "medium", at: 0.28 }, { type: "close", at: 0.55, side: -1 }, { type: "wide", at: 0.8 }],
    overlays: [{ kind: "list", items: ["GRAB", "CUT", "LAY", "STEP"], from: 0.3, to: sec(22, "Again") }],
  },
  // 23 · Small Hands
  {
    n: 23,
    set: "fields",
    time: "midday",
    actors: [
      A("joan", -10, 2.6, "bind", { expr: "determined" }),
      A("hugh", -3, 5.2, "run", { face: -1, vx: -0.9, prop: "linen", expr: "determined", show: [0, 0.6] }),
      A("hugh", -6.5, 4.8, "carry", { prop: "bucket", expr: "grimace", show: [0.6, 1] }),
      ...reapers([-16, -13]),
    ],
    shots: [{ type: "medium", at: 0, on: 0 }, { type: "medium", at: 0.4, on: 1 }, { type: "close", at: 0.68, on: 2 }],
    overlays: [{ kind: "label", text: "AGE 9: ALREADY A LABOURER", from: sec(23, "At"), to: dur(23) - 0.3 }],
  },
  // 24 · The Tenth Sheaf
  {
    n: 24,
    set: "fields",
    time: "midday",
    actors: [A("walter", -8.4, 4.4, "stand", { prop: "sheaf", expr: [[0, "neutral"], [0.6, "sad"]], look: 0.5 })],
    dressing: [{ kind: "stook", x: -7.3, z: 4.6 }],
    shots: [{ type: "medium", at: 0 }, { type: "close", at: 0.55 }],
    overlays: [{ kind: "title", text: "1 SHEAF IN 10  →  THE CHURCH", from: 0.5, to: dur(24) - 0.3 }],
  },
  // 25 · The Hungry Years (flashback)
  {
    n: 25,
    set: "fields",
    time: "storm",
    rain: true,
    grade: "flashback",
    fields: { demesneDone: true },
    actors: [
      A("walter", -4, 3, "stand", { prop: "sheaf", expr: [[0, "sad"], [0.5, "scared"]], show: [0, 0.72] }),
      A("walter", -4, 3, "pray", { expr: "sad", show: [0.72, 1] }),
    ],
    shots: [{ type: "wide", at: 0 }, { type: "medium", at: 0.34 }, { type: "close", at: 0.58 }, { type: "medium", at: 0.74, on: 1, side: -1 }],
    overlays: [
      { kind: "year", text: "1315", from: 0.3, to: dur(25) - 0.3 },
      { kind: "title", text: "THE GREAT FAMINE", from: 0.6, to: sec(25, "Seed") },
      { kind: "label", text: "PERHAPS 1 IN 10 DIED", from: sec(25, "Perhaps"), to: sec(25, "That") },
    ],
    ambience: "rain",
  },
  // 26 · The Empty Stall
  {
    n: 26,
    set: "barn",
    actors: [A("walter", 0.75, -2.6, "stand", { expr: [[0, "sad"], [0.6, "worried"]], look: -0.2 })],
    shots: [{ type: "wide", at: 0 }, { type: "medium", at: 0.32 }, { type: "close", at: 0.62 }],
    overlays: [
      { kind: "title", text: "1319–21: THE CATTLE PLAGUE", from: 0.5, to: sec(26, "Your") },
      { kind: "label", text: "YOUR PLOUGH TEAM: 2 OXEN SHORT", from: sec(26, "Your"), to: dur(26) - 0.3 },
    ],
    ambience: "wind",
  },
  // 27 · The Dry Boon
  {
    n: 27,
    set: "fields",
    time: "midday",
    actors: [
      A("walter", -12, 7, "eat", { expr: [[0, "neutral"], [0.65, "sad"]] }),
      A("villagerA", -13.3, 7, "eat", { seed: 2 }),
      A("john", -10.7, 7, "eat", { face: -1, seed: 5 }),
      A("villagerB", -9.4, 7, "eat", { face: -1, seed: 8, expr: "tired" }),
    ],
    dressing: [{ kind: "cart", x: -5, z: 8.5 }, { kind: "bench", x: -11.4, z: 7.05, scale: 2 }],
    shots: [{ type: "group", at: 0 }, { type: "close", at: 0.62 }],
    overlays: [
      { kind: "list", items: ["BREAD", "CHEESE", "HERRING?"], from: 0.4, to: sec(27, "On") },
      { kind: "cross", text: "ALE", from: sec(27, "Today"), to: dur(27) - 0.3 },
    ],
  },
  // 28 · Blood on the Stubble
  {
    n: 28,
    set: "fields",
    time: "afternoon",
    actors: [
      A("villagerB", -11, 2, "crouch", { expr: "grimace", look: 0.3 }),
      A("walter", -9.9, 2.1, "crouch", { face: -1, prop: "linen", expr: "worried" }),
    ],
    shots: [{ type: "close", at: 0, on: 0 }, { type: "medium", at: 0.35, on: 1 }, { type: "close", at: 0.68, on: 1 }],
    overlays: [{ kind: "label", text: "THE CORONERS' ROLLS", where: "top", from: sec(28, "The"), to: dur(28) - 0.3 }],
  },
  // 29 · The Cloud
  {
    n: 29,
    set: "fields",
    time: "storm",
    actors: [A("walter", -12, 1.2, "reap", { prop: "sickle", expr: [[0, "worried"], [0.65, "scared"]] }), ...reapers([-16, -8])],
    shots: [
      { type: "medium", at: 0 },
      { type: "wide", at: 0.38, pos: [-10, 2.6, 10], target: [18, 6, -60], fov: 46 },
      { type: "close", at: 0.72 },
    ],
    overlays: [{ kind: "label", text: "YOUR OWN WHEAT: STILL STANDING", where: "top", from: sec(29, "Your"), to: dur(29) - 0.3 }],
    ambience: "wind",
  },

  // ---------------- SECTION 4 · LIFE BEYOND THE FIELDS ----------------
  // 30 · The Ale-Stake
  {
    n: 30,
    set: "village",
    time: "afternoon",
    actors: [
      A("matilda", 11.4, -4.5, "akimbo", { expr: [[0, "proud"], [0.68, "angry"]] }),
      A("taster", 13.2, -4.3, "drink", { face: -1, prop: "cup", expr: [[0, "neutral"], [0.6, "grimace"]] }),
    ],
    shots: [{ type: "wide", at: 0 }, { type: "medium", at: 0.42, on: 1 }, { type: "close", at: 0.72, on: 0 }],
    overlays: [
      { kind: "label", text: "ALE-STAKE: FRESH ALE HERE", where: "top", from: 0.5, to: sec(30, "Ale") },
      { kind: "label", text: "THIN OR OVERPRICED? FINED.", from: sec(30, "fine"), to: dur(30) - 0.3 },
    ],
  },
  // 31 · Judgement on the Wall
  {
    n: 31,
    set: "church",
    actors: [A("walter", 0.3, -9, "stand", { turn: 0.2, look: 0.2, expr: [[0, "neutral"], [0.3, "shocked"], [0.7, "scared"]] })],
    shots: [
      { type: "medium", at: 0 },
      { type: "wide", at: 0.3, pos: [1.2, 1.6, -6.2], target: [0, 4.9, -18.9], fov: 42 },
      { type: "close", at: 0.68 },
    ],
  },
  // 32 · "Sir" William
  {
    n: 32,
    set: "village",
    time: "afternoon",
    actors: [
      A("priest", -40.8, -8.2, "talk", { face: -1, prop: "bowl", expr: "smile" }),
      A("walter", -43.0, -8.0, "stand", { expr: [[0, "smile"], [0.5, "grimace"]] }),
    ],
    shots: [{ type: "group", at: 0 }, { type: "close", at: 0.6, on: 1 }],
    overlays: [{ kind: "list", items: ["GRAIN", "LAMBS", "EGGS"], from: sec(32, "grain"), to: dur(32) - 0.3 }, { kind: "title", text: "THE TITHE: ONE TENTH", from: 0.3, to: sec(32, "grain") - 0.1 }],
  },
  // 33 · The Price of a Wedding
  {
    n: 33,
    set: "village",
    time: "afternoon",
    actors: [
      A("joan", -1.0, -0.5, "stand", { expr: "happy", look: 0.4 }),
      A("millerBoy", 0.2, -0.5, "stand", { face: -1, expr: "happy", look: 0.4 }),
      A("walter", 2.8, 0.6, "hold", { face: -1, prop: "coins", expr: [[0, "neutral"], [0.4, "grimace"]] }),
      A("gilbert", 4.1, 0.4, "stand", { face: -1, prop: "tally", expr: "stern" }),
    ],
    shots: [{ type: "group", at: 0, on: 0 }, { type: "medium", at: 0.4, on: 2 }, { type: "close", at: 0.72, on: 0 }],
    overlays: [
      { kind: "title", text: "MERCHET", from: sec(33, "merchet"), to: sec(33, "Some") },
      { kind: "roll", lines: ["Johanna filia Walteri", "pro licentia maritandi", "— for licence to marry —"], from: sec(33, "Some") - 0.5, to: dur(33) - 0.3 },
    ],
  },
  // 34 · The Hare
  {
    n: 34,
    set: "fields",
    time: "afternoon",
    actors: [
      A("walter", -9, 4, "crouch", { prop: "sickle", expr: "shocked", show: [0, 0.45] }),
      A("walter", -9, 4, "stand", { prop: "sickle", expr: "sad", show: [0.45, 1] }),
    ],
    animals: [{ kind: "hare", x: -12, z: 3.4, vx: 2.6 }],
    shots: [{ type: "medium", at: 0 }, { type: "close", at: 0.5 }],
    overlays: [{ kind: "label", text: "GAME BELONGS TO THE LORD", from: sec(34, "Game"), to: dur(34) - 0.3 }],
  },
  // 35 · The King's Reach
  {
    n: 35,
    set: "village",
    time: "afternoon",
    actors: [
      A("purveyor", 3.2, 0.5, "point", { face: -1, expr: "stern" }),
      A("clerk", 4.6, 0.2, "hold", { face: -1, prop: "tally", expr: "neutral" }),
      A("walter", 0.6, 0.6, "reach", { expr: "worried" }),
    ],
    dressing: [{ kind: "cart", x: 7, z: -1.6 }, { kind: "sack", x: 1.5, z: -0.4 }],
    animals: [{ kind: "pig", x: 2.5, z: 1.4, vx: 0.45 }],
    focus: 2,
    shots: [{ type: "low", at: 0, on: 0 }, { type: "medium", at: 0.38, on: 1 }, { type: "close", at: 0.7, on: 2 }],
    overlays: [
      { kind: "label", text: "TAX: A TENTH OR A FIFTEENTH OF YOUR GOODS", where: "top", from: sec(35, "His"), to: sec(35, "purveyors") },
      { kind: "title", text: "PURVEYANCE", from: sec(35, "purveyors"), to: dur(35) - 0.3 },
    ],
  },
  // 36 · News from the North
  {
    n: 36,
    set: "village",
    time: "afternoon",
    actors: [
      A("pedlar", 0, -0.3, "gesture", { expr: "shout" }),
      A("villagerC", -1.8, -0.4, "stand", { expr: "shocked", look: 0.5 }),
      A("villagerD", 1.7, -0.6, "stand", { face: -1, expr: "worried" }),
      A("walter", 3.6, 0.7, "shrug", { face: -1, prop: "sickle", expr: [[0, "neutral"], [0.75, "worried"]] }),
    ],
    shots: [{ type: "group", at: 0 }, { type: "close", at: 0.45, on: 0 }, { type: "close", at: 0.72, on: 3 }],
    overlays: [
      { kind: "label", text: "THE SCOTS RAID THE NORTH", where: "top", from: sec(36, "Scots"), to: sec(36, "king") },
      { kind: "label", text: "THE KING VS. HIS BARONS", where: "top", from: sec(36, "king"), to: dur(36) - 0.3 },
    ],
  },
  // 37 · The Danger in the Ditch
  {
    n: 37,
    set: "village",
    time: "afternoon",
    actors: [
      A("agnes", -2.4, -0.9, "walk", { vx: 0.38, expr: "happy", show: [0, 0.62] }),
      A("alice", -7, 0.3, "run", { vx: 2.2, moveFrom: 3.5, expr: "scared", show: [0.3, 0.62] }),
      A("alice", 0.1, -0.5, "hold", { prop: "baby", expr: "relieved", show: [0.62, 1] }),
    ],
    shots: [{ type: "low", at: 0, on: 0 }, { type: "medium", at: 0.32, on: 1 }, { type: "close", at: 0.62, on: 2 }],
    overlays: [{ kind: "label", text: "INQUESTS: TODDLERS DROWNED IN WELLS AND DITCHES", from: sec(37, "Coroners"), to: dur(37) - 0.3 }],
  },
  // 38 · A Seal of Your Own
  {
    n: 38,
    set: "fields",
    time: "afternoon",
    actors: [A("walter", -8, 6, "hold", { prop: "seal", expr: [[0, "neutral"], [0.4, "proud"]] })],
    shots: [{ type: "medium", at: 0 }, { type: "close", at: 0.45 }],
    overlays: [
      { kind: "label", text: "PEASANT SEALS · c.1300", where: "top", from: sec(38, "You"), to: sec(38, "Peasants") },
      { kind: "roll", lines: ["Walterus atte Broke", "tradidit unam selionem…", "— land changes hands —"], caption: "EVERY DEAL ON THE ROLL", from: sec(38, "Peasants"), to: dur(38) - 0.3 },
    ],
  },
  // 39 · John Cok's Empty Byre
  {
    n: 39,
    set: "village",
    time: "dusk",
    actors: [
      A("john", -2.4, -5.3, "sitDespair", { expr: "sad", turn: -0.2 }),
      A("walter", -9, -3.8, "walk", { vx: 0.9, prop: "sickle", expr: "tired", show: [0, 0.42] }),
      A("walter", -5.2, -3.8, "stand", { prop: "sickle", expr: [[0, "confused"], [0.7, "worried"]], show: [0.42, 1] }),
    ],
    dressing: [{ kind: "stool", x: -2.4, z: -5.3 }],
    shots: [{ type: "wide", at: 0, on: 1 }, { type: "medium", at: 0.42, on: 0 }, { type: "close", at: 0.72, on: 2 }],
    overlays: [{ kind: "label", text: "HIS COW IS GONE", where: "top", from: sec(39, "His", 2), to: dur(39) - 0.3 }],
  },
];
