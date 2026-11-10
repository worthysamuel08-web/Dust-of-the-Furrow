# The Dust of the Furrow — "You Wake Up as a Medieval Peasant"

Documentary storyboard and narration · 56 scenes · target runtime 3–7 minutes

| | |
|---|---|
| **Setting** | A fictional manor ("Ashcombe") in the open-field country of the English Midlands, one day in early August 1320, during the grain harvest |
| **Point of view** | Second person. The narrator speaks to "you"; you *are* the stickman villein |
| **Main character** | Walter atte Brook (fictional), a villein holding about half a virgate (≈15 acres) |
| **Format** | 2D cartoon stickman rig composited into stylised 3D Three.js sets, assembled in Remotion |
| **Status** | Scene 1 is built and locked (`src/scenes/scene1`). Scenes 2–56 are storyboard only |

> **Reading the flags.** ⚑ marks a detail that is uncertain, debated, varied a lot between manors, or is an estimate. "Fictional" marks invented names and places used to tell a typical story. Everything else is well established in the scholarship listed at the end. These facts were drafted from established historical literature, but I did not look anything up while writing this. Please check the flagged items, and ideally the key figures, before narration is recorded.

---

## 1. Runtime

| Act | Scenes | Time of day | Duration |
|---|---|---|---|
| I · Dawn at home | 1–11 | ~5:00–6:00 | 1:24 |
| II · The village | 12–25 | ~6:00–7:00 | 1:36 |
| III · The lord's harvest | 26–37 | ~7:00–13:00 | 1:17 |
| IV · What you owe | 38–45 | afternoon | 0:54 |
| V · Evening and night | 46–56 | ~17:00–21:00 | 1:21 |
| **Total** | **56 scenes** | | **6:32 (392 s)** |

The runtime is checked by script against the per-scene durations below: total, words per scene, and speaking rate. Narration totals 864 words, written for at most 2.4 words per second (about 145 words per minute) in any scene, with an average of 2.2, leaving a beat of silence in most scenes. The ⏱ figure in each heading is that scene's duration in seconds.

---

## 2. Continuity bible

### Walter (you): locked design from Scene 1
- `<Stickman>` with `PEASANT_PALETTE`, `DIMENSIONS` unchanged: large clean white round head, black line limbs, white mitten hands and feet, muted brown tunic with a sewn patch and a rope belt, light stubble.
- His default `headTurn` faces 3/4 right. His expression baseline is tired: heavy lids (`eyeOpen` ≈ 0.6) and slightly worried brows (`browTilt` ≈ 0.3).
- **New for later scenes, added as props or overlays, never by changing his rig:** hose and turnshoes (Scene 7), a hood (worn from Scene 7 onwards), a sickle prop (Scenes 29–47).
- He keeps the same `light`/`tint` approach in every set, so he always reads brighter than the environment.

### Supporting cast: same rig and line style, distinguished only by costume, palette and scale
| Character | Scale | Costume / palette | Notes |
|---|---|---|---|
| **Alice**, wife (fictional) | 0.95 | long kirtle to the ankles (dull blue-grey), white linen veil and wimple | Needs a gown and headwear component on the same rig |
| **Joan**, 15 | 0.9 | russet kirtle, linen coif | Old enough to marry |
| **Hugh**, 9 | 0.7 | short tunic, bare legs | Head-to-body ratio slightly larger (child) |
| **Agnes**, 5 | 0.6 | small kirtle, coif | |
| **Baby** | 0.3 | swaddled; only the head is visible | Lies in a wooden cradle |
| **Gilbert the reeve** (fictional) | 1.0 | green hood, tally stick | A villein like Walter |
| **The hayward** | 1.0 | grey tunic, cow horn | |
| **Father William**, parish priest (fictional) | 1.0 | black cassock, tonsure | |
| **Matilda the alewife** (fictional) | 0.95 | apron, veil | |
| **The miller** | 1.05 | floury white palette | |
| Villagers, reapers | 0.9–1.05 | palette variants of the tunic | Deterministic, seeded variety |

The lord **Sir Roger** (fictional) is never shown, only his hall, his pigeons and his officials. His absence is the point.

### Reusable 3D environments
| Set | Scenes | Status |
|---|---|---|
| Cottage interior | 1–9, 50–55 | Built (Scene 1) |
| Croft and toft behind the cottage | 8, 10, 49 | New |
| Village street, green and well | 12–14, 48 | New |
| Parish church: exterior with scratch dial, interior with wall painting | 15–17, 52 | New |
| Manor house, dovecote and mill | 18, 21–23 | New |
| Open fields (strips, ridge and furrow, stooks) | 24–37, 42–47 | New; the biggest set and the most reused |
| Flashback treatments (sepia, desaturated) | 33, 34, 55, 56 | Post-process tints via CSS overlay |
| Modern-day ridge and furrow pasture | 56 | New, simple |

### Audio palette
Wind across stubble, rooks, skylarks, sheep, hens, the creak of the cart, sickles hissing through straw, a single church bell (tenor), a cow horn, the hearth crackling, a wooden spindle whorl, rain on thatch (flashback). Music: a sparse drone (a hurdy-gurdy or bowed psaltery feel) with one small melodic motif for the family, kept low under the narration.

---

## 3. Scenes

### ACT I · DAWN AT HOME

