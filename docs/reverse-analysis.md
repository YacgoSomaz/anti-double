# G-Switch SWF reverse-analysis ledger

Source analysed: `反重力双英.swf` (compressed SWF / Flash 10).

## Runtime contract recovered from the file

- Stage: **640 × 501 px**.
- Frame rate: **40 FPS**.
- AVM2 / ActionScript 3, with two `DoABC` blocks.
- Framework: Flixel (`org.flixel`).
- Four-player input resources and state fields: **Q / X / P / M**.

The browser version must use a fixed 1/40 s simulation step. The pre-alpha network build used a different tick rate and is therefore not a fidelity baseline.

## Gameplay classes and recovered method boundaries

| Class | Key methods found in AVM2 | Fidelity implication |
|---|---|---|
| `Player` | `update`, `hitBottom`, `hurt`, `kill`, `SwitchGravity`, `animationCallback`, `hitRight` | Primary runner state machine, gravity, collisions, death and animation. |
| `Enemy` | Same movement/death/gravity method family | Pursuer behavior must be separate from player logic. |
| `PlayState` | `create`, `restart`, `update`, `OverlapEnemy`, `OverlapTile`, `collideMovingPlayers`, `onSpeed` | Owns level construction, hazards, player-v-player handling, camera and results. |
| `MenuState` | `onPlayMulti`, `onPlayMulti2`, `onPlayMulti3`, `onPlayMulti4` | Original menu explicitly selects 1–4 local players. |

Recovered `Player` state fields include `_jumpPower`, `_up`, `_down`, `_restart`, `_savedXVel`, `_clickDelay`, `playFallDelay`, `_playerNum`, `myOnFloor`, `standing`, `wins`, and `inPlayerCollision`.

## Directly extracted original assets

- **304** lossless bitmap assets, exported under `assets/reverse/bitmaps/` with class-to-file mapping in `bitmap-manifest.json`.
- **31** original MP3 sounds, exported under `assets/reverse/sounds/` with mapping in `sound-manifest.json`.
- Four original runner animation atlases: blue, red, green, yellow; each **975 × 693 px**.
- `Player.loadGraphic(..., 65, 77)` splits each atlas into a fixed **15 × 9 grid** of **65 × 77 px** frames. Frames 0–112 are populated except frame 64. These are the exact source rectangles for the browser renderer; the earlier 13 × 11 / 75 × 63 interpretation was incorrect.

## Original level data

The embedded plist level files are parsed rather than redrawn. Multiplayer files have four original spawn points and a finish callback:

| Course | Collision cells | Notable entities |
|---|---:|---|
| MP02 | 1,017 | 4 spawns, anti-portal pair, finish callback |
| MP03 | 1,062 | 4 spawns, anti-portal pair, finish callback |
| MP04 | 1,150 | 4 spawns, anti-portal pair, finish callback |

`assets/reverse/mp02-collision-overview.png` is a coordinate-faithful overview generated directly from the embedded MP02 collision list. Cyan cells are collision, colored dots are the four original spawn points, and the white vertical line is the recovered finish callback.

Single-player courses additionally expose `EndlessSPEntryPoint`, `ShipSpawnerEntity`, tint events, camera shake, camera-speed changes, sprite opacity transitions and sound triggers. Those are specification inputs for the full recreation rather than optional decorative effects.

## Player bytecode decoded (2026-07-20)

The original AVM2 has now been disassembled directly from the second `DoABC` block. The reproducible, read-only disassembly is retained as `assets/reverse/player-avm2-disassembly.txt`; the parser used to create it is `tools/decode_avm2.py`.

### Exact constructor values and collision representation

| Item | Original value |
|---|---:|
| Sprite sheet frame geometry | 65 × 77 px |
| Player collision box | 42 × 48 px |
| Multiplayer collision box width | 37 px |
| Base collision offset | (10, 17) px |
| Multiplayer collision offset | (16, 19) px |
| Vertical acceleration magnitude | 30,000 px/s² |
| Vertical speed cap | 320.755 px/s |
| Horizontal acceleration (normal gameplay) | 7.740191 px/s² |
| Click buffer (`_clickDelay`) | 0.35 s |
| Runner `run`/`runfast` threshold | 513.208 px/s |

