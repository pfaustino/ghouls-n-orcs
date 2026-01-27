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

**** Game Design Document (Live)

1. Game Overview

1.1 Elevator Pitch
"Ghouls n Orcs" is a punishing 2.5D action-platformer where a cursed knight ("Sir Gron") battles through a gothic nightmare to slay the Orc Warlord. Every jump is committed, every attack has weight, and safety is a lie. It combines the deliberate mechanical difficulty of *Ghosts 'n Goblins* with the fluid readability of modern 3D animation.

1.2 Target Audience
*   Fans of "Nintendo Hard" retro platformers (Castlevania, Ghouls 'n Ghosts).
*   Speedrunners looking for optimization depth.
*   Players who enjoy high-stakes, pattern-recognition combat.

1.3 Platform and Technology
*   **Platform**: Desktop Web (Chrome, Firefox, Edge).
*   **Engine**: Custom Three.js-based framework.
*   **Input**: Keyboard (primary) and Gamepad (supported).

2. Core Gameplay

2.1 Core Loop
1.  **Traverse**: Run and jump through linear levels filled with platforming hazards and enemy ambushes.
2.  **Combat**: Engage enemies using ranged weapons (for safety) and heavy melee (for crowd control).
3.  **Survive**: Avoid damage to keep armor intact; taking hits strips armor until death.
4.  **Progress**: Reach invisible checkpoints to save progress; defeat the Stage Boss to advance.

2.2 Player Verbs
*   **Run**: Constant speed with slight acceleration/deceleration.
*   **Jump**: Committed physics arc (no air control changes once airborne).
*   **Throw (Primary)**: Throws currently equipped weapon (Spear, Knife, Axe, Torch).
*   **Heavy Attack (Secondary)**: A powerful overhead melee swing with wind-up frames. High damage, high knockback.
*   **Guard/Dodge**: A defensive maneuver to block or roll through attacks (stamina/cooldown based).

2.3 Win/Lose Conditions
*   **Win**: Defeat the Orc Warlord at the end of the stage.
*   **Lose (Death)**: Taking damage while unarmored. Respawns at last checkpoint.
*   **Lose (Game Over)**: Losing all lives resets the level.

3. Controls and UX

3.1 Input Mappings
| Action | Keyboard | Gamepad |
| :--- | :--- | :--- |
| Move | WASD / Arrows | D-Pad / Left Stick |
| Jump | Space | Bottom Face Button (A/X) |
| Attack (Throw) | J | Left Face Button (X/Square) |
| Heavy Attack | K | Top Face Button (Y/Triangle) |
| Guard | L | Right Face Button (B/Circle) |
| Swap Weapon | Q / E | Bumpers (L1/R1) |
| Pause | Esc | Start |

3.2 HUD Elements
*   **Armor Status**: Visualized directly on the player model (pieces break off).
*   **Lives**: Counter in the top left.
*   **Weapon**: Icon showing currently equipped projectile.
*   **Boss Health**: Large bar at bottom of screen (during boss fights).

4. Characters and Enemies

4.1 Player: Sir Gron
*   **Visual**: Heavy plate armor, red cape, "Rayman-style" disjointed limbs for clear animation reading.
*   **Stats**: 3 Armor Points (Helmet, Chest, Unarmored).

4.2 Enemy Roster
*   **Ghoul (Shambling)**: Slow walker, simple contact damage.
*   **Ghoul (Crawler)**: Low profile, fast movement, jumps from pits. Hard to hit with high weapons.
*   **Orc (Grunt)**: Uses a shield. Blocks frontal projectiles. Weakness: Jump attacks or Heavy melee.
*   **Orc (Berserker)**: Fast, high-damage. Charges the player and performs overhead slams.
*   **Gargoyle**: Aerial enemy, swoops in arcs (Planned).

4.3 Boss: Orc Warlord
*   **Description**: Giant armored Orc with a massive axe and golden shield.
*   **Arena**: Enclosed boss chamber at the end of the Haunted Forest.
*   **Behaviors**:
    *   **Charge**: Rapid movement across the screen.
    *   **Smash**: Area-of-effect ground pound.
    *   **Block**: Uses shield to negate damage during idle phases.

5. Level and World Design

5.1 Stage 1: The Outskirts
*   **Theme**: Graveyard transitioning into a militarized Orc Encampment.
*   **Length**: ~400 Units (Extended length).

5.2 Key Set-Pieces
*   **The Watchtower**: A vertical climb segment with Orc Berserkers on narrow platforms.
*   **The Crumbling Bridge**: A platforming gauntlet with floating/moving platforms over a death pit.
*   **The Haunted Forest**: Dense terrain with verticality ("Tree platforms") and hidden Crawler ambushes.

5.3 Difficulty Curve
*   **Start**: Simple Ghouls, flat terrain.
*   **Mid**: Introduction of Shields (Orcs) and Pits.
*   **End**: High density of elite enemies (Berserkers) + Boss fight.

6. Systems

6.1 Weapons
*   **Spear**: Straight flight, medium speed, avg damage. (Starter)
*   **Dagger**: High speed, low damage, rapid fire.
*   **Axe**: Arced flight (hit enemies above), high damage.
*   **Torch**: Lobbed arc, creates fire on ground (AOE).

6.2 Checkpoints & Lives
*   Fixed checkpoints at key transition areas (e.g., before the Bridge, before the Boss).
*   Lives system currently infinite for testing (v0.9), planned to be limited (3-5).

7. Art and Animation

7.1 Style
*   **Vibe**: "Gothic Low-Poly".
*   **Lighting**: Strong Rim Lighting (purple/blue) to make characters pop against dark backgrounds.
*   **Palette**: Dark greys, purples, and deep greens, punctuated by bright red (enemies/danger) and gold (loot).

7.2 Technical Constraints
*   **Poly Count**: Low (<2000 per character) for performance.
*   **Materials**: Single pass standard materials with emissive flashes for hit feedback.

8. Technical Implementation

8.1 Architecture
*   `Game`: Main entry point, loop management.
*   `SceneManager`: Three.js scene setup, lights, parallax.
*   `LevelManager`: JSON-based level loading, spawning, platform generation.
*   `InputManager`: Event-based input handling with buffering.
*   `StateMachine`: Finite State Machine for all entity logic (Player and Enemy).

8.2 Asset Pipeline
*   Current: Procedural geometry generation (BoxGeometry, etc.) for rapid prototyping.
*   Future: GLTF loader for externally modeled assets.

8.3 Performance Targets
*   **Target**: 60 FPS on standard desktop browsers.
*   **Optimization**: Object pooling for projectiles and particles; geometry instancing for repeated environmental props.