#### Scene 1 · The Soil of 1320 — ⏱ 15
**Status:** BUILT. Do not modify. Narration is laid over the existing picture: it starts around 2.0 s, after the title card, and the last line lands as he looks around (around 12 s).
**Narration:** "England, thirteen-twenty. You wake to smoke, straw and cold. You are not a knight, a monk or a merchant. You are a villein, and this is your day."
**Action / expression:** (existing) He sleeps, his eyes flutter open, he raises his head, sits up, yawns, looks around tired and confused, and scratches his head.
**Environment:** One-room wattle-and-daub cottage, timber frame, cruck truss, thatch, straw mattress, open hearth, trestle table, chest, tools on pegs.
**Camera:** Wide establishing shot, then a slow push-in and arc to a medium shot of the bed.
**Lighting:** Pre-dawn gloom, then a shaft of morning sun through the small barred window with dust in it; embers glowing.
**Sound:** Hearth crackle, distant cockerel, a rook outside, his yawn, straw rustling.

#### Scene 2 · The Cold Half of the Bed — ⏱ 7
**Narration:** "The other half of the bed is already cold. Your wife, Alice, rose before you."
**Action / expression:** Walter pats the empty mattress beside him. His brow lifts in mild surprise, then he gives a small, fond, weary smile.
**Environment:** Same cottage. A dent in the straw where she slept, and a second (woollen) blanket folded back.
**Camera:** Low close shot along the mattress at his hand, then a slow tilt up to his face.
**Lighting:** The window shaft now falls across the empty side.
**Sound:** Straw crunch, a hen clucking outside the door.
**History / continuity:** This explains why the family isn't visible in Scene 1: they rose first. Women's work commonly began before dawn (fire, water, animals). ⚑ How exactly families shared beds and pallets varied.

#### Scene 3 · Your Name in the Lord's Roll — ⏱ 7
**Narration:** "On the lord's rolls you are Walter atte Brook: a villein. Unfree. Bound to this manor."
**Action / expression:** Walter stands. A parchment roll unfurls in 2D overlay beside him, his name in Latin court hand: *Walterus atte Broke, nativus*. He glances at it uneasily.
**Environment:** Cottage, with a stylised parchment overlay.
**Camera:** Static medium shot, then a slow push onto the parchment.
**Lighting:** Warm interior; the parchment is lit as if by candle.
**Sound:** A quill scratching, parchment unrolling.
**History:** Manorial court rolls are often written in Latin; *nativus* ("born unfree") is a standard term for a villein. Villeins were not slaves: they had rights in the king's courts against everyone except their own lord. Name and manor are fictional; "atte Brook" is a typical byname of the period.

#### Scene 4 · A House of Mud and Oak — ⏱ 7
**Narration:** "Oak posts, hazel, mud: wattle and daub. No chimney. The smoke seeps out through the thatch."
**Action / expression:** Walter pats a wall. Dust falls; he coughs, waving it away, and looks up at the smoke drifting into the roof.
**Environment:** Cottage close-up: a patch of exposed wattle, sooty rafters, smoke gathering under the ridge.
**Camera:** Close shot on the wall, then a crane/tilt up following the smoke into the thatch.
**Lighting:** A cool beam of daylight through the smoke haze.
**Sound:** Crumbling daub, a cough, a soft wind hum in the thatch.
**History:** Open central hearths without chimneys were normal in peasant houses; smoke escaped through the roof or a louvre. ⚑ House size and layout varied by region and wealth; many villein houses were two or three bays, and some regions had longhouses shared with animals.

#### Scene 5 · Alice at the Hearth — ⏱ 7
**Narration:** "Alice is back from the well with water. She coaxes last night's embers back to flame."
**Action / expression:** Alice enters (door opens, a bright slot of daylight), sets down a wooden bucket, kneels and blows on the embers. Flames rise. Her face shows quiet concentration.
**Environment:** Cottage, hearth area.
**Camera:** Medium two-shot from behind the hearth with flames in the foreground, then a slow push on Alice.
**Lighting:** A warm orange glow rises on her face.
**Sound:** Bucket thud, a breath blowing, kindling catching.
**History:** Keeping embers alive overnight under ash (see Scene 54) saved the labour of making fire with flint and steel.

#### Scene 6 · The Children — ⏱ 8
**Narration:** "Four children survive: Joan, fifteen. Hugh, nine. Little Agnes. And the baby. Two more lie in the churchyard."
**Action / expression:** The children enter one at a time, each in a little pose. On "two more", Walter's and Alice's faces fall: a shared glance.
**Environment:** Cottage; a wooden cradle by the hearth.
**Camera:** Lateral dolly along the line of children, ending on the parents' glance.
**Lighting:** Warm hearth light; the window is brighter now.
**Sound:** The baby gurgling, children's footsteps, then the music drops to a single held note.
**History:** High child mortality is well attested. ⚑ The family size and the deaths are fictional but typical.

#### Scene 7 · Dressing for the Day — ⏱ 7
**Narration:** "You slept in your clothes. Now: hose, leather shoes, a rope belt, and your hood."
**Action / expression:** Quick, rhythmic cuts: hose pulled on, a shoe, the belt tightened (he sucks in his stomach comically), the hood flipped up. He holds a proud little pose.
**Environment:** Cottage, by the peg where the hooded cloak hangs (from Scene 1).
**Camera:** Locked-off medium shot, with jump cuts on each garment.
**Lighting:** Even morning light.
**Sound:** Fabric rustles timed to each cut, a belt creak.
**History:** Wool tunics, linen undershirts, hose and hoods were standard; shoes were leather "turnshoes". ⚑ Sleeping dress is poorly documented and may have been nothing, a shirt, or day clothes.

#### Scene 8 · The Privy and the Wash — ⏱ 7
**Narration:** "The privy is a pit at the bottom of the croft. The wash: cold water."
**Action / expression:** Walter hurries out to a wattle screen in the croft (shown tastefully: just the screen and a relieved face), then splashes his face and shivers.
**Environment:** The croft behind the house: a wattle privy screen, a wooden bowl on a stump.
**Camera:** Wide shot from the back door, then a close-up of the splash.
**Lighting:** Cool early-morning light with dew haze.
**Sound:** Birdsong, a splash, a sharp intake of breath.
**History:** Cesspits and latrine pits are common finds. People did wash hands and face daily; full bathing was rarer. The "filthy medieval peasant" is largely a myth.

