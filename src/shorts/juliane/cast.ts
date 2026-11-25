/** The cast of "The Girl Who Fell From the Sky" — all drawn with the stickman rig. */
import type { Look } from "../airpocket/Harrison";

/** Juliane, 17: long light-brown hair, sleeveless dress, one sandal (she lost the other in the fall). */
export const JULIANE: Look = { hair: "long", hairColor: "#B98A4E", beard: false, outfit: "dress", dress: "#8CCBEB", feet: "oneSandal" };
export const JULIANE_BEFORE: Look = { ...JULIANE, feet: "shoes" };
/** Her mother, an ornithologist: hair in a bun, glasses. */
export const MOM: Look = { hair: "bun", hairColor: "#5B4330", beard: false, glasses: true, outfit: "dress", dress: "#E9A86B", feet: "shoes" };
/** Her father, a biologist: bush hat, glasses, beard. */
export const DAD: Look = { hair: "short", hairColor: "#3A2E25", beard: true, glasses: true, hat: "bush", outfit: "tee", shirt: "#B9C98F", shorts: "#6B5A3A", feet: "shoes" };
/** The local men who found her. */
export const LOCAL_A: Look = { hair: "short", hairColor: "#141414", beard: false, hat: "straw", outfit: "tee", shirt: "#E6E0D0", shorts: "#4A5A6A", feet: "bare" };
export const LOCAL_B: Look = { hair: "short", hairColor: "#141414", beard: true, outfit: "tee", shirt: "#C76B4A", shorts: "#3B3B3B", feet: "bare" };
