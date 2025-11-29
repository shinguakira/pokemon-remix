# Pokemon Remix - Game Design Document

## Game Overview

**Pokemon Remix** is a Pokemon-style RPG featuring:

- Top-down world exploration
- NPC interactions and dialogues
- Turn-based Pokemon battles
- Pixel art aesthetics

---

## Game Flow

```
┌─────────────┐
│  MENU       │
│  - Title    │
│  - Press    │
│    Enter    │
└──────┬──────┘
       │ ENTER
       ▼
┌─────────────┐     collision      ┌─────────────┐
│  WORLD      │ ─────────────────► │  BATTLE     │
│  - Explore  │     with NPC       │  - Fight    │
│  - Walk     │                    │  - Moves    │
│  - Talk     │ ◄───────────────── │  - Win/Lose │
└─────────────┘    battle end      └─────────────┘
```

---

## Scenes

### 1. Menu Scene

**Purpose**: Game entry point

| Element | Description                 |
| ------- | --------------------------- |
| Title   | "POKEMON" logo              |
| Sprite  | Blastoise display           |
| Prompt  | "PRESS ENTER" blinking text |
| Input   | ENTER → Start game          |

### 2. World Scene

**Purpose**: Exploration and NPC interaction

| Element | Description                    |
| ------- | ------------------------------ |
| Map     | Trainer Tower interior (Tiled) |
| Player  | Controllable character         |
| NPC     | Gentleman trainer              |
| Dialog  | Text boxes for conversation    |

**Controls**:
| Key | Action |
|-----|--------|
| ↑↓←→ | Move player |
| ENTER | Dismiss dialog |
| SHIFT | Toggle debug mode |

**NPC Interaction**:

1. Player collides with NPC
2. Dialog appears
3. If NPC not defeated → Battle starts
4. If NPC defeated → "You already defeated me..."

### 3. Battle Scene

**Purpose**: Turn-based Pokemon combat

| Element        | Description             |
| -------------- | ----------------------- |
| Background     | Battle arena            |
| Player Pokemon | Blastoise (bottom-left) |
| Enemy Pokemon  | Venusaur (top-right)    |
| Data boxes     | HP bars and names       |
| Dialog         | Battle narration        |
| Move menu      | 4 move options          |

**Battle Flow**:

```
1. Intro animation
   └── NPC slides in
   └── "X wants to battle!"

2. Pokemon intro
   └── Enemy Pokemon appears
   └── Player Pokemon appears

3. Player turn
   └── Show move menu (1-4)
   └── Select move

4. Attack execution
   └── Damage calculation
   └── HP reduction
   └── Check faint

5. Enemy turn (if not fainted)
   └── Random move selection
   └── Damage to player
   └── Check faint

6. Repeat 3-5 until faint

7. Battle end
   └── Winner declared
   └── Return to world
```

**Controls**:
| Key | Action |
|-----|--------|
| 1 | Select move 1 |
| 2 | Select move 2 |
| 3 | Select move 3 |
| 4 | Select move 4 |

---

## Entities

### Player

| Property   | Value                                                     |
| ---------- | --------------------------------------------------------- |
| Sprite     | `boy_run.png`                                             |
| Size       | 32x32 (collision)                                         |
| Speed      | 200 units/sec                                             |
| Animations | idle-down, idle-up, idle-side, run-down, run-up, run-side |

### NPC (Gentleman)

| Property        | Value                                         |
| --------------- | --------------------------------------------- |
| Sprite          | `trainer_GENTLEMAN.png`                       |
| Size            | 32x32                                         |
| Behavior        | Static, triggers battle                       |
| Dialog (before) | "I see that you need training. Let's battle!" |
| Dialog (after)  | "You already defeated me..."                  |

### Pokemon

#### Blastoise (Player)

| Stat    | Value                                                            |
| ------- | ---------------------------------------------------------------- |
| Level   | 50                                                               |
| HP      | 100                                                              |
| Attack  | 83                                                               |
| Defense | 100                                                              |
| Moves   | DEATH (1000), HYDRO PUMP (50), HYDRO CANNON (45), WATER GUN (50) |

#### Venusaur (Enemy)

| Stat    | Value                                                         |
| ------- | ------------------------------------------------------------- |
| Level   | 50                                                            |
| HP      | 100                                                           |
| Attack  | 82                                                            |
| Defense | 83                                                            |
| Moves   | TACKLE (10), RAZOR LEAF (55), TAKE DOWN (45), POWER WHIP (50) |

---

## Damage Formula

```
damage = floor(((2 * level / 5 + 2) * power * (attack / defense)) / 50) + 2
```

Where:

- `level` = Attacker's level
- `power` = Move's power
- `attack` = Attacker's attack stat
- `defense` = Defender's defense stat

---

## Map Design

### Trainer Tower Interior

- **Tileset**: `Trainer Tower interior.png`
- **Format**: Tiled JSON export
- **Layers**:
  - Tile layer (floor, walls)
  - SpawnPoints (object layer)
    - `player` - Player start position
    - `npc` - NPC position
  - Boundaries (object layer)
    - Collision rectangles

---

## Assets

### Sprites

| File                    | Description              |
| ----------------------- | ------------------------ |
| `boy_run.png`           | Player spritesheet (4x4) |
| `trainer_GENTLEMAN.png` | NPC spritesheet          |
| `BLASTOISE.png`         | Player Pokemon           |
| `VENUSAUR.png`          | Enemy Pokemon            |
| `GENTLEMAN.png`         | NPC battle sprite        |

### UI

| File                    | Description           |
| ----------------------- | --------------------- |
| `title.png`             | Title screen image    |
| `start.png`             | Start button graphic  |
| `overlay_message.png`   | Dialog box background |
| `databox_thin.png`      | Player HP box         |
| `databox_thin_foe.png`  | Enemy HP box          |
| `battle-background.png` | Battle arena          |

### Audio

_(Not yet implemented)_

---

## Future Features

- [ ] Multiple Pokemon per trainer
- [ ] Pokemon switching
- [ ] Items and inventory
- [ ] Multiple NPCs
- [ ] Save/Load game
- [ ] Type effectiveness
- [ ] Status effects
- [ ] Experience and leveling
- [ ] Wild Pokemon encounters
- [ ] Multiple areas/maps