#### Scene 9 · Bread and Ale — ⏱ 5
**Narration:** "Breakfast: dark bread and weak ale. Everyone drinks ale, even the children."
**Action / expression:** Walter tears dense bread with effort (chewing hard, eyes wide), sips ale and nods. Hugh drinks from a small wooden cup.
**Environment:** Trestle table: jug, wooden bowls, a loaf (from the Scene 1 set).
**Camera:** Overhead shot of the table, then a 3/4 close-up of the chewing.
**Lighting:** Warm.
**Sound:** Bread tearing, liquid pouring, chewing.
**History:** Bread was often maslin (wheat and rye) or barley; ale was a staple food. ⚑ The idea that people "never drank water" is a myth, and water was drunk too. ⚑ Whether peasants ate a regular breakfast is debated; working people commonly took something early.

#### Scene 10 · The Croft — ⏱ 6
**Narration:** "Behind the house, your croft: a pig, six hens, leeks, peas, beans and cabbages."
**Action / expression:** Walter scatters grain for the hens; the pig snuffles at his shoes and he nudges it away, grinning.
**Environment:** Croft: wattle fencing, a small pigsty, a garden in rows, an apple tree.
**Camera:** Slow crane up and back to reveal the croft behind the cottage roof.
**Lighting:** Low golden sun, long shadows.
**Sound:** Hens clucking, the pig grunting, a skylark.
**History:** Tofts and crofts held gardens and small livestock. Pigs were the peasant's main source of meat.

#### Scene 11 · No Clocks, Only Bells — ⏱ 8
**Narration:** "You own no clock. Nobody here does. Your day is told by the sun and the church bell."
**Action / expression:** Walter squints at the sun, shading his eyes. A distant bell rings and his head turns towards it.
**Environment:** Croft, with the church tower visible over the rooftops.
**Camera:** Medium shot, then a rack-focus style push towards the distant tower.
**Lighting:** Sun flare.
**Sound:** A single bell, three slow strokes.
**History:** Mechanical clocks were just appearing in a few great churches by the 1280s–1320s. A village had none.

### ACT II · THE VILLAGE

#### Scene 12 · Into the Village — ⏱ 7
**Narration:** "Outside, the village wakes: thirty-odd houses along a muddy street, each with its toft and croft."
**Action / expression:** Walter steps out with his sickle over his shoulder, nodding to neighbours who wave back.
**Environment:** The village street: a row of thatched houses with fences, geese, a cart in a rut, smoke rising from the thatch.
**Camera:** A long tracking shot at walking pace beside him (parallax on the houses).
**Lighting:** Morning sun across the street; smoke catching the light.
**Sound:** Geese, a dog barking, hammering in the distance, greetings.
**History:** ⚑ Thirty-odd households is fictional but a plausible size for a Midlands village.

#### Scene 13 · Gossip at the Well — ⏱ 5
**Narration:** "At the well, the village's news travels faster than any messenger."
**Action / expression:** Women at the well lean in and whisper; one points at Walter. He raises an eyebrow and walks on, quickening his pace.
**Environment:** The village green, a stone-lined well, a wooden bucket and windlass.
**Camera:** Over-the-shoulder shot from the women towards Walter.
**Lighting:** Bright morning.
**Sound:** Murmured chatter, the windlass creaking.

#### Scene 14 · The Ale-Stake — ⏱ 7
**Narration:** "A bush on a pole: Matilda has brewed. Sell bad ale, and the ale-tasters fine her."
**Action / expression:** Matilda hangs a leafy bush on a pole above her door. An official sips, grimaces theatrically, and makes a tally notch. Matilda folds her arms, annoyed.
**Environment:** The alewife's house: a large brewing vat seen through the door.
**Camera:** Medium shot, a whip-pan to the taster, then a close-up of the grimace.
**Lighting:** Warm interior seen through the door against the bright street.
**Sound:** Liquid sloshing, a disgusted "hmm", a knife notching wood.
**History:** Ale-stakes advertised a fresh brew. Brewing for sale was largely women's work. The Assize of Bread and Ale regulated price and quality, enforced by ale-tasters, and fines for breaking it were routine. Ale was unhopped; hopped beer became common in England only later, in the 15th century.

#### Scene 15 · The Church — ⏱ 7
**Narration:** "The church is the biggest building you know. Inside, Judgement Day is painted on the wall."
**Action / expression:** Walter enters, looks up, and his eyes widen. A painted devil (2D, on the wall) pitchforks sinners. He gulps.
**Environment:** Interior of a stone parish church: a whitewashed nave, a painted Doom over the chancel arch, a rood screen, a rush-strewn floor.
**Camera:** A low-angle tilt up from Walter to the painting, then a slow push.
**Lighting:** Cool, dim nave; a shaft through a small lancet window; candles at the altar.
**Sound:** Reverberant footsteps, a hush, a faint choral hum.
**History:** Wall paintings were common in parish churches. ⚑ Many surviving Doom paintings date from the later 14th–15th centuries; a 1320 church might have other painted scenes instead.

#### Scene 16 · The Sundial in the Stone — ⏱ 7
**Narration:** "On the south wall, a scratched sundial marks the hours of Mass. Your only clock."
**Action / expression:** Walter traces the radiating lines with a finger. A stick's shadow sits on a line; he nods: he's late. He hurries off.
**Environment:** The church's south wall: a small scratch dial (a semicircle of lines with a central hole and a gnomon).
**Camera:** Extreme close-up on the dial, then a pull back to reveal him.
**Lighting:** Hard sunlight with a crisp shadow on the dial.
**Sound:** A finger on stone, a soft "tsk".
**History:** Scratch dials (mass dials) survive on many English churches and were used to time services.

