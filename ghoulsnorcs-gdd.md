Ghouls n Orcs is a 2.5D side-scrolling action platformer in the spirit of Ghosts ’n Goblins, built in three.js with a strong focus on precise combat and expressive 3D character animation using fully jointed limbs.

High-level concept
Ghouls n Orcs is a brutal gothic-fantasy side scroller where a doomed knight battles undead ghouls and hulking orcs to reclaim a desecrated citadel before a blood moon rises.

The game aims to capture the weight and commitment of classic Ghosts ’n Goblins jumps and throws, but with modern 3D animation and timing that clearly communicates hitboxes and enemy intent.

Core pillars
Tight, committed actions

Fixed jump arcs, clear wind‑up on attacks, no mid‑air direction change.

Every animation frame matters; attacks trade mobility for power.

Readable 3D silhouettes

Characters and monsters are 3D rigs rendered from a side camera, with emphasized arm/leg poses and exaggerated anticipation.

Hit and hurt boxes follow the animated limbs, especially weapons and claws.

Punishing but fair combat

Enemies telegraph attacks through body mechanics: shoulder pulls, hip rotation, and arm swings.

Player survivability is low, but deaths feel avoidable once patterns are learned.

Platform and technology
Platform: Web (desktop browser, keyboard or gamepad)

Engine: Custom JavaScript game loop using three.js for rendering and basic physics.

Camera: 2.5D side-on perspective, orthographic or narrow FOV perspective locked on the player’s x‑position.

Gameplay overview
Genre: 2.5D action platformer, high difficulty, checkpoint-based.

Core loop:

Advance through linear stages

Fight ghouls/orcs and avoid traps

Collect gear and power-ups

Reach checkpoint or boss, repeat.

Win condition: Clear all stages and defeat the final Necro-Orc Warlord before the in‑game moon timer expires.
​

Loss condition: Run out of lives or let the blood moon reach its final phase, resetting progress to the start of the current chapter.

Player character
Identity: “Sir Gron”, a cursed knight in heavy armor that chips away when hit, echoing the armor-loss feedback from Ghosts ’n Goblins.

Health:

2–3 armor states (full, damaged, no armor), then death on the next hit.

Visible armor pieces fall off with physically simulated fragments.

Movement set:

Run: Constant speed; acceleration is snappy but with a 2–3 frame build‑up.

Jump: Fixed arc; no double jump; limited air control if you want a slightly more forgiving feel.

Crouch: Lowers hitbox, allows certain attacks and dodges.

Drop-through: Press down + jump at thin platforms.

Combat set:

Light throw (primary): Quick projectile (spear, axe, knife variants), limited on‑screen count like GnG weapons.

Heavy attack (secondary): Slower melee swing utilizing upper body twisting and full arm extension; uses stamina or cooldown.

Guard or dodge:

Option A: Brief shield up that reduces damage from frontal hits.

Option B: Short hop/roll with invulnerability frames but clear telegraph.

Weapons and items
Ranged weapons (only one equipped at a time):

Spear: Straight, medium rate of fire, balanced damage.
​

Throwing knives: Faster, lower damage, higher rate of fire.
​

War axe: Arcing trajectory, high damage, slower throw.
​

Cursed torch: Lobbed projectile that leaves a lingering fire patch, limited on‑screen count.
​

Melee weapons:

Longsword: Default, medium reach, simple combo of 2–3 swings.

Great mace: Slower, large arcs that hit multiple enemies.

Pickups:

Armor shards: Restore one armor state.

Souls: Score/currency for unlocks.

Relics: Passive bonuses (slightly longer i‑frames, faster recovery, projectile speed boosts).
​

Enemies
Ghouls (baseline fodder)

Shambling: Slow walkers that occasionally lunge; telegraph via full-body lean and arm reach.
​

Crawlers: Low profile; climb from pits and grab ankles.

Orcs (elite threats)

Grunt orcs: Shielded, advance blocking; must hit head or wait for attack animation to expose torso.

