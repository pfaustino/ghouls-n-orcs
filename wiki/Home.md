# Ghouls n Orcs — Architecture (full scope)

2.5D side-scrolling action platformer (Ghosts 'n Goblins–style). **v0.9.9.1**. No bundler — ES modules + Three.js from import map.

## Stack

Three.js 0.160 (unpkg import map), vanilla JS modules, Web Audio. Dev: `npx serve` (port 3000). Deploy: static `dist/` or repo root.

## Entry

`index.html` → `src/main.js` (`Game` class) → `window.game` for debug.

## Runtime

```
Game
 ├── SceneManager      (lighting, parallax, environment)
 ├── LevelManager      (platforms, spawners, bosses, victory)
 ├── InputManager      (keyboard, gamepad, mobile touch)
 ├── AudioManager
 ├── ParticleManager
 ├── Player + StateMachine
 ├── enemies[]         (Ghoul, Orc, OrcWarlord, Ogre, Gargoyle, Goleling…)
 ├── projectiles[]     (WeaponFactory)
 └── HUD.js + HTML overlays (pause, game over, victory, boss bar)
```

## Game loop

`requestAnimationFrame` with **fixed timestep** (1/60 s) for physics/collision and variable dt for animation, camera, parallax. Input cleared each frame via `InputManager.endFrame()`.

## Combat

AABB via `THREE.Box3`: projectiles vs enemies; touch damage when `canDealDamage()`. Screen shake on hits.

## Configuration

| File | Content |
|------|---------|
| `src/config/GameConfig.js` | Player, weapons, enemies, camera tuning |
| `src/config/Levels.js` | `graveyard`, `crypt`, `mines` geometry + spawners |
| `loadAssets()` in main | GLB manifest (player, enemies, props) |

## Persistence

None — `restartGame()` reloads level without page refresh. Debug level warps via keys / gamepad Select.

## Module map (`src/`)

| Folder | Modules |
|--------|---------|
| `core/` | AudioManager, Input, InputManager, LevelManager, ParticleManager, SceneManager, StateMachine |
| `entities/` | Player, Enemy hierarchy, Projectile, Pickup, Checkpoint, WeaponFactory |
| `ui/` | HUD.js |
| `config/` | GameConfig, Levels |

## Docs

Design: `ghoulsnorcs-gdd.md`. ADRs: `docs/adr/`.