#### Scene 17 · A Tenth of Everything — ⏱ 6
**Narration:** "Father William takes a tenth of everything you grow: grain, lambs, even your eggs."
**Action / expression:** The priest smiles benignly, holding a basket. Items fly into it in 2D (a sheaf, a lamb, an egg), each with a "tick". Walter forces a polite smile.
**Environment:** The church porch.
**Camera:** Two-shot, then a punch-in on Walter's strained smile.
**Lighting:** Shade of the porch.
**Sound:** Comic ticks, a lamb's bleat.
**History:** Tithes were owed on crops (the great tithes) and on young animals and produce such as eggs and milk (the lesser tithes). Parish priests were often addressed as "Sir".

#### Scene 18 · The Lord You Never See — ⏱ 8
**Narration:** "Past the church stands Sir Roger's manor house. You'll rarely see him. You'll feel him every day."
**Action / expression:** Walter pauses at the gate and looks up at the hall; his shoulders sink a little.
**Environment:** A manor house: stone hall, timber outbuildings, a barn, a walled courtyard, a banner.
**Camera:** A slow crane up over the gate to reveal the hall, with Walter small in the foreground.
**Lighting:** The sun behind the hall puts it in silhouette.
**Sound:** Distant hooves, a heavy gate creaking.
**History:** Many manors had absentee or rarely resident lords and were run by a steward, a bailiff and a reeve. Sir Roger is fictional.

#### Scene 19 · The Reeve, One of Your Own — ⏱ 8
**Narration:** "His reeve, Gilbert, is a villein like you, chosen to drive his own neighbours to the lord's work."
**Action / expression:** Gilbert, with his tally stick, gives an awkward, apologetic wave. Walter gives a flat look.
**Environment:** The manor courtyard: carts and barns.
**Camera:** A shot-reverse-shot pair.
**Lighting:** Midday-bright courtyard.
**Sound:** The tally stick tapping a palm.
**History:** Reeves were usually villeins, often chosen by the tenants or the court, and the post was frequently unwelcome. Gilbert is fictional.

#### Scene 20 · Ten Men, One Responsibility — ⏱ 7
**Narration:** "Every man over twelve belongs to a tithing, about ten men answerable for each other's crimes."
**Action / expression:** Ten stickmen (Walter among them) are linked by a 2D rope that tightens when one of them steps out of line. Everyone glares at him.
**Environment:** An abstract space: the village green behind a stylised overlay.
**Camera:** Wide group shot, then a quick zoom on the culprit.
**Lighting:** Flat graphic light.
**Sound:** A rope creaking, a collective "ahem".
**History:** Frankpledge: males aged 12 and over were enrolled in tithings and checked at the "view of frankpledge". ⚑ Tithing size and practice varied by region.

#### Scene 21 · The Mill You Must Use — ⏱ 7
**Narration:** "You must grind your grain at the lord's mill, and the miller keeps a share."
**Action / expression:** The miller scoops a measure off Walter's sack into his own bin with a sly smile. Walter's eye twitches.
**Environment:** A timber watermill: a turning wheel, a millstream, a sack hoist.
**Camera:** A wide shot of the wheel, then an interior close-up on the scoop.
**Lighting:** Sparkling water reflections; the interior is flour-hazy.
**Sound:** The water wheel, grinding stones, trickling flour.
**History:** Suit of mill (compulsory use) and multure (a toll paid in grain) were standard. ⚑ The rate varied, often around 1/16 to 1/24. Millers' reputation for cheating is a medieval cliché.

#### Scene 22 · The Forbidden Hand-Mill — ⏱ 7
**Narration:** "Hand-mills at home are forbidden. One abbot will even pave his floor with confiscated querns."
**Action / expression:** Walter glances guiltily at a small stone quern hidden under straw. Cut to a stylised vision of a floor paved with querns, which he stares at aghast.
**Environment:** The cottage corner, then a stylised abbey parlour.
**Camera:** A tilt down to the hidden quern; a top-down shot of the paved floor.
**Lighting:** Shadowy, conspiratorial.
**Sound:** Stone scraping, an echoing "clack".
**History:** Lords suppressed hand-mills to protect mill income. The St Albans episode, in which Abbot Richard of Wallingford confiscated querns and used them to pave a floor, is dated around 1331 and was remembered in 1381. ⚑ The narration says "will" because it is about a decade after 1320.

#### Scene 23 · The Lord's Pigeons — ⏱ 7
**Narration:** "Only the lord may keep doves. They eat your seed; you may not touch them."
**Action / expression:** A flock lifts off a round stone dovecote and descends on a strip. Walter waves his arms, then freezes as Gilbert watches, and lowers them.
**Environment:** A round dovecote by the manor, seen against a field edge.
**Camera:** Follows the flock in a sweeping arc down to Walter.
**Lighting:** Bright.
**Sound:** Wing claps, cooing, a frustrated grunt.
**History:** Keeping doves was a manorial privilege. ⚑ Flock sizes varied; large dovecotes held hundreds of birds.

#### Scene 24 · The Open Fields — ⏱ 6
**Narration:** "Your land isn't one farm. It's thirty-odd narrow strips scattered across great unfenced fields."
**Action / expression:** Walter stands at the field's edge. His strips light up one by one, scattered across the landscape. He counts on his fingers, then gives up.
**Environment:** A vast open-field landscape: long strips of wheat, barley and peas, no hedges between strips, balks and headlands, the village behind.
**Camera:** A high, slow drone-style pull-up and pull-out from Walter to the whole field system.
**Lighting:** Early morning gold over the grain.
**Sound:** Wind in the grain, larks.
**History:** Open-field farming in strips (selions) grouped in furlongs, across two or three fields with crop rotation, was typical of the Midlands. ⚑ The number of strips is illustrative; a half-virgate was about 15 acres, though a virgate's size varied.

