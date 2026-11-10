# The Dust of the Furrow — "You Wake Up as a Medieval Peasant"

Documentary storyboard and narration · 56 scenes · target runtime 10–12 minutes

| | |
|---|---|
| **Setting** | A fictional manor ("Ashcombe") in the open-field country of the English Midlands, one day in early August 1320, during the grain harvest |
| **Point of view** | Second person. The narrator speaks to "you"; you *are* the stickman villein |
| **Main character** | Walter atte Brook (fictional), a villein holding about half a virgate (≈15 acres) |
| **Format** | 2D cartoon stickman rig composited into stylised 3D Three.js sets, assembled in Remotion |
| **Status** | Scene 1 is built and locked (`src/scenes/scene1`). Scenes 2–56 are storyboard only |
| **The promise** | One extraordinary *ordinary* day. By the end, the viewer understands what it really meant to be a villein in 1320 |

> **Reading the flags.** ⚑ marks a detail that is uncertain, debated, varied a lot between manors, or is an estimate. "Fictional" marks invented names and places used to tell a typical story. Everything else is well established in the scholarship listed at the end. These facts were drafted from established historical literature, but nothing was looked up while writing this. Check the flagged items, and the key figures, before narration is recorded.

---

## 1. Runtime and pacing

<!-- RUNTIME-TABLE -->
| Section | Scenes | Count | Scene lengths | Duration |
|---|---|---|---|---|
| 1 · Dawn at home | 1–9 | 9 | 7–15 s | 1:45 |
| 2 · The manor's rules | 10–19 | 10 | 9–14 s | 1:50 |
| 3 · The lord's harvest | 20–29 | 10 | 7–18 s | 1:49 |
| 4 · Life beyond the fields | 30–39 | 10 | 9–13 s | 1:51 |
| 5 · The unexpected reality | 40–48 | 9 | 11–17 s | 2:01 |
| 6 · Nightfall | 49–56 | 8 | 9–21 s | 1:38 |
| **Total** | **1–56** | **56** | **7–21 s** | **10:54 (654 s)** |

Narration: **1254 words**. Shortest scene 7 s, longest 21 s.
<!-- /RUNTIME-TABLE -->
| Section | Scenes | Count | Scene lengths | Duration |
|---|---|---|---|---|
| 1 · Dawn at home | 1–9 | 9 | 7–15 s | 1:45 |
| 2 · The manor's rules | 10–19 | 10 | 9–14 s | 1:50 |
| 3 · The lord's harvest | 20–29 | 10 | 7–18 s | 1:49 |
| 4 · Life beyond the fields | 30–39 | 10 | 9–13 s | 1:51 |
| 5 · The unexpected reality | 40–48 | 9 | 11–17 s | 2:01 |
| 6 · Nightfall | 49–56 | 8 | 9–21 s | 1:38 |
| **Total** | **1–56** | **56** | **7–21 s** | **10:54 (654 s)** |

Narration: **1254 words**. Shortest scene 7 s, longest 21 s.
<!-- /RUNTIME-TABLE -->

Each scene's duration comes from its narration: the time needed to speak the lines at an unhurried documentary pace (at most 2.2 words per second), plus a one-second breath. Short, punchy beats run 5–8 s; emotional and revelation scenes breathe for 15–20 s. Scene 1 keeps its built length. Scene 56 holds for the end card. The table and every ⏱ figure are generated from the scenes below by `docs/check-storyboard.py`, so they always match.

---

## 2. How we keep viewers watching

### The opening promise (Scene 2)
"Before this day ends, you'll reap another man's harvest, be summoned to his court, and see what happens to a neighbour who said no." Every one of these is paid off: **the harvest** in Section 3, **the court** in Scenes 9 → 42, **the neighbour** in Scenes 39 → 40–41.