The constructor loads exact atlas frame sequences: `run` 0–12, `fall` 19–22 then 13–18, `morph` 23–44, `death` 45–51, `switch` 60/62/64/66/70/72/74, `push` 52–58, `landing` 76/78/80/82/84/86, `slide` 89, and `runfast` 91–99. This removes guesswork from the browser animation implementation.

### Recovered runner state machine

- Input is an edge-triggered gravity switch: P1 accepts mouse/X/Space, P2 M, P3 P, and P4 Q. A mid-air press is buffered for exactly **0.35 seconds**; when vertical velocity reaches zero in that period, the switch fires.
- `SwitchGravity()` marks the runner airborne, multiplies `acceleration.y` by -1, flips `facing`, sets angle to 0 or 180, and changes the collision offset Y between 7/17 px (9/19 in multiplayer). It also produces a source-game puff effect and plays the original switch sound.
- Landing sets `myOnFloor = true`, restores a four-frame fall delay, plays `landing` when appropriate, and otherwise resolves to `run`, `idle`, `push`, or `slide` based on velocity and contact state.
- The `run`/`runfast` animation rate is `velocity.x * 0.088`; push/slide use `velocity.x * 0.03`; landing is fixed at 67 FPS-equivalent. In multiplayer the runner is killed when it leaves the camera-safe X range or Y range -60…500.
- `hurt()` ignores repeat hits while flickering, plays the original hurt sound, flickers for 1.3 seconds, deducts up to 1000 score, and knocks horizontal velocity to the appropriate signed maximum. `kill()` records the finishing standing and increments the correct P1–P4 win counter.

The deployed network prototype now uses a **40 Hz** server-authoritative `GameRoom`, recovered acceleration constants, dynamic multiplayer Y offsets (19/9), narrow foot contact, side-wall sweep blocking, original-camera-equivalent out-of-stage elimination and stable multiplayer box bodies. For network stability, tied horizontal bodies retain a deterministic prior-frame order; same-gravity stacks share vertical movement, while opposite-gravity bodies in contact cancel vertical velocity. This is an intentional authoritative adaptation around the recovered `collideMovingPlayers()` evidence, not a claim of bit-for-bit Flixel parity. It exposes recovered `SndMenuMusic` in the menu/lobby, `SndMusic` during the race, and `SndSwitch` after a user gesture. Buffered input, complete animation transitions and all `FlxU` collision edge cases are not yet implemented.

## PlayState collision pipeline decoded

`PlayState.update()` makes the original order explicit:

1. It updates/culls the generated fixed block objects.
2. It calls `FlxU.collide(_blocks, _objects)` for the core runner-vs-world resolution.
3. It checks overlap-trigger entities for player and enemy separately.
4. In multiplayer it clears each player's collision flag, then invokes `FlxU.overlap(_players, _players, collideMovingPlayers)` ten times.

`collideMovingPlayers()` rewinds both candidates by `velocity.y * elapsed`, tests vertical overlap using `height - 8`, restores their positions, then resolves either vertical separation or horizontal separation. A side-by-side collision leaves a **1.1 × player width** gap; opposing vertical motion sets both vertical velocities to zero and updates facing consistently with the new gravity direction. Thus player-on-player interference is a real original mechanic, not cosmetic.

The embedded course collision records are converted by the original game into fixed `FlxObject` block geometry before this call. The next implementation step is therefore to recreate that block-generation transform (including its object offsets) rather than treating the exported records as a naïve 48-pixel tilemap.

## Current implementation gap and next reverse targets

1. Compare the player-pair callback against a live SWF trace, especially its collision flags and facing transitions. The server keeps the recovered box dimensions and side-by-side `1.1 × width` spacing, but uses a deterministic network-safe contact response rather than claiming every surrounding `FlxU` detail.
2. MP02/MP03/MP04 decorative placement lists have been exported from their embedded plist files. The browser projects each list with its marathon segment offset; retain the raw source lists and generation path when changing visuals.
3. Implement the recovered Player buffered-input and animation state machine at a fixed 40 FPS, with fixtures for every transition.
4. Decode and implement ranking, end-state timing, checkpoints, sounds and enemy systems only after adding behaviour-specific tests.

For current code, deployment procedures and the precise distinction between recovered evidence and implemented behaviour, read `README.md` and `docs/AI-HANDOVER.md`.