#### Scene 25 · Ridge and Furrow — ⏱ 7
**Narration:** "Ploughing heaps each strip into a ridge, a furrow between: the dust of the furrow."
**Action / expression:** Walter crouches and lets soil run through his fingers. A quiet, thoughtful face.
**Environment:** A close, low view of the corrugated ridges and furrows.
**Camera:** A ground-level glide along a furrow (the strongest parallax shot in the film), ending on his hand.
**Lighting:** Raking sun that picks out the ridges.
**Sound:** Soil trickling; the music's title motif.
**History:** Ridge and furrow was formed by ploughing with a heavy mouldboard plough, turning the soil inwards along each strip.

### ACT III · THE LORD'S HARVEST

#### Scene 26 · The Hayward's Horn — ⏱ 6
**Narration:** "A horn sounds. The hayward is calling the village to the lord's harvest."
**Action / expression:** The hayward blows a cow horn; heads pop up across the field; Walter sighs and shoulders his sickle.
**Environment:** The edge of the lord's demesne field.
**Camera:** A wide shot with the hayward silhouetted, then a cut to Walter's sigh.
**Lighting:** Brightening morning.
**Sound:** A cow-horn blast echoing.
**History:** The hayward oversaw crops, fences and labour at harvest.

#### Scene 27 · Boon Day — ⏱ 7
**Narration:** "A boon day: everyone but your wife must reap the lord's corn before your own."
**Action / expression:** Walter, Joan and Hugh trudge into the demesne field in a line; Alice stays at the gate holding the baby, waving.
**Environment:** The lord's wheat field: tall golden grain and a long line of reapers.
**Camera:** A wide side-on tracking shot of the line walking in.
**Lighting:** Strong, warm sun.
**Sound:** Footsteps in stubble, a murmur of reapers.
**History:** Boon works (precariae) were extra harvest services. Some customals required the whole household except the housewife. ⚑ Who was required varied by manor.

#### Scene 28 · The Sickle — ⏱ 6
**Narration:** "Grab a fistful of stalks. Cut. Lay it down. Step. Again. For hours."
**Action / expression:** A rhythmic reaping cycle, timed to the narration's beats. His face grows sweatier and his lids heavier with each repeat.
**Environment:** In among the standing wheat.
**Camera:** A close side shot, with match cuts at each "again" to show time passing (the sun moves).
**Lighting:** The sun climbs across the cuts.
**Sound:** The sickle's hiss and crunch in rhythm, a grunt.
**History:** Wheat was usually reaped with a sickle, often cut high. Scythes were used more for hay.

#### Scene 29 · Binding Sheaves — ⏱ 6
**Narration:** "Joan follows, twisting straw into bands, binding sheaves and stacking them into stooks."
**Action / expression:** Joan's fast hands twist straw, tie it, and stand the sheaves in a stook. A small proud smile.
**Environment:** Stubble with a growing row of stooks.
**Camera:** A dolly along the row of stooks.
**Lighting:** Midmorning glare.
**Sound:** Straw twisting and thumping.

#### Scene 30 · Small Hands — ⏱ 7
**Narration:** "Hugh scares off crows and carries water. At nine, he's a working man in miniature."
**Action / expression:** Hugh runs, flapping a cloth at crows, then wobbles under a water pot. He gives a determined frown.
**Environment:** The field margin and hedge.
**Camera:** A low child's-eye shot following Hugh.
**Lighting:** Bright.
**Sound:** Crows cawing, a little shout, water sloshing.
**History:** Children worked from an early age: herding, bird-scaring, gleaning.

#### Scene 31 · The Tenth Sheaf — ⏱ 6
**Narration:** "Every tenth sheaf is marked and left standing. It belongs to the Church."
**Action / expression:** Walter ties a twist of straw round one sheaf and steps back from it, giving it a reverent little nod.
**Environment:** The stooks in a row, with one sheaf marked.
**Camera:** A slow push on the marked sheaf; the others go soft.
**Lighting:** The marked sheaf catches the sun.
**Sound:** The music drops to a soft bell tone.
**History:** The great tithe was taken in the field as sheaves, to be collected by the rector or his agent.

#### Scene 32 · The Hungry Years — ⏱ 7
**Narration:** "Five years ago, the rain never stopped. The grain rotted. Perhaps one in ten died."
**Action / expression:** FLASHBACK in sepia: Walter, thinner, in rain, holding a rotten ear of grain. Back to the present: he swallows hard.
**Environment:** The same field, waterlogged, under a grey sky.
**Camera:** A slow drift through the rain, then a hard cut back to a close-up.
**Lighting:** Desaturated, cold, drizzling.
**Sound:** Heavy rain on stubble, a child crying faintly, then silence.
**History:** The Great Famine of 1315–1317 followed years of extreme rain. ⚑ Mortality is estimated at about 5–12% of the population, varying by region.

#### Scene 33 · The Empty Ox Stall — ⏱ 7
**Narration:** "Now a plague kills the cattle. Across England, oxen are dying. Your plough team is short."
**Action / expression:** Walter stands by an empty stall where a yoke hangs unused. His hand rests on the beam; grief, then worry.
**Environment:** A shared ox-house in the village: straw and an empty manger.
**Camera:** A slow lateral move past the empty stalls.
**Lighting:** Dim barn light, dust.
**Sound:** A lone ox lowing in the distance, flies buzzing.
**History:** The great cattle murrain of about 1319–1321 (probably rinderpest) killed huge numbers of cattle and oxen. ⚑ Loss estimates are high but uncertain. Peasants often pooled oxen to make up plough teams.