Berserker orcs: Fast, big wind‑up overhead swings, long recovery window after misses.

Specials

Necro-shaman: Ranged; summons skeletal arms from ground; interrupted by hitting staff.

Gargoyle: Flying; dives at parabolic arcs.

Each enemy has a clear 3‑phase animation language: idle/readiness, telegraph, follow-through with recovery, emphasizing limb motion and torso rotation for readability.

Boss design example
Stage 1 boss: “Boneforge Ogre”

Moveset:

Ground slam: Raises both arms, shoulder and elbow fully extended; shockwave on slam.

Grab: Reaches with one arm, clear forward lunge.

Rock throw: Picks up foreground rock (IK-driven arm) and throws in an arc.

Weak points: Head and back; player must bait slams to create openings.
​

Level structure
Stages: 4–6 themed stages, each with mini‑boss and final encounter.

Graveyard outskirts

Swamp of Rot

Orc war-camp

Desecrated cathedral

Citadel walls

Throne of the Warlord

Layout: Linear 2.5D paths with vertical variation (ladders, ledges, crumbling platforms).
​

Hazards: Pits, collapsing floors, spike traps, environmental projectiles (falling chandeliers, catapult barrages).

Controls (keyboard baseline)
Move: A/D or Left/Right

Jump: Space

Crouch/Drop: S or Down

Primary attack (throw): J

Secondary attack (melee heavy): K

Guard/Dodge: L

Switch weapon: Q/E

Pause/Menu: Esc

Animation and rigging focus
Rigs:

Player, ghouls, and orcs use full 3D skeletons with at least: pelvis, spine, head, upper/lower arm, hand, upper/lower leg, foot.

Two joints per limb segment (e.g., shoulder + elbow, hip + knee) for nuanced arcs.

Animation goals:

Root motion for big attacks and dodges to convey inertia.

Exaggerated anticipation: wind‑ups that scale with move danger.

Distinct holds on key poses for telegraphs (e.g., 6–10 frames).
​

Technical notes (three.js):

Use skinned meshes with SkinnedMesh and Skeleton for animated characters.
​

Employ animation mixer and multiple clips per character (run, idle, attack variants, hit reactions, death).
​

Camera and rendering
Camera:

Locked lateral tracking on player x, slight lead offset in facing direction.

Smooth vertical follow with dead‑zone to reduce motion sickness.

Rendering style:

Dark gothic palette with strong rim‑lighting to separate characters from background.
​

Background parallax layers built from low‑poly 3D meshes, fog and simple postprocessing for depth.

Difficulty and progression
Structure:

Per‑stage checkpoints; limited continues per run.
​

Completing stages yields permanent meta-progression (new starting weapons, cosmetic armor sets) without trivializing core difficulty.
​

Tuning:

Early enemies kill in 2–3 hits, late enemies in 1–2.

Bosses are pattern-heavy, with small safe windows requiring precise timing.

**** Example GDD outline (ready to fill)
You can expand this into a full document:

1. Game overview

1.1 Elevator pitch

1.2 Target audience

1.3 Platform and tech

2. Core gameplay

2.1 Core loop

2.2 Player verbs (run, jump, throw, heavy attack, guard/dodge)

2.3 Win/lose conditions

3. Controls and UX

3.1 Input mappings

3.2 HUD elements (HP/armor states, lives, weapon icon, moon timer)

3.3 Menus

4. Characters and enemies

4.1 Player stats and progression

4.2 Enemy roster with behaviors

4.3 Boss breakdowns

5. Level and world design

5.1 Stage themes

5.2 Key set-pieces

5.3 Difficulty curve

6. Systems

6.1 Weapons and items

6.2 Checkpoints and lives

6.3 Scoring and unlocks

7. Art and animation

7.1 Style reference

7.2 Rig specifications

7.3 Animation list and priorities

8. Technical

8.1 three.js scene graph structure

8.2 Asset pipeline (export from DCC to glTF, load into three.js)

8.3 Performance targets