### Threads planted early and paid off late
| Thread | Planted | Raised | Paid off |
|---|---|---|---|
| The pig in the lord's barley | 9 (the reeve's warning) | 42 (tomorrow's court) | 42 (the cost) |
| John Cok, the man who said no | 2 (the promise) | 39 (his empty byre) | 40–41 (distraint) |
| Your own ripe wheat versus the lord's | 21 ("your wheat will wait") | 29 (the cloud) and 46 (half still standing) | 53 (rain on the thatch) |
| The baby's cough | 7 ("coughed half the night") | 48 (fever) | 54 (the fever breaks, for tonight) |
| The two graves | 7 | 25 (the famine winter) | 52 (praying for the third) |
| Joan and the miller's boy | 7 | 17 (at the well) | 33 (the price of marrying) |
| "Remember these shapes" (ridge and furrow) | 19 | (none) | 56 (still in English fields today) |

### Something new in every section (no front-loading)
| Section | The section's biggest surprise | Its closing hook |
|---|---|---|
| 1 · Dawn at home | Your daughters' marriages answer to the lord (4) | The reeve: boon day, and your pig was in the lord's barley (9) |
| 2 · The manor's rules | An abbot paves his floor with confiscated hand-mills (13) | "Remember these shapes" (19) |
| 3 · The lord's harvest | The famine winter, and people eating their horses (25) | A dark line of cloud over your unreaped wheat (29) |
| 4 · Life beyond the fields | Inquests on toddlers drowned while their parents reaped (37) | John Cok's cow is gone, and he won't meet your eye (39) |
| 5 · The unexpected reality | Villagers searching Domesday Book to prove their ancestors were free (45) | The baby is hot to the touch (48) |
| 6 · Nightfall | Twenty-eight years from tonight… (55) | The furrows are still there (56) |

---

## 3. Continuity bible

### Walter (you): locked design from Scene 1
- `<Stickman>` with `PEASANT_PALETTE`, `DIMENSIONS` unchanged: large clean white round head, black line limbs, white mitten hands and feet, muted brown tunic with a sewn patch and a rope belt, light stubble.
- His default `headTurn` faces 3/4 right. His expression baseline is tired: heavy lids (`eyeOpen` ≈ 0.6) and slightly worried brows (`browTilt` ≈ 0.3).
- **Added as props or overlays, never by changing his rig:** hose and turnshoes (from Scene 8), a hood (from Scene 8), a sickle prop (Scenes 20–47), a seal on a cord (38).
- He keeps the same `light`/`tint` approach in every set, so he always reads brighter than the environment.

### Supporting cast: same rig and line style, distinguished only by costume, palette and scale
| Character | Scale | Costume / palette | First seen |
|---|---|---|---|
| **Alice**, wife (fictional) | 0.95 | long kirtle (dull blue-grey), white linen veil and wimple | 6 |
| **Joan**, 15 | 0.9 | russet kirtle, linen coif | 7 |
| **Hugh**, 9 | 0.7 | short tunic, bare legs; head slightly larger in proportion | 7 |
| **Agnes**, 4 | 0.6 | small kirtle, coif | 7 |
| **Baby** | 0.3 | swaddled; only the head is visible; wooden cradle | 7 |
| **Gilbert the reeve** (fictional) | 1.0 | green hood, tally stick | 9 |
| **The hayward** | 1.0 | grey tunic, cow horn | 20 |
| **The miller and his boy** | 1.05 / 0.9 | floury white palette | 12 / 17 |
| **Sir William**, parish priest (fictional) | 1.0 | black cassock, tonsure | 32 |
| **Matilda the alewife** (fictional) | 0.95 | apron, veil | 30 |
| **John Cok**, neighbour (fictional) | 1.0 | patched grey tunic | 39 |
| **Emma**, widow (fictional) | 0.95 | dark kirtle, black veil | 47 |
| Villagers, reapers, jurors | 0.9–1.05 | seeded palette variants | |

The lord **Sir Roger** (fictional) is never shown, only his hall, his pigeons, his officials and his rules. His absence is the point.

### Reusable 3D environments
| Set | Scenes | Status |
|---|---|---|
| Cottage interior | 1–9, 13 (insert), 48, 50–55 | Built (Scene 1); reused with new camera paths and the family |
| Village street, green, well, alewife's house | 10, 11, 17, 30, 35–37, 39 | New |
| Manor: hall exterior, dovecote, watermill, court-hall interior | 12, 14, 16, 42 | New |
| Parish church: exterior, nave with wall painting | 31, 32, 52 (insert) | New |
| Open fields: strips, ridge and furrow, stooks, headland hedge | 18–29, 34, 46, 49 | New; the biggest and most reused set |
| Abstract graphic stage (parchment, rope, roll, map) | 2, 4, 15, 43–45 | 2D overlays in Remotion |
| Flashback grade (sepia, rain) | 25, 13 (vision) | CSS/overlay tint |
| Present-day ridge-and-furrow pasture | 56 | New, simple |

### Audio palette
Wind across stubble, rooks, skylarks, sheep, hens, the creak of a cart, sickles hissing through straw, a single church bell (tenor), a cow horn, the hearth crackling, a spindle whirring, rain on thatch. Music: a sparse drone (a hurdy-gurdy or bowed psaltery feel) and one small "family" motif. The motif plays in pieces through the film and only once in full, in Scene 56.

---

## 4. Scenes

### SECTION 1 · DAWN AT HOME
*The viewer arrives, meets the family, and learns they don't own themselves. Ends on a knock at the door.*

#### Scene 1 · The Soil of 1320 — ⏱ 15
**Status:** BUILT (15 s). Do not modify. Narration is laid over the existing picture, starting around 2 s after the title card.
**Narration:** "England, thirteen-twenty. You wake to smoke, straw and cold. You are not a knight, a monk or a merchant. You are a villein, and this is your day."
**Action / expression:** (existing) He sleeps, his eyes flutter open, he raises his head, sits up, yawns, looks around tired and confused, and scratches his head.
**Environment:** One-room wattle-and-daub cottage, timber frame, cruck truss, thatch, straw mattress, open hearth, trestle table, chest, tools on pegs.
**Camera:** Wide establishing shot, then a slow push-in and arc to a medium shot of the bed.
**Lighting:** Pre-dawn gloom, then a shaft of morning sun through the small barred window with dust in it; embers glowing.
**Sound:** Hearth crackle, distant cockerel, a rook, his yawn, straw rustling.

#### Scene 2 · Three Promises — ⏱ 12
**Narration:** "Before this day ends, you'll reap another man's harvest, be summoned to his court, and see what happens to a neighbour who said no."
**Action / expression:** Walter sits on the edge of the bed. On each clause, a 2D card flashes beside him and his eyes flick to it: a sickle in golden wheat; a parchment roll with a red seal; a cow being led through a gate by a stranger. On the last card his brow knits. Cut to black for half a second.
**Environment:** Cottage, with graphic cards over the scene.
**Camera:** Locked medium shot; each card punches in with a slight zoom.
**Lighting:** Dim dawn; the cards are lit like old vellum.
**Sound:** Three low drum hits, one per card, then silence.
**History / continuity:** A teaser. Every promise is paid off (Scenes 20–29, 42 and 40–41).

#### Scene 3 · The Cold Half of the Bed — ⏱ 7
**Narration:** "The other half of the bed is already cold. Alice rose first."
**Action / expression:** Walter pats the empty straw beside him; a small fond, weary smile.
**Environment:** Same bed: a dent in the straw and a second blanket folded back.
**Camera:** Low close shot along the mattress at his hand, then a slow tilt up to his face.
**Lighting:** The window shaft falls across the empty side.
**Sound:** Straw crunch, a hen outside.
**History / continuity:** This explains why the family is absent in Scene 1. Women's work typically began before dawn: fire, water, animals.

#### Scene 4 · Born Unfree — ⏱ 12
**Narration:** "On the lord's rolls you are Walter atte Brook, nativus: born unfree. Your land, your labour, even your daughters' marriages answer to one man."
**Action / expression:** A parchment unrolls beside him with his name in Latin court hand. On "your daughters' marriages", Walter glances towards the door (where Joan will appear), and his jaw sets.
**Environment:** Cottage, with a parchment overlay.
**Camera:** Slow push from Walter onto the parchment, then rack back to his face.
**Lighting:** Parchment candle-lit; cottage cool.
**Sound:** A quill scratching, parchment unrolling.
**History:** *Nativus* ("born unfree") is a standard court-roll term for a villein. Villeins were not slaves: they could sue anyone in the king's courts *except* their lord. Merchet (Scene 33) made a daughter's marriage the lord's business. Names and manor are fictional.

#### Scene 5 · Mud, Oak and Smoke — ⏱ 11
**Narration:** "Oak posts, hazel and mud: wattle and daub. No chimney. The smoke finds its own way out through the thatch."
**Action / expression:** Walter pats a wall; dust falls; he coughs and looks up at the smoke drifting into the roof.
**Environment:** A patch of exposed wattle, sooty rafters, smoke gathering under the ridge.
**Camera:** Close shot on the wall, then a tilt up following the smoke into the thatch.
**Lighting:** A cool beam through the smoke haze.
**Sound:** Crumbling daub, a cough, the wind in the thatch.
**History:** Open hearths without chimneys were normal in peasant houses. ⚑ House size and layout varied by region and wealth; two- or three-bay houses were common, and longhouses shared with animals existed in some regions.

#### Scene 6 · Alice at the Hearth — ⏱ 7
**Narration:** "Alice is back from the well. She coaxes last night's embers into flame."
**Action / expression:** The door opens in a bright slot of daylight; Alice sets down a bucket, kneels and blows. The flames rise; quiet concentration.
**Environment:** The cottage hearth.
**Camera:** From behind the hearth with flames in the foreground, then a slow push on Alice.
**Lighting:** A warm glow rises on her face.
**Sound:** Bucket thud, breath, kindling catching.
**History:** Embers were kept alive overnight under ash (Scene 54) to avoid relighting with flint and steel.

#### Scene 7 · Four Children, Two Graves — ⏱ 14
**Narration:** "Four children survive. Joan, fifteen, and already eyeing a boy. Hugh, nine. Little Agnes. And the baby, who coughed half the night. Two more lie in the churchyard."
**Action / expression:** The children come in one at a time, each in a little character pose (Joan dreamily distracted, Hugh puffing out his chest, Agnes clinging to Alice). The baby coughs in its cradle and Alice glances at it. On "two more", Walter's and Alice's eyes meet, and the music drops away.
**Environment:** Cottage; a wooden cradle by the hearth.
**Camera:** Lateral dolly along the line of children, settling on the parents' shared look.
**Lighting:** Warm hearth light against the brightening window.
**Sound:** Footsteps, the baby's small cough, then one held note.
**History:** High child mortality is well attested. ⚑ The family size and the deaths are fictional but typical.

#### Scene 8 · Bread, Ale and a Hood — ⏱ 13
**Narration:** "Breakfast is dark bread and weak ale; even the children drink it. You slept in your clothes. Add hose, shoes and a hood, and you're dressed."
**Action / expression:** He tears dense bread with effort (eyes wide, chewing hard) and sips ale; Hugh drinks from a small cup. Quick rhythmic jump cuts: hose, shoe, belt (he sucks in his stomach), hood up, and a little pose.
**Environment:** Trestle table (jug, bowls, loaf from the Scene 1 set); the cloak peg.
**Camera:** Overhead table shot, then a locked medium shot for the dressing jump cuts.
**Lighting:** Even morning light.
**Sound:** Bread tearing, pouring, fabric swishes timed to the cuts.
**History:** Bread was often maslin (wheat and rye) or barley; ale was a staple food. Hoods and leather "turnshoes" were standard. ⚑ That people "never drank water" is a myth. ⚑ What people slept in is poorly documented.

#### Scene 9 · The Knock — ⏱ 14
**Narration:** "A knock. Gilbert the reeve, a villein like you, chosen to drive his own neighbours. Boon day, he says. And your pig was in the lord's barley again."
**Action / expression:** Walter opens the door to Gilbert, who gives an apologetic shrug and taps his tally stick. On "your pig", Walter turns slowly to glare at the pig snuffling innocently in the croft. Gilbert writes something; Walter's face falls.
**Environment:** The cottage doorway, with the croft and pigsty visible behind.
**Camera:** Over Walter's shoulder at Gilbert, then a whip-pan to the pig, then back to Walter's face.
**Lighting:** Bright doorway backlighting Gilbert.
**Sound:** Knocking, a tally stick tapping, a pig's contented grunt (comic timing).
**History:** Reeves were usually villeins, often chosen by the tenants or the court, and the office was often unwelcome. Animals straying into the lord's crops were among the most common court cases.

### SECTION 2 · THE MANOR'S RULES
*Walking out through the village, the viewer learns the invisible fences around Walter's life. Ends on "Remember these shapes."*

#### Scene 10 · The Village Wakes — ⏱ 11
**Narration:** "Thirty-odd houses along a muddy street. Each family has a toft, a croft, a pig, and at least one grudge."
**Action / expression:** Walter steps out with his sickle on his shoulder. Neighbours nod; two women stop talking as he passes. He gives a sideways glance.
**Environment:** The village street: thatched houses behind fences, geese, a cart stuck in a rut, smoke rising from the roofs.
**Camera:** A long tracking shot beside him at walking pace, with layered parallax on the houses.
**Lighting:** Low morning sun across the street; smoke catching the light.
**Sound:** Geese, a dog, distant hammering, greetings.
**History:** ⚑ Village size is fictional but plausible for the Midlands. Manor court rolls are full of neighbours' disputes.

#### Scene 11 · No Clocks — ⏱ 9
**Narration:** "Nobody here owns a clock. Your day is measured by the sun, and by the church bell."
**Action / expression:** Walter squints up, shading his eyes; a bell sounds and his head turns towards the tower.
**Environment:** The street, with the church tower over the roofs.
**Camera:** Medium shot, then a slow push towards the distant tower.
**Lighting:** Sun flare.
**Sound:** Three slow strokes of a bell.
**History:** Mechanical clocks were only just appearing in a few great churches by the early 1300s. Many parish churches had scratch dials to time services.

#### Scene 12 · The Lord's Mill — ⏱ 12
**Narration:** "You must grind your grain at the lord's mill. The miller takes his toll in flour, and everyone suspects him of taking more."
**Action / expression:** The miller scoops a measure off Walter's sack into his own bin, then a little extra, with a sly smile. Walter's eye twitches.
**Environment:** A timber watermill: the turning wheel, the millrace, a sack hoist; flour hanging in the air inside.
**Camera:** A wide shot of the wheel, then an interior close-up on the scoop.
**Lighting:** Water reflections dancing on the walls; floury haze.
**Sound:** The water wheel, grinding stones, trickling flour.
**History:** Suit of mill (compulsory use) and multure (a toll in grain) were standard manorial rights. ⚑ Rates varied, often around 1/16 to 1/24. The cheating miller is a medieval stock figure.

#### Scene 13 · The Quern Under the Straw — ⏱ 14
**Narration:** "Grinding at home on a hand-quern is forbidden. At St Albans, an abbot will pave his parlour with confiscated querns, and in 1381 rebels will rip them up."
**Action / expression:** Walter glances guiltily at a small stone quern hidden under straw in the cottage corner (an insert). It dissolves to a stylised vision: a floor paved with querns, which he stares at aghast; then the stones fly up as rebels pry them loose.
**Environment:** Cottage-corner insert, then a stylised abbey parlour.
**Camera:** Tilt down to the hidden quern; a top-down shot of the paved floor; a fast push-in as the stones lift.
**Lighting:** Conspiratorial shadow, then a cold monastic grey.
**Sound:** Stone scraping, an echoing clack, a distant crowd's roar.
**History:** The St Albans quern confiscations under Abbot Richard of Wallingford (about 1331) and the rebels lifting the quern-stones in 1381 are recorded by the abbey's chronicler. ⚑ It is about a decade after 1320, hence "will". Suppressing hand-mills was not universal.

#### Scene 14 · The Lord's Pigeons — ⏱ 9
**Narration:** "Only the lord may keep doves. They eat your seed corn. You may not touch them."
**Action / expression:** A flock lifts off a round stone dovecote and lands on a strip. Walter starts to wave his arms, sees Gilbert watching, and slowly lowers them.
**Environment:** A round dovecote by the manor, at the field edge.
**Camera:** Follows the flock in a sweeping arc down to Walter.
**Lighting:** Bright.
**Sound:** Wing claps, cooing, a frustrated breath.
**History:** Keeping doves was a manorial privilege. ⚑ Flock sizes varied; large dovecotes held hundreds of nests.

#### Scene 15 · Ten Men, One Rope — ⏱ 12
**Narration:** "Every man over twelve belongs to a tithing: about ten neighbours answerable for each other. If one of them runs, the others pay."
**Action / expression:** Ten stickmen (Walter among them) are linked by a 2D rope; one tries to sidle away, the rope jerks everyone, and nine heads turn to glare at him.
**Environment:** The village green, with a stylised overlay.
**Camera:** Wide group shot, then a quick zoom on the culprit.
**Lighting:** Flat, graphic.
**Sound:** A rope creaking, a collective "ahem".
**History:** Frankpledge: males aged 12 and over were enrolled in tithings and checked at the view of frankpledge, and a tithing could be fined if it failed to produce an offender. ⚑ Size and practice varied by region.

#### Scene 16 · The Lord You Never See — ⏱ 11
**Narration:** "Sir Roger owns this manor. You may never speak a word to him. You will feel him every hour of your life."
**Action / expression:** Walter pauses at the gate and looks up; his shoulders sink a little.
**Environment:** The manor house: stone hall, timber barns, a walled yard, a banner.
**Camera:** A slow crane over the gate to reveal the hall, with Walter small in the foreground.
**Lighting:** The hall silhouetted against the low sun.
**Sound:** Distant hooves, a heavy gate creaking.
**History:** Many manors had absent or rarely resident lords, run by a steward, a bailiff and a reeve. Sir Roger is fictional.

#### Scene 17 · Joan at the Well — ⏱ 9
**Narration:** "At the well, Joan and the miller's boy are not talking to each other. Very noticeably."
**Action / expression:** Joan and the boy stand back to back at the well, each sneaking glances at the other. Walter notices and raises one eyebrow.
**Environment:** The village green: a stone-lined well, a windlass and buckets.
**Camera:** A two-shot, then a slow push to Walter's raised eyebrow.
**Lighting:** Bright morning.
**Sound:** The windlass creaking, a tiny embarrassed cough. A gentle plucked motif.
**History / continuity:** This sets up merchet (Scene 33).

#### Scene 18 · The Open Fields — ⏱ 13
**Narration:** "Your land isn't a farm. It's about thirty narrow strips scattered across great unfenced fields, so that good soil and bad are shared out among everyone."
**Action / expression:** Walter at the field's edge; his strips light up one by one across the landscape. He counts on his fingers, loses track, and gives up with a shrug.
**Environment:** The open-field landscape: long strips of wheat, barley and peas, no hedges between strips, balks and headlands, the village behind.
**Camera:** A high, slow drone-style pull-up and pull-out from Walter to the whole field system.
**Lighting:** Early morning gold over the grain.
**Sound:** Wind in the corn, larks.
**History:** Open-field farming in strips (selions) grouped in furlongs, across two or three great fields with rotation, was typical of the Midlands. ⚑ The number of strips is illustrative; a half-virgate was about 15 acres, though a virgate's size varied by manor. ⚑ That strips were scattered to share out good and bad land is one common explanation among several.

#### Scene 19 · Ridge and Furrow — ⏱ 10
**Narration:** "Year after year, the plough heaps each strip into a ridge, with a furrow between. Remember these shapes."
**Action / expression:** Walter crouches and lets soil run through his fingers; a quiet, thoughtful face.
**Environment:** A close, low view of the corrugated ridges.
**Camera:** A ground-level glide along a furrow (the strongest parallax shot in the film), ending on his hand.
**Lighting:** Raking sun picking out every ridge.
**Sound:** Soil trickling; the first three notes of the family motif.
**History:** Ridge and furrow formed when a heavy mouldboard plough turned the soil inwards along each strip. Pays off in Scene 56.

### SECTION 3 · THE LORD'S HARVEST
*The work, the hunger behind it, and the slow-building threat to Walter's own crop. Ends on a dark line of cloud.*

#### Scene 20 · The Hayward's Horn — ⏱ 7
**Narration:** "A horn. The hayward is calling the village to the lord's corn."
**Action / expression:** The hayward blows a cow horn; heads pop up across the field; Walter sighs and shoulders his sickle.
**Environment:** The edge of the lord's demesne field.
**Camera:** The hayward silhouetted in a wide shot, then a cut to Walter's sigh.
**Lighting:** Brightening morning.
**Sound:** A cow-horn blast echoing off the hills.
**History:** The hayward oversaw crops, fences and harvest labour.

#### Scene 21 · Boon Day — ⏱ 12
**Narration:** "A boon day. Every soul in your house except your wife must reap the lord's field first. Your own wheat will have to wait."
**Action / expression:** Walter, Joan and Hugh trudge in among a line of reapers; Alice stays at the gate with the baby. Walter looks back over his shoulder towards his own strip, glinting gold in the distance.
**Environment:** The lord's wheat: tall golden grain and a long line of reapers.
**Camera:** A wide side-on tracking shot of the line walking in, then a long-lens view of his own strip far off.
**Lighting:** Strong, warm sun.
**Sound:** Footsteps in stubble, a murmur of reapers.
**History:** Boon works (precariae) were extra harvest services; some customals demand the whole household except the housewife. ⚑ Who was required varied by manor.

#### Scene 22 · The Rhythm of the Sickle — ⏱ 8
**Narration:** "Grab a fistful. Cut. Lay it down. Step. Again. And again. Until the sun moves."
**Action / expression:** The reaping cycle, cut to the beat of the narration. His face grows sweatier and his lids heavier with each repeat.
**Environment:** In among the standing wheat.
**Camera:** A close side shot, with match cuts on "again" as the sun jumps across the sky.
**Lighting:** The sun climbs across the cuts.
**Sound:** The sickle's hiss and crunch in rhythm, a grunt.
**History:** Wheat was usually reaped with a sickle; scythes were used more for hay.

#### Scene 23 · Small Hands — ⏱ 9
**Narration:** "Joan binds the sheaves. Hugh chases crows and hauls water. At nine, he is already a labourer."
**Action / expression:** Joan twists straw bands and stands sheaves in stooks; Hugh flaps a cloth at crows, then wobbles under a water pot with a determined frown.
**Environment:** Stubble, a row of stooks, the field margin.
**Camera:** A dolly along the stooks, then a low child's-eye shot following Hugh.
**Lighting:** Midmorning glare.
**Sound:** Straw twisting, crows cawing, water sloshing.
**History:** Children worked from an early age: herding, bird-scaring, gleaning.

#### Scene 24 · The Tenth Sheaf — ⏱ 8
**Narration:** "Every tenth sheaf is marked and left standing. That one belongs to the Church."
**Action / expression:** Walter ties a twist of straw round a sheaf and steps back from it with a reverent little nod (and a sidelong glance at how much grain is in it).
**Environment:** A row of stooks with one marked sheaf.
**Camera:** A slow push on the marked sheaf; the others go soft.
**Lighting:** The marked sheaf catches the sun.
**Sound:** The music drops to a soft bell tone.
**History:** The great tithe was taken in the field as sheaves, collected by the rector or his agent.

#### Scene 25 · The Hungry Years — ⏱ 18
**Narration:** "You've seen this field fail. Five years ago it rained all summer. Seed rotted, prices soared, and people ate their seed corn, then their horses. Perhaps one in ten died. That winter you buried a child."
**Action / expression:** FLASHBACK in sepia: a thinner Walter in the rain holds a black, rotten ear of grain; a small grave in the churchyard. Back to the present: Walter, mid-swing, has stopped. He swallows hard and starts reaping again.
**Environment:** The same field, waterlogged, under a grey sky; then the churchyard.
**Camera:** A slow drift through the rain, a still shot of the grave, then a hard cut back to a close-up.
**Lighting:** Desaturated, cold and drizzling, then a jolt back to warm sun.
**Sound:** Heavy rain, silence at the grave, a single sickle stroke on the return.
**History:** The Great Famine of 1315–1317 followed years of extreme rain, and chroniclers record desperate foods, including horses. ⚑ Mortality is estimated at about 5–12% of the population, varying by region.

#### Scene 26 · The Empty Stall — ⏱ 15
**Narration:** "And now a plague on the cattle. Since last year, oxen have been dying across England. Your plough team is two beasts short, and the lord's ploughing comes first."
**Action / expression:** An insert: Walter's hand on the beam of an empty stall where a yoke hangs unused. Grief, then calculation: he counts on his fingers, worried.
**Environment:** The shared ox-house: straw, an empty manger.
**Camera:** A slow lateral move past the empty stalls.
**Lighting:** Dim barn light, dust.
**Sound:** A lone ox lowing far off, flies.
**History:** The great cattle murrain of about 1319–1321, probably rinderpest, killed a very large share of England's cattle. ⚑ Loss estimates vary. Peasants often pooled oxen into shared plough teams.

#### Scene 27 · The Dry Boon — ⏱ 11
**Narration:** "At noon the lord feeds his reapers: bread, cheese, perhaps herring. On a wet boon there's ale. Today is a dry boon."
**Action / expression:** Reapers in a row under the hedge; bread is passed along. Walter peers into his empty cup, and the whole row sighs in unison.
**Environment:** A headland under a hedge; a cart with baskets.
**Camera:** A dolly along the eaters, ending on the empty cup.
**Lighting:** High noon, short shadows; shade under the hedge.
**Sound:** Munching, the clink of an empty cup, insects.
**History:** Customals specify boon meals, some distinguishing "ale boons" from dry ones. ⚑ Menus and terms varied by manor.

#### Scene 28 · Blood on the Stubble — ⏱ 10
**Narration:** "A sickle slips. There's no doctor: only linen, prayer and luck. The coroners' rolls are full of harvest accidents."
**Action / expression:** A neighbour clutches his hand; Walter runs over and binds it with a strip of linen. Tight, frightened faces.
**Environment:** In the field.
**Camera:** A quick, nervous push-in (the only unsteady camera in the film), then stillness.
**Lighting:** Harsh sun.
**Sound:** A yelp, cloth tearing, breathing.
**History:** Coroners' inquests into accidental deaths are a key source on rural life. ⚑ Infection risk and treatment are generalised here.

#### Scene 29 · The Cloud — ⏱ 11
**Narration:** "By mid-afternoon, a dark line of cloud in the west. Your own wheat stands ripe on the far side of the field."
**Action / expression:** Walter straightens and wipes his brow, sees the cloud, then his strip. Real fear for the first time; he grips the sickle tighter and reaps faster.
**Environment:** View across the demesne towards the tenant strips under a darkening western sky.
**Camera:** Over his shoulder, then a tilt to the sky; a cloud shadow sweeps across the field towards camera.
**Lighting:** Warm light dimming as a shadow line advances.
**Sound:** A gust, a distant rumble of thunder, the sickle rhythm speeding up.

### SECTION 4 · LIFE BEYOND THE FIELDS
*Village life, religion, love, the king's reach and everyday dangers. Ends on John Cok's empty byre.*

#### Scene 30 · The Ale-Stake — ⏱ 13
**Narration:** "A bush on a pole means Matilda has brewed. Ale sours in days, so women brew constantly, and the ale-tasters fine anything thin or overpriced."
**Action / expression:** Matilda hangs a leafy bush above her door. An official sips, grimaces theatrically and notches a tally; Matilda folds her arms, unimpressed.
**Environment:** The alewife's house, with a large brewing vat seen through the door.
**Camera:** Medium shot, a whip-pan to the taster, then a close-up of the grimace.
**Lighting:** Warm interior against the bright street.
**Sound:** Liquid sloshing, a disgusted "hmm", a knife notching wood.
**History:** Ale-stakes advertised a fresh brew. Brewing for sale was largely women's work, and the Assize of Bread and Ale, enforced by ale-tasters, produced routine fines. Ale was unhopped; hopped beer came to England later.

#### Scene 31 · Judgement on the Wall — ⏱ 10
**Narration:** "In church, the wall shows devils dragging sinners into a monster's mouth. You can't read. You don't need to."
**Action / expression:** Walter looks up at the painting; his eyes widen and he gulps. A painted devil (2D on the wall) seems to glance at him; Walter quickly crosses himself.
**Environment:** A stone parish church: whitewashed nave, painted Judgement Day (Doom) over the chancel arch, rood screen, a floor strewn with rushes.
**Camera:** A low-angle tilt up from Walter to the painting, then a slow push to the hell-mouth.
**Lighting:** Cool, dim nave; a shaft through a lancet window; altar candles.
**Sound:** Echoing footsteps, a hush, a faint choral hum.
**History:** Wall paintings taught the unlettered. ⚑ Many surviving Doom paintings are later 14th–15th century; a 1320 church might show other painted scenes.

#### Scene 32 · "Sir" William — ⏱ 9
**Narration:** "Your priest is Sir William. He takes a tenth of your grain, your lambs, even your eggs."
**Action / expression:** The priest smiles benignly with a basket; a sheaf, a lamb and an egg fly into it in 2D, each with a tick. Walter forces a polite smile.
**Environment:** The church porch.
**Camera:** A two-shot, then a punch-in on Walter's strained smile.
**Lighting:** Porch shade.
**Sound:** Comic ticks, a lamb's bleat.
**History:** Parish priests were commonly styled "Sir". Tithes covered crops (the great tithes) and young animals and produce such as eggs (the lesser tithes).

#### Scene 33 · The Price of a Wedding — ⏱ 12
**Narration:** "Joan wants the miller's boy. First you must pay the lord merchet: a fine for permission to marry. Some lords even fined unwed mothers."
**Action / expression:** Joan and the boy hold hands shyly; Walter hands Gilbert coins with a grimace; Joan beams and hugs him. A 2D roll shows the entry *pro licentia maritandi* ("for licence to marry").
**Environment:** The village green, with a court-roll overlay.
**Camera:** A two-shot of the couple, then a cut to the coin hand-off.
**Lighting:** Warm afternoon.
**Sound:** A coin clink, a giggle.
**History:** Merchet was paid for an unfree woman's marriage and was widely treated as a test of villein status. Leyrwite fined unfree women for sex outside marriage. ⚑ Amounts varied, and who paid varied by manor.

#### Scene 34 · The Hare — ⏱ 9
**Narration:** "A hare bolts from the stubble. Catch it, and you'll be fined. Game belongs to the lord."
**Action / expression:** A hare zigzags out; Walter lunges, freezes mid-air as he remembers, and lets it go with a deflated sigh.
**Environment:** The last patch of standing corn.
**Camera:** A quick pan following the hare; a freeze-frame on his lunge.
**Lighting:** Afternoon sun.
**Sound:** A rustle, a thump, a sad "pff".
**History:** Lords with grants of free warren controlled the hunting of hares, rabbits and game birds; royal forest law protected deer. ⚑ Penalties varied.

#### Scene 35 · The King's Reach — ⏱ 13
**Narration:** "Even the king reaches this far. His tax men value your pots and animals. His purveyors take grain for his wars and pay late, or never."
**Action / expression:** A clerk lists Walter's pot, pig and blanket on a roll; a mounted purveyor points at his sack of grain, and it's carted away. Walter reaches out, helpless.
**Environment:** The village street.
**Camera:** A low angle on the horseman, then a high angle on Walter.
**Lighting:** Afternoon, turning overcast.
**Sound:** Hooves, cart wheels, a parchment unrolled.
**History:** Lay subsidies taxed movable goods at fractions such as a tenth or a fifteenth. Royal purveyance (compulsory purchase, often underpaid or unpaid) was a major grievance under Edward I and Edward II. ⚑ What a specific household lost is illustrative.

#### Scene 36 · News from the North — ⏱ 11
**Narration:** "A pedlar brings news: Scots burning the north, the king feuding with his barons. It all feels very far away."
**Action / expression:** The pedlar gestures dramatically to a small crowd; Walter listens, shrugs and turns back to work.
**Environment:** The village green.
**Camera:** A wide shot of the crowd, then a slow push on Walter's shrug.
**Lighting:** Overcast afternoon.
**Sound:** Excited chatter, a pedlar's bell.
**History:** After Bannockburn (1314), Scottish raids struck northern England repeatedly. Edward II's quarrel with Thomas of Lancaster led to civil war in 1321–1322.

#### Scene 37 · The Danger in the Ditch — ⏱ 11
**Narration:** "The real dangers are ordinary: open wells, ditches, cooking fires, carts. Coroners recorded toddlers drowning while their parents worked the harvest."
**Action / expression:** Little Agnes toddles towards the well's edge, reaching for a floating leaf. Alice sees, drops her basket and runs, sweeping her up. Alice's eyes close in relief.
**Environment:** The green and the well, an open ditch beside the street.
**Camera:** A low child's-eye shot following Agnes; a fast cut to Alice running; a still close-up of the embrace.
**Lighting:** Flat, grey afternoon.
**Sound:** Water lapping; silence; then Alice's breath.
**History:** Coroners' rolls record many accidental child deaths in wells, ditches and fires, often while parents were working, especially at harvest (Hanawalt).

#### Scene 38 · A Seal of Your Own — ⏱ 11
**Narration:** "Yet you are not powerless. You own a seal. Peasants buy, sell and lease land, and the court records every deal."
**Action / expression:** Walter draws a small bronze seal from under his tunic and presses it into wax; a little proud smile. A 2D roll shows strips changing hands.
**Environment:** A field-edge close-up, then a graphic court-roll overlay.
**Camera:** Macro shot on the seal impression.
**Lighting:** Warm.
**Sound:** Wax pressed, a soft thunk.
**History:** Peasant land markets were active around 1300, with transfers recorded in court rolls. Personal seals were widely used by peasants by about 1300. ⚑ How common seals were among villeins specifically varied.

#### Scene 39 · John Cok's Empty Byre — ⏱ 12
**Narration:** "On the way home you pass John Cok's house. His byre is empty. His cow is gone. And John won't meet your eye."
**Action / expression:** Walter slows by a gate. An empty byre, a dangling tether rope. John sits on his step, staring at the ground; he looks up, then away. Walter's expression: a question, then dawning understanding.
**Environment:** A neighbour's toft: an empty byre, a dropped bucket.
**Camera:** A slow tracking shot past the gate, holding on John.
**Lighting:** Late afternoon, cloud thickening.
**Sound:** A creaking gate, wind, no animal sounds where there should be some.

### SECTION 5 · THE UNEXPECTED REALITY
*What happens if you fail your obligations, fall ill, try to leave, or push back. Ends with the baby's fever.*

#### Scene 40 · The Day John Said No — ⏱ 13
**Narration:** "Three weeks ago, on a boon day, John reaped his own corn instead of the lord's. A small act of defiance. This is what it cost."
**Action / expression:** FLASHBACK (warm grade): John alone in his own strip while the line of reapers works the demesne in the distance. The hayward points him out to Gilbert.
**Environment:** The open fields, three weeks earlier.
**Camera:** A wide shot holding John small and alone in frame, then a long-lens shot of the hayward pointing.
**Lighting:** A golden flashback grade.
**Sound:** A single sickle, distant reapers singing, then the hayward's horn.
**History:** Failure to perform services was routinely presented and fined in manor courts. ⚑ John's case is a fictional composite.

#### Scene 41 · Distraint — ⏱ 11
**Narration:** "The court fined him. He couldn't pay. So the lord's men took his cow, and they'll keep it until he does."
**Action / expression:** Two of the lord's men lead the cow out of John's gate (the image promised in Scene 2). John's children watch from the doorway.
**Environment:** John's toft, in flashback.
**Camera:** A static wide shot; the cow walks out of frame and the camera does not follow.
**Lighting:** Cold, overcast.
**Sound:** Hooves, a lowing cow, a child's question unanswered.
**History:** Distraint (seizing goods or animals to force payment or service) was the standard enforcement tool of manorial courts.

#### Scene 42 · Tomorrow's Court — ⏱ 13
**Narration:** "Tomorrow, your turn. The court meets in the lord's hall, and your own neighbours sit as jurors. The pig will cost you pence you don't have."
**Action / expression:** Walter imagines the hall: the steward at a table, a clerk writing, neighbours on benches. His name is read out and he shrinks; the clerk's quill scratches *Walterus atte Broke… porcus… in blado domini* ("pig… in the lord's grain").
**Environment:** A vision of the manor court in the hall.
**Camera:** A dissolve in; a slow push on the quill; a reverse shot of Walter getting smaller in frame.
**Lighting:** A warm, dreamlike tint; heavy shadows.
**Sound:** Murmuring benches, the quill, his name echoing.
**History:** The manor court (hallmote) met every few weeks, with tenants serving as jurors who presented offences. Trespass by animals was among the most common cases. ⚑ Fine amounts are illustrative.

#### Scene 43 · If You Fall Ill — ⏱ 17
**Narration:** "If you fall sick, the work is still owed: you send a son, hire a man, or pay. And when you die, the lord takes your best beast, and the priest your second best."
**Action / expression:** A graphic sequence: Walter in bed with a fever while Hugh drags a sickle out of the door; then Walter as a faint outline, his ox led to the hall and his cow to the church.
**Environment:** The cottage, then a graphic stage.
**Camera:** Slow lateral moves between the vignettes.
**Lighting:** Muted, cooling.
**Sound:** A cough, footsteps, two gates closing.
**History:** Heriot (the lord's best beast) and mortuary (the church's second best) were levied at a tenant's death. ⚑ Arrangements for covering services during illness varied by manor.

#### Scene 44 · If You Run — ⏱ 16
**Narration:** "You could run. Some do. The court names you and orders your family to bring you back. Survive a year and a day in a chartered town, and you might be free."
**Action / expression:** Walter stands on a road leading over a hill towards a walled town on the horizon. He takes one step and hesitates. A graphic: his name on the roll, his family's names added beneath it. He steps back. Longing, then resignation.
**Environment:** A road at the edge of the fields; a distant town (walls, a spire).
**Camera:** A slow push past Walter towards the horizon, then a pull back to him.
**Lighting:** A haze that softens the town.
**Sound:** A lone bird, wind; the music swells and pulls back.
**History:** Villeins needed licence to leave, and might pay chevage to live elsewhere. Lords pursued fugitives through their courts, often ordering kin or pledges to return them. The "year and a day" in a privileged town appears in English legal tradition. ⚑ Enforcement and outcomes varied.

#### Scene 45 · Those Who Fought Back — ⏱ 16
**Narration:** "And some villages fought back. They searched the Domesday Book for proof their ancestors were free, refused services together, and took their lords to the king's courts. They usually lost. But not always."
**Action / expression:** A graphic montage: villagers crowd round a huge book; a line of peasants with folded arms faces a steward; a petition is carried to a royal court. A small determined set to Walter's face as he watches.
**Environment:** A stylised parchment world.
**Camera:** Fast cuts, then a slow push on the final image.
**Lighting:** Vellum warmth with ink-black shadows.
**Sound:** Pages turning, a crowd murmuring, a judge's single word.
**History:** Peasant communities sometimes claimed "ancient demesne" status, citing Domesday Book, and collective refusals of services are recorded (Halesowen is a well-known case). ⚑ Outcomes varied; most claims failed.

#### Scene 46 · Half Still Standing — ⏱ 12
**Narration:** "Released at last, you run to your own strip and reap until you can't see your hands. Half of it is still standing."
**Action / expression:** Walter reaps in the near-dark, alone; he stops, exhausted, and looks at the uncut half, breathing hard.
**Environment:** His own narrow strip.
**Camera:** A slow crane up and back to reveal how much is left.
**Lighting:** Deep blue dusk with one band of amber on the horizon.
**Sound:** A slower sickle rhythm, distant thunder.

#### Scene 47 · The Widow Next Door — ⏱ 11
**Narration:** "Next door, Emma lost her husband last winter. She kept his land. But the steward keeps asking when she'll remarry."
**Action / expression:** Emma, carrying a heavy sack alone, nods to Walter; behind her, a well-dressed steward points at her house and taps his tally. She keeps walking, chin up.
**Environment:** The village street at dusk.
**Camera:** Medium tracking shot alongside Emma.
**Lighting:** Dusk, with lamplight starting in doorways.
**Sound:** Footsteps, a gate latch.
**History:** Widows often held their husband's tenement by custom ("free bench"). Lords sometimes pressed widows holding land to remarry, or fined them for marrying, or for not marrying. ⚑ Practice varied greatly by manor.

#### Scene 48 · Hot to the Touch — ⏱ 12
**Narration:** "Home. The baby is hot to the touch. No physician comes to a villein's cottage. Alice tries a herb, a charm, a saint's name."
**Action / expression:** Walter enters; Alice holds the baby with a frightened face. Walter touches the tiny forehead and pulls his hand back. Alice whispers over the cradle.
**Environment:** The cottage, lit only by the fire.
**Camera:** A very slow push on the three of them.
**Lighting:** Low firelight, half-lit faces.
**Sound:** A small cough, whispering, the fire.
**History:** Healing mixed herbs, charms, prayer and saints; physicians were for the wealthy. ⚑ Specific remedies are generalised.

### SECTION 6 · NIGHTFALL
*Supper, prayer, the rain, and what comes after. The viewer leaves understanding what it meant to be a villein.*

#### Scene 49 · The Lord's Dung — ⏱ 9
**Narration:** "Before dark, Hugh pens your sheep on the lord's land. Their dung manures his fields, not yours."
**Action / expression:** Hugh drives three sheep into a hurdle fold on the demesne; Walter shakes his head, half laughing despite himself.
**Environment:** A hurdle sheepfold at the field edge.
**Camera:** A wide shot of the fold, then a cut to Walter's tired laugh.
**Lighting:** Blue dusk.
**Sound:** Bleating, hurdles knocking.
**History:** Fold-soke (the lord's right to have tenants' sheep folded on his land for the manure) is documented on many manors. ⚑ It was not universal.

#### Scene 50 · Pottage — ⏱ 11
**Narration:** "Supper is pottage: peas, beans, leeks and oats, stewed for hours. Bacon, if you're lucky. No potatoes. No tomatoes. Not for centuries."
**Action / expression:** The family eats round the pot; Agnes wrinkles her nose and Walter eats gratefully. A 2D potato and tomato pop up, get red crosses, and vanish.
**Environment:** The cottage at night: the pot over the hearth, wooden bowls and spoons.
**Camera:** A slow circular move around the family at the hearth.
**Lighting:** Firelight only; warm and flickering, deep shadows.
**Sound:** Bubbling pot, spoons scraping.
**History:** Pottage was the staple; peasants ate meat, especially bacon, irregularly. Potatoes and tomatoes came from the Americas, reaching England in the late 16th century.

#### Scene 51 · Spinning by Firelight — ⏱ 9
**Narration:** "Alice spins wool by firelight, one eye on the cradle. Her hands haven't stopped since before dawn."
**Action / expression:** The spindle twirls hypnotically; Alice glances at the cradle every few turns.
**Environment:** By the hearth.
**Camera:** A close-up on the spindle, then a pull back to Alice.
**Lighting:** Flickering fire.
**Sound:** The whirr of the spindle.
**History:** Spinning with distaff and spindle was ubiquitous women's work; the spinning wheel was only beginning to spread.

#### Scene 52 · Words You Can't Translate — ⏱ 11
**Narration:** "You kneel and pray in Latin, Pater Noster, Ave Maria: words you can't fully translate, for a child you can't heal."
**Action / expression:** Walter kneels by the cradle, lips moving; Latin words float up like sparks and fade into the smoke. Inserts of the two small graves in the churchyard at night.
**Environment:** The cottage; churchyard inserts.
**Camera:** A tilt up following the words into the roof.
**Lighting:** Firelight; the words glow faintly; the churchyard is moonlit.
**Sound:** Murmured Latin, the fire.
**History:** The laity were expected to know the Pater Noster and Ave Maria, often in Latin. ⚑ How much they understood varied.

#### Scene 53 · Rain on the Thatch — ⏱ 11
**Narration:** "Then, rain on the thatch. Your wheat is still in the field. There is nothing you can do until dawn."
**Action / expression:** Walter's head snaps up. He goes to the door and opens it onto falling rain, staring towards the fields. Alice's hand on his shoulder; he closes the door.
**Environment:** The cottage door; rain over the dark fields.
**Camera:** From inside, past Walter's silhouette in the doorway into the rain.
**Lighting:** Blue-black rain outside, a warm rim of firelight on Walter.
**Sound:** Rain building on the thatch, a drip finding its way through.
**History / continuity:** This pays off the cloud from Scene 29. Wet harvests could ruin grain: the memory of 1315 (Scene 25).

#### Scene 54 · The Fever Breaks — ⏱ 10
**Narration:** "Alice banks the fire under ash. The baby's breathing slows, and settles. The fever has broken. For tonight."
**Action / expression:** Alice rakes ash over the embers; the room dims. She touches the baby's brow and her face softens. Walter lies down; the family settles on mattress and pallets. Walter's eyes close: the reverse of Scene 1.
**Environment:** The cottage at night, as in Scene 1 but now with the whole family.
**Camera:** A slow pull back into the exact Scene 1 establishing framing (a deliberate bookend).
**Lighting:** Embers fade to near dark; rain-grey moonlight at the window.
**Sound:** Ash scraping, rain softening, a baby's even breathing.
**History:** Covering the hearth at night was standard practice against fire. ⚑ Village "curfew" bells are attested in places, but usage varied.

#### Scene 55 · Twenty-Eight Years — ⏱ 16
**Narration:** "Twenty-eight years from tonight, a plague will kill perhaps half of England. Labour will become precious, and men like you will start to say no. Serfdom will die slowly. But it will die."
**Action / expression:** Over the sleeping family, a slow graphic transition: the rain becomes falling pages of court rolls; names are struck through (1348); then a crowd with banners (1381); then a document labelled "manumission". Walter sleeps on.
**Environment:** The cottage dissolving into a parchment montage.
**Camera:** A very slow continuous push towards the window.
**Lighting:** Dark grading into vellum gold.
**Sound:** The rain fades; a single tolling bell; distant crowds; silence.
**History:** The Black Death reached England in 1348. ⚑ Deaths are estimated at 30–50% or more of the population. Labour shortages weakened villeinage; the Peasants' Revolt came in 1381; serfdom faded out over the 15th–16th centuries.

#### Scene 56 · The Furrow Remembers — ⏱ 21
**Narration:** "You'll leave no portrait, no letter, perhaps one line in a court roll. But walk across an English field today, and look closely. The ridges and furrows you ploughed are still there."
**Action / expression:** The camera rises through the cottage roof into a modern dawn over green pasture with grass-covered ridge and furrow. For one beat, a faint 2D Walter outline stands in a furrow with sickle on shoulder, looking straight at camera with a small, tired smile, then fades.
**Environment:** Present-day Midlands pasture: sheep, a hedge, clear corrugated ridge and furrow.
**Camera:** A continuous crane up and out, then a slow aerial glide along the ridges (mirroring Scene 19's ground-level glide).
**Lighting:** Night turning into modern dawn: cool blue warming to gold.
**Sound:** Birdsong; a distant modern tractor; the family motif plays in full for the first time.
**History:** Medieval ridge and furrow survives in many Midlands pastures and is visible from the air.
**End card:** *The Dust of the Furrow*, over black, then credits.

---

## 5. Production notes

- **Rig extensions needed** (on the same `Stickman` rig, without changing Walter): a long-gown (kirtle) silhouette and veil, wimple and coif headwear; child proportions (head scale and limb-length preset); hand props at the wrist (sickle, cup, spindle, coins, seal, tally stick); and extra expressions (grimace, aghast, fear, relief).
- **The cottage set** (built) covers about a quarter of the film. **The open-fields set** is the next most important build.
- **Graphic overlays** (parchment, rope, roll entries, crossed-out potato, Domesday montage) are 2D layers in Remotion, which are cheap to render.
- Everything stays deterministic: every movement comes from `useCurrentFrame()`, and every bit of "randomness" from seeded generators.

## 6. Sources and further reading

These established works are the basis for the details above; check the flagged items against them.
- Mark Bailey, *The English Manor c.1200–c.1500* (2002): documents on services, merchet, mills, courts
- H. S. Bennett, *Life on the English Manor, 1150–1400* (1937)
- Christopher Dyer, *Standards of Living in the Later Middle Ages* (1989) and *Making a Living in the Middle Ages* (2002)
- Judith M. Bennett, *Ale, Beer, and Brewsters in England* (1996)
- Barbara A. Hanawalt, *The Ties That Bound: Peasant Families in Medieval England* (1986): coroners' rolls
- Zvi Razi, *Life, Marriage and Death in a Medieval Parish: Halesowen 1270–1400* (1980)
- Rodney Hilton, *Bond Men Made Free* (1973): peasant resistance and ancient demesne
- William Chester Jordan, *The Great Famine* (1996)
- Philip Slavin, work on the 1319–1321 cattle murrain
- P. D. A. Harvey (ed.), *The Peasant Land Market in Medieval England* (1984)
- Rosamond Faith, on the St Albans querns and the 1381 rising