#### Scene 34 · Wet Boon, Dry Boon — ⏱ 7
**Narration:** "Noon: the lord feeds his reapers bread and cheese. Some boon days bring ale. Not today."
**Action / expression:** The reapers sit in a row; bread is handed out. Walter peers into his empty cup and frowns. Comic sigh along the whole row.
**Environment:** A headland under a hedge; a cart with baskets.
**Camera:** A dolly along the row of eaters, ending on the empty cup.
**Lighting:** High noon, short shadows; shade under the hedge.
**Sound:** Munching, a sad clink of an empty cup, insects.
**History:** Customals specify boon meals, and some distinguish ale boons from "dry" boons without drink. ⚑ Menus and terms varied by manor.

#### Scene 35 · Blood on the Stubble — ⏱ 7
**Narration:** "A sickle slips. Small wounds can kill; the coroners' rolls are full of such deaths."
**Action / expression:** A neighbour clutches his hand. Walter rushes over and binds it with a strip of linen. Tight, worried faces.
**Environment:** In the field.
**Camera:** A handheld-feeling quick push in (the only "nervous" camera in the film), then stillness.
**Lighting:** Harsh sun.
**Sound:** A yelp, cloth tearing, breathing.
**History:** Coroners' rolls record accidental deaths (falls, drownings, farm accidents) and are a key source on rural life. ⚑ Infection risk and treatments are generalised here.

#### Scene 36 · Your Own Wheat, Waiting — ⏱ 6
**Narration:** "Meanwhile your own wheat stands ripe, and every day of rain could ruin it."
**Action / expression:** Walter looks across to his own strip in the distance, then up at a cloud. Anxious.
**Environment:** View from the demesne towards the tenant strips.
**Camera:** Over his shoulder, then a tilt to the sky.
**Lighting:** One cloud's shadow drifts across the field.
**Sound:** A wind gust, distant thunder (or not).

#### Scene 37 · The Afternoon Sun — ⏱ 5
**Narration:** "The sun crawls west. The reeve counts every sheaf."
**Action / expression:** Time-lapse: the shadows swing, the stooks multiply; Gilbert notches his tally.
**Environment:** The demesne field.
**Camera:** A locked-off wide time-lapse.
**Lighting:** Sun arcs from noon to mid-afternoon.
**Sound:** Accelerated field ambience, tally notches.

### ACT IV · WHAT YOU OWE

#### Scene 38 · Week-Work — ⏱ 7
**Narration:** "Most weeks you owe the lord two or three days' work. More at harvest. Plus rent."
**Action / expression:** A 2D calendar overlay: the days of the week flip, and some turn red as "lord's days". Walter's own days shrink.
**Environment:** Walter in the field, with a graphic overlay.
**Camera:** Static medium shot with the graphic.
**Lighting:** Afternoon.
**Sound:** Calendar flips, a weighty thud on each red day.
**History:** Week-work was characteristic of villein tenure on many manors. ⚑ The number of days varied widely, and by 1320 many services had been commuted to money rents.

#### Scene 39 · Three Coins — ⏱ 6
**Narration:** "Rent is silver pennies. Only three coins exist for you: penny, halfpenny, farthing."
**Action / expression:** Walter tips a few coins into his palm and counts them, lips moving. The coins appear in close-up: small, thin and silver.
**Environment:** Close-up in the field.
**Camera:** Macro shot of the palm.
**Lighting:** Silver glint.
**Sound:** Coins chinking.
**History:** After Edward I's recoinage of 1279, round halfpennies and farthings were struck alongside the penny. ⚑ A groat was briefly issued in 1279 but did not circulate widely until 1351.

#### Scene 40 · The King's Men — ⏱ 6
**Narration:** "The king takes too: taxes on your goods, and purveyors seizing grain and beasts."
**Action / expression:** A royal official on horseback points at Walter's pig; it's led away. Walter reaches out and is helpless.
**Environment:** The village street.
**Camera:** A low angle on the horseman, then a high angle on Walter.
**Lighting:** Afternoon, slightly overcast.
**Sound:** Hooves, a squealing pig, a parchment unrolled.
**History:** Lay subsidies taxed movable goods at fractions such as a tenth or a fifteenth. Royal purveyance (compulsory purchase, often underpaid or unpaid) was a bitter grievance under Edward I and Edward II. ⚑ Whether a particular household lost a pig is illustrative.

#### Scene 41 · Joan's Marriage Price — ⏱ 7
**Narration:** "Joan wants to marry. First you must pay the lord a fine called merchet, for permission."
**Action / expression:** Joan and a shy young man exchange glances; Walter hands Gilbert some coins and grimaces. Joan beams.
**Environment:** The village green.
**Camera:** A two-shot of the couple, then a cut to the coin hand-off.
**Lighting:** Warm afternoon.
**Sound:** A coin clink, a giggle.
**History:** Merchet was a fine paid when an unfree woman married, and was widely regarded as a mark of villein status. ⚑ The amount varied, and liability fell on the woman or her father depending on the manor.

#### Scene 42 · You May Not Leave — ⏱ 7
**Narration:** "You may not leave without the lord's licence. Run, and he can drag you back."
**Action / expression:** Walter gazes at a road leading away over a hill. He takes one step, hesitates, steps back. Longing, then resignation.
**Environment:** A road at the edge of the fields; a distant town on the horizon (walls, a spire).
**Camera:** A slow push past Walter towards the horizon, then a pull back to him.
**Lighting:** A haze that softens the distant town.
**Sound:** A lone bird, the wind. The music swells and then pulls back.
**History:** (Not in the narration, but useful for an on-screen caption.) Villeins needed licence to leave and might pay chevage to live elsewhere. Lords could reclaim fugitives. The "year and a day" rule for privileged towns appears in English legal tradition. ⚑ In practice, enforcement varied.

