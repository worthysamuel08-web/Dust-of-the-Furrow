/**
 * Scenes 40–56: Section 5 (The unexpected reality) and Section 6 (Nightfall).
 */
import type { SceneSpec } from "../generic/spec";
import { A, COT, dur, sec } from "./helpers";

export const SECTION_5_6: SceneSpec[] = [
  // 40 · The Day John Said No (flashback)
  {
    n: 40,
    set: "fields",
    time: "afternoon",
    grade: "flashback",
    actors: [
      A("john", 22, 6, "reap", { prop: "sickle", expr: "determined" }),
      A("hayward", 8, 9, "point", { expr: "stern" }),
      A("gilbert", 6.6, 9.2, "stand", { prop: "tally", expr: "worried" }),
      A("villagerA", -20, 0.7, "reap", { prop: "sickle", seed: 3 }),
      A("villagerB", -17, 0.7, "reap", { prop: "sickle", seed: 9 }),
    ],
    shots: [{ type: "wide", at: 0 }, { type: "medium", at: 0.42, on: 1 }, { type: "close", at: 0.72, on: 0 }],
    overlays: [
      { kind: "year", text: "3 WEEKS AGO", from: 0.3, to: dur(40) - 0.3 },
      { kind: "label", text: "A SMALL ACT OF DEFIANCE", from: sec(40, "small") - 0.3, to: dur(40) - 0.3 },
    ],
  },
  // 41 · Distraint
  {
    n: 41,
    set: "village",
    time: "afternoon",
    grade: "flashback",
    actors: [
      A("lordsMan", -1.4, -4.4, "lead", { vx: 0.85, prop: "rope", expr: "stern" }),
      A("child", -3.6, -5.6, "stand", { expr: "sad", look: 0.6 }),
      A("villagerC", -4.6, -5.8, "hold", { prop: "baby", expr: "sad", look: 0.6 }),
    ],
    animals: [{ kind: "cow", x: -2.9, z: -4.6, vx: 0.85 }],
    shots: [{ type: "wide", at: 0, pos: [-1, 1.8, 3.6], target: [-1.5, 1.0, -6], fov: 44 }, { type: "close", at: 0.62, on: 1 }],
    overlays: [{ kind: "title", text: "DISTRAINT", from: sec(41, "So"), to: dur(41) - 0.3 }],
  },
  // 42 · Tomorrow's Court (vision)
  {
    n: 42,
    set: "hall",
    grade: "vision",
    actors: [
      A("walter", 0.2, -4.2, "stand", { turn: 0.15, expr: [[0, "worried"], [0.6, "scared"]] }),
      A("steward", -0.6, -8.6, "sit", { y: 0.3, expr: "stern" }),
      A("clerk", 1.0, -8.6, "sit", { y: 0.3, prop: "tally", expr: "neutral", seed: 4 }),
      A("villagerA", -3.5, -4.6, "sit", { y: 0, seed: 2, expr: "stern" }),
      A("villagerE", -3.5, -2.8, "sit", { y: 0, seed: 6, expr: "neutral" }),
      A("villagerB", 3.5, -3.6, "sit", { y: 0, face: -1, seed: 8, expr: "stern" }),
    ],
    shots: [{ type: "wide", at: 0, on: 1 }, { type: "medium", at: 0.36, on: 1 }, { type: "close", at: 0.68, on: 0 }],
    overlays: [
      { kind: "title", text: "THE MANOR COURT", from: 0.4, to: sec(42, "The", 2) },
      { kind: "roll", lines: ["Walterus atte Broke…", "porcus in blado domini", "— amerciatur —"], caption: "FINED ON THE ROLL", from: sec(42, "pig"), to: dur(42) - 0.3 },
    ],
    ambience: "fire",
  },
  // 43 · If You Fall Ill
  {
    n: 43,
    set: "stage",
    actors: [
      A("walter", -0.6, 0.2, "lie", { y: 0.05, expr: [[0, "sad"], [0.5, "sleeping"]] }),
      A("hugh", -3, 0.8, "walk", { vx: 0.9, prop: "sickle", expr: "determined", show: [0.12, 0.5] }),
    ],
    animals: [
      { kind: "ox", x: 0.5, z: -1.2, vx: -0.9, face: -1 },
      { kind: "cow", x: 1.5, z: -1.6, vx: 0.9 },
    ],
    shots: [{ type: "high", at: 0 }, { type: "medium", at: 0.3, on: 1 }, { type: "wide", at: 0.55 }],
    overlays: [
      { kind: "list", items: ["SEND A SON", "HIRE A MAN", "OR PAY"], from: sec(43, "you", 2), to: sec(43, "And") },
      { kind: "label", text: "BEST BEAST → THE LORD   ·   SECOND BEST → THE PRIEST", where: "top", from: sec(43, "lord"), to: dur(43) - 0.3 },
      { kind: "title", text: "HERIOT & MORTUARY", from: sec(43, "And"), to: sec(43, "lord") - 0.1 },
    ],
  },
  // 44 · If You Run
  {
    n: 44,
    set: "fields",
    time: "afternoon",
    actors: [
      A("walter", -57, 2, "walk", { face: -1, vx: -0.45, prop: "sack", expr: "determined", show: [0, 0.38] }),
      A("walter", -60.4, 2, "stand", { face: -1, prop: "sack", expr: [[0, "dreamy"], [0.55, "sad"]], show: [0.38, 0.82] }),
      A("walter", -60.4, 2, "walk", { vx: 0.5, prop: "sack", expr: "sad", show: [0.82, 1] }),
    ],
    shots: [
      { type: "wide", at: 0, pos: [-54, 2.4, 9], target: [-70, 3.5, -90], fov: 42 },
      { type: "medium", at: 0.38, on: 1 },
      { type: "close", at: 0.62, on: 1 },
      { type: "medium", at: 0.82, on: 2, side: -1 },
    ],
    overlays: [
      { kind: "label", text: "YOUR FAMILY MUST BRING YOU BACK", where: "top", from: sec(44, "The"), to: sec(44, "Survive") },
      { kind: "title", text: "A YEAR AND A DAY = FREE?", from: sec(44, "Survive"), to: dur(44) - 0.3 },
    ],
  },
  // 45 · Those Who Fought Back
  {
    n: 45,
    set: "stage",
    actors: [
      A("walter", -1.2, 0.2, "crossArms", { expr: [[0, "neutral"], [0.3, "determined"]] }),
      A("villagerA", -2.4, -0.4, "crossArms", { seed: 3, expr: "determined" }),
      A("villagerE", -3.4, 0.1, "crossArms", { seed: 6, expr: "angry" }),
      A("villagerC", -0.2, -0.6, "crossArms", { seed: 9, expr: "determined" }),
      A("john", -4.3, -0.5, "crossArms", { seed: 12, expr: "determined" }),
      A("steward", 2.6, 0.1, "point", { face: -1, expr: "angry" }),
    ],
    shots: [{ type: "group", at: 0 }, { type: "close", at: 0.38, on: 0 }, { type: "medium", at: 0.62, on: 5 }, { type: "group", at: 0.84 }],
    overlays: [
      { kind: "roll", lines: ["Domesday Book, 1086:", "…liberi homines…", "— were we once free? —"], caption: "SEARCHING DOMESDAY", from: sec(45, "They"), to: sec(45, "refused") },
      { kind: "label", text: "REFUSING SERVICES TOGETHER", where: "top", from: sec(45, "refused"), to: sec(45, "took") },
      { kind: "label", text: "TO THE KING'S COURTS", where: "top", from: sec(45, "took"), to: sec(45, "usually") },
      { kind: "title", text: "USUALLY THEY LOST. NOT ALWAYS.", from: sec(45, "usually"), to: dur(45) - 0.3 },
    ],
  },
  // 46 · Half Still Standing
  {
    n: 46,
    set: "fields",
    time: "dusk",
    fields: { walterReaped: 0.5 },
    actors: [
      A("walter", 22, 7.6, "reap", { prop: "sickle", expr: [[0, "determined"], [0.5, "tired"]], show: [0, 0.6] }),
      A("walter", 22, 7.6, "stand", { prop: "sickle", expr: "grimace", show: [0.6, 1] }),
    ],
    shots: [{ type: "medium", at: 0 }, { type: "high", at: 0.42, pos: [27, 7, 22], target: [22, 0, -8], fov: 44 }, { type: "close", at: 0.72, on: 1 }],
    overlays: [{ kind: "label", text: "HALF STILL STANDING", where: "top", from: sec(46, "Half"), to: dur(46) - 0.3 }],
  },
  // 47 · The Widow Next Door
  {
    n: 47,
    set: "village",
    time: "dusk",
    actors: [
      A("emma", 3, 0.6, "walk", { face: -1, vx: -0.55, prop: "sack", expr: "determined" }),
      A("steward", 7.2, -0.4, "point", { face: -1, expr: "stern" }),
      A("walter", -3.2, 1.0, "stand", { prop: "sickle", expr: "sad" }),
    ],
    shots: [{ type: "medium", at: 0, on: 0 }, { type: "medium", at: 0.48, on: 1 }, { type: "close", at: 0.74, on: 0 }],
    overlays: [{ kind: "label", text: "WIDOWS OFTEN KEPT THE LAND…", where: "top", from: sec(47, "She"), to: sec(47, "But") }],
  },
  // 48 · Hot to the Touch
  {
    n: 48,
    set: "cottage",
    sun: 0.05,
    ember: 1,
    actors: [
      A("alice", 0.4, 0.55, "hold", { prop: "baby", expr: [[0, "scared"], [0.55, "worried"]], look: 0.3 }),
      A("walter", 1.45, 0.5, "reach", { face: -1, expr: "worried" }),
    ],
    shots: [{ type: "medium", at: 0, on: 0 }, { type: "close", at: 0.42, on: 0 }, { type: "close", at: 0.72, on: 1 }],
    overlays: [{ kind: "label", text: "NO PHYSICIAN COMES HERE", from: sec(48, "No"), to: sec(48, "Alice") }, { kind: "list", items: ["A HERB", "A CHARM", "A SAINT'S NAME"], from: sec(48, "Alice"), to: dur(48) - 0.3 }],
  },

  // ---------------- SECTION 6 · NIGHTFALL ----------------
  // 49 · The Lord's Dung
  {
    n: 49,
    set: "fields",
    time: "dusk",
    actors: [
      A("hugh", -4.5, 6.2, "walk", { vx: 0.6, prop: "staff", expr: "determined" }),
      A("walter", -8, 8.5, "stand", { prop: "sickle", expr: [[0, "tired"], [0.6, "smile"]] }),
    ],
    animals: [
      { kind: "sheep", x: -3, z: 5.8, vx: 0.6 },
      { kind: "sheep", x: -2.1, z: 5.4, vx: 0.6 },
      { kind: "sheep", x: -1.2, z: 6.0, vx: 0.6 },
    ],
    dressing: [{ kind: "hurdles", x: 3.5, z: 5 }],
    shots: [{ type: "wide", at: 0 }, { type: "close", at: 0.6, on: 1 }],
    overlays: [{ kind: "label", text: "EVEN THE DUNG IS THE LORD'S", where: "top", from: sec(49, "Their"), to: dur(49) - 0.3 }],
  },
  // 50 · Pottage
  {
    n: 50,
    set: "cottage",
    sun: 0.05,
    ember: 1,
    actors: [
      A("walter", -0.35, 0.95, "eat", { expr: [[0, "tired"], [0.6, "smile"]] }),
      A("joan", 0.45, 1.45, "eat", { seed: 3, expr: "neutral" }),
      A("agnes", 1.1, 1.55, "eat", { face: -1, seed: 6, expr: [[0, "neutral"], [0.3, "grimace"]] }),
      A("alice", 1.95, 0.85, "eat", { face: -1, seed: 9, expr: "tired" }),
    ],
    dressing: [
      { kind: "stool", x: -0.35, z: 0.95 },
      { kind: "stool", x: 0.45, z: 1.45 },
      { kind: "stool", x: 1.1, z: 1.55, scale: 0.7 },
      { kind: "stool", x: 1.95, z: 0.85 },
      { kind: "pot", x: 0.95, z: 0.4 },
    ],
    shots: [{ type: "group", at: 0 }, { type: "close", at: 0.36, on: 2 }, { type: "close", at: 0.66, on: 0 }],
    overlays: [
      { kind: "list", items: ["PEAS", "BEANS", "LEEKS", "OATS"], from: sec(50, "peas"), to: sec(50, "Bacon") },
      { kind: "cross", text: "POTATOES", from: sec(50, "No"), to: dur(50) - 0.3 },
    ],
  },
  // 51 · Spinning by Firelight
  {
    n: 51,
    set: "cottage",
    sun: 0.05,
    ember: 1,
    actors: [A("alice", 0.4, 0.9, "spin", { prop: "spindle", expr: "tired", look: 0.4 })],
    dressing: [{ kind: "stool", x: 0.4, z: 0.9 }, { kind: "cradle", x: 1.4, z: 1.2 }],
    shots: [{ type: "close", at: 0 }, { type: "medium", at: 0.5 }],
  },
  // 52 · Words You Can't Translate
  {
    n: 52,
    set: "cottage",
    sun: 0.05,
    ember: 0.9,
    actors: [A("walter", 1.1, 1.0, "pray", { face: -1, expr: [[0, "sad"], [0.6, "worried"]] }), A("alice", -0.3, 0.8, "sit", { expr: "sad", seed: 4 })],
    dressing: [{ kind: "cradle", x: 0.35, z: 1.25 }, { kind: "stool", x: -0.3, z: 0.8 }],
    shots: [{ type: "medium", at: 0 }, { type: "close", at: 0.5 }],
    overlays: [{ kind: "label", text: "PATER NOSTER · AVE MARIA", where: "center", from: sec(52, "Pater"), to: sec(52, "words") + 1.2 }],
  },
  // 53 · Rain on the Thatch
  {
    n: 53,
    set: "cottage",
    sun: 0.02,
    ember: 0.8,
    rain: true,
    ambience: "rain",
    actors: [
      A("walter", 0.9, 1.0, "walk", { vx: 0.45, expr: "worried", show: [0, 0.4] }),
      A("walter", 1.9, 1.0, "stand", { expr: [[0, "worried"], [0.7, "sad"]], show: [0.4, 1] }),
      A("alice", 1.0, 1.15, "stand", { expr: "sad", show: [0.62, 1] }),
    ],
    shots: [{ type: "medium", at: 0 }, { type: "close", at: 0.5, on: 1 }, { type: "medium", at: 0.75, on: 1, side: -1 }],
    overlays: [{ kind: "label", text: "YOUR WHEAT IS STILL IN THE FIELD", where: "top", from: sec(53, "Your"), to: dur(53) - 0.3 }],
  },
  // 54 · The Fever Breaks
  {
    n: 54,
    set: "cottage",
    sun: 0.05,
    ember: 0.7,
    actors: [
      A("alice", 0.55, 0.3, "crouch", { expr: "tired", show: [0, 0.38] }),
      A("alice", 0.3, 0.8, "hold", { prop: "baby", expr: [[0, "worried"], [0.4, "relieved"]], show: [0.38, 1] }),
      A("walter", COT.bedLie.x, COT.bedLie.z, "lie", { y: COT.bedLie.y, expr: "sleeping", show: [0.55, 1] }),
    ],
    shots: [{ type: "medium", at: 0, on: 0 }, { type: "close", at: 0.38, on: 1 }, { type: "wide", at: 0.72, pos: [1.75, 1.66, 1.6], target: [-1.25, 0.82, -1.4], fov: 42 }],
    overlays: [{ kind: "label", text: "FOR TONIGHT.", where: "center", from: sec(54, "For"), to: dur(54) - 0.2 }],
  },
  // 55 · Twenty-Eight Years
  {
    n: 55,
    set: "stage",
    actors: [
      A("walter", -0.4, 0, "lie", { y: 0.05, expr: "sleeping" }),
      A("villagerA", 2.4, -0.6, "gesture", { face: -1, expr: "shout", show: [0.42, 0.78], seed: 2 }),
      A("villagerE", 3.4, -0.2, "gesture", { face: -1, expr: "shout", show: [0.42, 0.78], seed: 5 }),
      A("john", 4.4, -0.7, "gesture", { face: -1, expr: "shout", show: [0.42, 0.78], seed: 8 }),
    ],
    shots: [{ type: "high", at: 0 }, { type: "group", at: 0.42, on: 1 }, { type: "close", at: 0.8, on: 0 }],
    overlays: [
      { kind: "year", text: "1348", from: sec(55, "Twenty-eight"), to: sec(55, "Labour") },
      { kind: "title", text: "THE BLACK DEATH", from: sec(55, "plague"), to: sec(55, "Labour") },
      { kind: "year", text: "1381", from: sec(55, "Labour"), to: sec(55, "Serfdom") },
      { kind: "title", text: "THE PEASANTS' REVOLT", from: sec(55, "start"), to: sec(55, "Serfdom") },
      { kind: "title", text: "SERFDOM FADES", from: sec(55, "Serfdom"), to: dur(55) - 0.3 },
    ],
    ambience: "none",
    sfx: [{ id: "bell", at: sec(55, "plague") }],
  },
  // 56 · The Furrow Remembers
  {
    n: 56,
    set: "pasture",
    time: "dawn",
    actors: [A("walter", 0, 3, "stand", { prop: "sickle", expr: "smile", turn: 0.1, look: 0, show: [0.52, 0.74] })],
    shots: [
      { type: "high", at: 0, pos: [0, 24, 46], target: [0, 0, -20], fov: 46 },
      { type: "low", at: 0.28, pos: [4.2, 0.6, 14], target: [4, 0.3, -30], fov: 44 },
      { type: "medium", at: 0.52 },
      { type: "high", at: 0.74, pos: [-6, 30, 52], target: [0, 0, -15], fov: 44 },
    ],
    overlays: [
      { kind: "label", text: "MEDIEVAL RIDGE AND FURROW · STILL VISIBLE TODAY", where: "top", from: sec(56, "But"), to: sec(56, "The", 1) + 1.5 },
      { kind: "title", text: "THE DUST OF THE FURROW", y: 0.45, from: dur(56) - 6, to: dur(56) - 0.6 },
    ],
    fadeOut: 30,
  },
];