#### Scene 43 · The Hare in the Corn — ⏱ 7
**Narration:** "A hare bolts from the corn. Catch it, and you'll be fined: game is the lord's."
**Action / expression:** A hare zigzags out; Walter lunges, then stops mid-air as he remembers. He lets it go with a sigh.
**Environment:** The last patch of standing wheat.
**Camera:** A quick pan following the hare, then a freeze-frame on his lunge.
**Lighting:** Low afternoon sun.
**Sound:** A rustle, a thump, a deflated "pff".
**History:** Lords with grants of free warren controlled the hunting of hares, rabbits and game birds; royal forest law protected deer. ⚑ Penalties varied.

#### Scene 44 · The Manor Court — ⏱ 7
**Narration:** "Next week, the manor court. Your pig strayed into the lord's barley. You'll be fined."
**Action / expression:** Walter imagines the court (a stylised hall scene): a steward at a table, a clerk writing; his name is read out and he shrinks. Back in the field, he rubs his face.
**Environment:** The field, then a vision of the manor hall court.
**Camera:** A dissolve into the vision with a slow push on the clerk's quill.
**Lighting:** Vision in a warmer, dreamlike tint.
**Sound:** A murmuring crowd, a quill scratching, a name read aloud.
**History:** The manor court (hallmote) met every few weeks and fined tenants for trespass, bad work and breaking the rules, and recorded land transfers. ⚑ Fine amounts are illustrative.

#### Scene 45 · A Seal of Your Own — ⏱ 7
**Narration:** "Yet you're no slave. Many peasants by now own seals, to sign deals for land."
**Action / expression:** Walter pulls a small bronze seal on a cord from under his tunic and presses it into wax; a little proud smile.
**Environment:** Close-up in the field, then wax on a small parchment.
**Camera:** Macro shot on the seal impression.
**Lighting:** Warm.
**Sound:** Wax pressed, a soft thunk.
**History:** Personal seals were widely used by peasants, including some unfree ones, by around 1300 for land transactions recorded in deeds and court rolls. ⚑ How widespread this was among villeins varied.

### ACT V · EVENING AND NIGHT

#### Scene 46 · Gleaners — ⏱ 6
**Narration:** "Once the carts are gone, Alice and the little ones glean the fallen ears."
**Action / expression:** Alice and Agnes, bent over, pick up ears into their aprons. Agnes holds up a single ear triumphantly.
**Environment:** Cleared stubble at golden hour.
**Camera:** A low wide shot with the figures silhouetted against the sun.
**Lighting:** Golden hour.
**Sound:** Crickets, a soft rustle.
**History:** Gleaning was customary, but village by-laws often restricted it to the poor, the young or the old, and only after the sheaves were carried. ⚑ Rules varied by village.

#### Scene 47 · Your Own Strip, At Last — ⏱ 5
**Narration:** "At last, your own strip. You reap until the light turns amber."
**Action / expression:** Walter reaps alone, slower now; he stops, straightens his back with a wince, and looks at the setting sun.
**Environment:** His own narrow strip among others.
**Camera:** A slow crane up and back to reveal how small the strip is.
**Lighting:** Deep amber, long shadows.
**Sound:** A slower sickle rhythm, a distant bell.

#### Scene 48 · The Smith's Fire — ⏱ 7
**Narration:** "On the way home, the smith sharpens your sickle. Iron is precious; you mend everything."
**Action / expression:** Sparks fly from a grindstone; the smith tests the edge; Walter nods his thanks.
**Environment:** The village smithy: forge, anvil, bellows.
**Camera:** A close-up on the sparks, then a two-shot.
**Lighting:** Orange forge glow against the blue dusk.
**Sound:** The grindstone whirr, hammer clinks, bellows.

#### Scene 49 · The Lord's Dung — ⏱ 7
**Narration:** "Your sheep must be folded on the lord's land tonight. Even their dung belongs to him."
**Action / expression:** Hugh drives three sheep into a hurdle fold on the demesne. Walter shakes his head, half laughing.
**Environment:** A hurdle sheepfold at the field's edge.
**Camera:** A wide shot of the fold, then a cut to Walter's shrug.
**Lighting:** Blue dusk.
**Sound:** Bleating, hurdles knocking.
**History:** Fold-soke (the lord's right to have tenants' sheep folded on his land, for the manure) is documented on many manors. ⚑ It was not universal.

#### Scene 50 · Pottage — ⏱ 6
**Narration:** "Supper is pottage: peas, beans, leeks, oats. Meat if you're lucky. Never a potato."
**Action / expression:** The family sits round the pot. Agnes wrinkles her nose; Walter eats gratefully. A 2D potato appears, gets a red cross, and vanishes.
**Environment:** The cottage at night: the pot over the hearth, bowls, wooden spoons.
**Camera:** A slow circular move around the family at the hearth.
**Lighting:** Firelight only: warm, flickering, deep shadows.
**Sound:** Bubbling pot, spoons scraping, crackling fire.
**History:** Pottage was the staple; peasants ate meat (especially bacon) more in this period than is often assumed, but irregularly. Potatoes arrived from the Americas in the 16th century.

#### Scene 51 · Spinning by Firelight — ⏱ 7
**Narration:** "By firelight, Alice spins wool with a distaff and spindle. Her hands are never still."
**Action / expression:** Alice's spindle twirls hypnotically as the thread grows; she glances at the cradle. Calm.
**Environment:** Cottage, by the hearth.
**Camera:** A close-up on the spindle, then a pull back to Alice.
**Lighting:** Flickering fire.
**Sound:** The whirr of the spindle, fire.
**History:** Spinning with distaff and spindle was ubiquitous women's work; the spinning wheel was only beginning to spread in England.

#### Scene 52 · The Baby's Cough — ⏱ 7
**Narration:** "The baby coughs. Perhaps one child in three won't grow up. Alice murmurs a charm."
**Action / expression:** Alice lifts the baby and rocks it, whispering; Walter kneels, hands clasped, eyes shut. Raw worry.
**Environment:** The cottage, by the cradle.
**Camera:** A very slow push in; the only near-silent scene.
**Lighting:** Low embers, faces half lit.
**Sound:** A small cough, whispering, otherwise silence.
**History:** Mixing charms, saints and prayers was normal lay piety. ⚑ Child mortality figures are estimates; between a quarter and a half of children may have died before adulthood.

#### Scene 53 · Prayers in Latin — ⏱ 8
**Narration:** "You pray in Latin: Pater Noster, Ave Maria. You don't understand every word. God, you trust, does."
**Action / expression:** Walter's lips move; on screen, Latin words float up like sparks and fade into the smoke. A small, peaceful face.
**Environment:** The cottage.
**Camera:** A tilt up following the words into the roof.
**Lighting:** Firelight; the words glow faintly.
**Sound:** Murmured Latin, fire.
**History:** The laity were expected to know the Pater Noster, the Ave Maria and the Creed, often in Latin. ⚑ Levels of understanding varied.

#### Scene 54 · News from the North — ⏱ 7
**Narration:** "Pedlar's news: Scots raid the north; the king quarrels with his barons. Not your concern. Yet."
**Action / expression:** Walter recalls the pedlar (a quick insert: a stranger with a pack, gesturing). He shrugs, then pauses, uneasy.
**Environment:** The cottage, with a memory insert of the village street at dusk.
**Camera:** A cut to the insert, then back to his uneasy pause.
**Lighting:** Firelight; the insert is blue-grey dusk.
**Sound:** Pedlar chatter, then the fire.
**History:** Scottish raids into northern England were frequent after Bannockburn (1314). Edward II's quarrels with Thomas of Lancaster and the barons led to civil war in 1321–1322.

#### Scene 55 · Banking the Fire — ⏱ 7
**Narration:** "Before sleep, Alice banks the fire under ash. A house this dry could burn in minutes."
**Action / expression:** Alice rakes ash over the embers; the room dims. The family lie down on mattress and pallets; Walter's eyes close.
**Environment:** The cottage at night (the Scene 1 set, now with the family).
**Camera:** A slow pull back to the Scene 1 framing, deliberately echoing the opening.
**Lighting:** Embers fade to near dark; moonlight through the window.
**Sound:** Ash scraping, settling straw, an owl.
**History:** Covering hearth fires at night was standard practice. ⚑ Village "curfew" bells are attested in some places; usage varied.

#### Scene 56 · The Furrow Remembers — ⏱ 14
**Narration:** "In twenty-eight years, plague will kill perhaps half of England, and serfdom will slowly die. Your name will fade. But walk an English field today, and your furrows are still there."
**Action / expression:** Over the sleeping Walter, the scene transitions in a long dissolve: the cottage fades, and the camera rises through the roof into a modern-day green pasture with grass-covered ridge and furrow under a dawn sky. A faint 2D Walter outline stands in the furrow for one beat, then fades.
**Environment:** Present-day Midlands pasture: sheep, a hedge, the clearly corrugated ridge and furrow.
**Camera:** A continuous crane up and out, then a slow aerial glide along the ridges.
**Lighting:** Night turning into modern dawn: cool blue warming to gold.
**Sound:** The night owl fades into modern birdsong and a distant tractor; the title motif returns, complete for the first time.
**History:** The Black Death reached England in 1348; ⚑ deaths are estimated at 30–50% or more of the population. Labour shortages undermined villeinage, the Peasants' Revolt came in 1381, and serfdom faded out over the 15th–16th centuries. Medieval ridge and furrow survives in many Midlands pastures.
**End card:** *The Dust of the Furrow* — over black, then credits.

---

## 4. Production notes for later scenes

- **Rig extensions required** (on the same `Stickman` rig, without changing Walter's look): a long-gown (kirtle) silhouette and veil/wimple/coif headwear; child proportions (head scale, limb lengths via `scale` plus a proportion preset); hood, sickle, cup, spindle, coins and seal as hand props attached at the wrist; a few extra expressions (grimace, aghast).
- **Scenes that reuse the Scene 1 cottage:** 2–9, 22, 50–55 (with new camera paths and the family added).
- **Highest-value new set:** the open fields (Scenes 24–47), with instanced wheat, stooks and ridge-and-furrow terrain. Build it once and redress it.
- **Graphic overlays** (parchment, calendar, rope, crossed-out potato) are 2D HTML or SVG layers in Remotion, which costs almost nothing to render.
- Keep the deterministic rule: every movement comes from `useCurrentFrame()`, and every bit of "randomness" from seeded generators.

## 5. Sources and further reading

These established works are the basis for the details above; check the flagged items against them.
- Mark Bailey, *The English Manor c.1200–c.1500* (2002): documents on services, merchet, mills, courts
- H. S. Bennett, *Life on the English Manor, 1150–1400* (1937)
- Christopher Dyer, *Standards of Living in the Later Middle Ages* (1989) and *Making a Living in the Middle Ages* (2002)
- Judith M. Bennett, *Ale, Beer, and Brewsters in England* (1996)
- Barbara A. Hanawalt, *The Ties That Bound: Peasant Families in Medieval England* (1986): coroners' rolls
- William Chester Jordan, *The Great Famine* (1996)
- Philip Slavin, work on the 1319–1321 cattle murrain
- P. D. A. Harvey, work on medieval seals and the peasant land market
- Rosamond Faith, on the St Albans querns and the 1381 rising
