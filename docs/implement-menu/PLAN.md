# Settings Menu Implementation Plan

## Overview

Implement an in-game settings/pause menu accessible during gameplay (world scene). The menu will provide player status information, game options, and debug tools.

---

## Project Structure Note

> **Important**: Game source is now **TypeScript** in `src/` folder.
>
> - Scenes: `src/scenes/` (MenuScene.ts, WorldScene.ts, BattleScene.ts, SettingsMenuScene.ts)
> - Entities: `src/entities/` (Character.ts, Pokemon.ts, etc.)
> - State: `src/state/GameState.ts`
> - Main entry: `src/Game.ts`

---

## Implementation Status: ✅ COMPLETE

The settings menu has been implemented as `SettingsMenuScene.ts`.

---

## Core Features

### 1. Player Status Panel

- **Pokemon Team View**: Display current Pokemon (name, level, HP, moves)
- **Items Bag**: Show collected items (placeholder for now, needs item system)
- **Player Stats**: Position, playtime, battles won/lost

### 2. Pokemon Management (Debug Mode Only)

- **Switch Pokemon**: Change active battle Pokemon from available roster
- **Modify Stats**: Adjust HP, attack, defense for testing
- **Heal Pokemon**: Restore HP to max
- **Available Pokemon**: BLASTOISE, VENUSAUR, CHARIZARD, PIKACHU, GYARADOS, SNORLAX

### 3. Game Settings

- **Sound Volume**: Master, BGM, SFX sliders (placeholder - no audio system yet)
- **Text Speed**: Slow / Medium / Fast dialog display
- **Debug Toggle**: Enable/disable debug mode (currently Shift key)

### 4. Additional Features

- **Save/Load**: LocalStorage-based save system
- **Controls Help**: Show keybindings
- **Return to Title**: Go back to menu scene
- **Quit Battle**: Exit current battle (debug only)

---

## Implementation Steps

### Phase 1: Menu Framework ✅

- [x] Create `src/scenes/SettingsMenuScene.ts`
- [x] Add menu state management in `Game.ts`
- [x] Implement menu open/close with ESC key
- [x] Basic menu UI rendering (background overlay, panel)

### Phase 2: UI Components ✅

- [x] Create reusable menu item component
- [x] Navigation system (arrow keys + enter)
- [x] Submenu support
- [x] Back button handling (ESC/Backspace)

### Phase 3: Player Status ✅

- [x] Pokemon team display
- [x] Pokemon detail view (stats, moves)
- [ ] Items placeholder UI (deferred)

### Phase 4: Debug Features ✅

- [x] Pokemon switcher (only in debug mode)
- [x] Heal all Pokemon
- [ ] Stat modifier sliders (deferred)
- [ ] Scene jump buttons (deferred)

### Phase 5: Settings & Save

- [ ] Text speed setting (deferred)
- [ ] LocalStorage save/load (deferred)
- [x] Controls help screen

---

## Technical Design

### Menu State Machine

```
CLOSED -> MAIN_MENU -> POKEMON_VIEW -> POKEMON_DETAIL
                    -> ITEMS_VIEW
                    -> SETTINGS
                    -> DEBUG_PANEL (if debugMode.enabled)
```

### Key Bindings

| Key        | Action          |
| ---------- | --------------- |
| ESC        | Open/Close menu |
| Arrow Keys | Navigate        |
| ENTER      | Select          |
| BACKSPACE  | Go back         |

### Data Flow

```
Game.ts
  └── SettingsMenuScene.ts
        ├── Reads: gameState (player, NPCs, pokemon), debugMode
        └── Writes: gameState, debugMode.enabled
        └── Callbacks: setPlayerFreeze (via WorldScene)
```

---

## Files Implemented

| File                              | Status | Description                                  |
| --------------------------------- | ------ | -------------------------------------------- |
| `src/Game.ts`                     | ✅     | ESC key handler, menu integration            |
| `src/scenes/SettingsMenuScene.ts` | ✅     | Full settings menu with all screens          |
| `src/state/GameState.ts`          | ✅     | Centralized game state (player, NPCs, flags) |
| `src/scenes/WorldScene.ts`        | ✅     | Player freeze when menu open                 |

---

## UI Design (Pokemon GBA Style)

> Design inspired by Pokemon FireRed/LeafGreen menu system

### Main Menu (Right-aligned popup)

```
                    ┌────────────┐
                    │  POKéMON   │
                    │  BAG       │
                    │  SAVE      │
                    │  OPTION    │
                    │  EXIT      │
                    │  ────────  │
                    │  [DEBUG]   │  ← Only when debug enabled
                    └────────────┘
```

- Opens from right side (like original games)
- Simple black border, white fill
- Arrow cursor (▶) for selection

### Pokemon Party Screen (Full screen)

```
┌──────────────────────────────────────────────────────┐
│ ┌─────────────────┐  ┌─────────────────────────────┐ │
│ │   [BLASTOISE]   │  │  PIKACHU        Pokemon #2  │ │
│ │    ▓▓▓▓▓▓▓▓░░   │  │  Lv.45        ▓▓▓░░░░░░░   │ │
│ │    100 / 100    │  │               36 / 80      │ │
│ └─────────────────┘  ├─────────────────────────────┤ │
│                      │  (empty)       Pokemon #3  │ │
│  ▶ Active Pokemon    ├─────────────────────────────┤ │
│                      │  (empty)       Pokemon #4  │ │
│                      ├─────────────────────────────┤ │
│                      │  (empty)       Pokemon #5  │ │
│                      ├─────────────────────────────┤ │
│                      │  (empty)       Pokemon #6  │ │
│                      └─────────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│  Choose a POKéMON.                                   │
└──────────────────────────────────────────────────────┘
```

- First slot (left, large) = Active battle Pokemon
- Slots 2-6 on right side
- HP bar with gradient (green > yellow > red)
- Bottom text box for instructions

### Pokemon Summary Screen

```
┌──────────────────────────────────────────────────────┐
│  BLASTOISE                              Lv. 50       │
│  ┌────────────┐                                      │
│  │            │    TYPE: WATER                       │
│  │  [SPRITE]  │    HP    ▓▓▓▓▓▓▓▓▓▓  100/100        │
│  │            │    ATK   83                          │
│  │            │    DEF   100                         │
│  └────────────┘                                      │
│──────────────────────────────────────────────────────│
│  MOVES:                                              │
│    ▶ DEATH           PP 10/10                        │
│      HYDRO PUMP      PP 5/5                          │
│      HYDRO CANNON    PP 5/5                          │
│      WATER GUN       PP 25/25                        │
├──────────────────────────────────────────────────────┤
│  [DEBUG] D: Set Active  H: Full Heal  E: Edit Stats │
└──────────────────────────────────────────────────────┘
```

### Debug Panel (Only in debug mode)

```
┌──────────────────────────────────────────────────────┐
│  DEBUG OPTIONS                                       │
│──────────────────────────────────────────────────────│
│  ▶ SWITCH POKEMON                                    │
│    HEAL ALL POKEMON                                  │
│    SET BATTLE OPPONENT                               │
│    TOGGLE NPC DEFEATED                               │
│    TELEPORT TO SPAWN                                 │
│    ──────────────────                                │
│    AVAILABLE POKEMON:                                │
│    [1] BLASTOISE  [2] VENUSAUR  [3] CHARIZARD       │
│    [4] PIKACHU    [5] GYARADOS  [6] SNORLAX         │
├──────────────────────────────────────────────────────┤
│  Press number to quick-select Pokemon                │
└──────────────────────────────────────────────────────┘
```

### Option Screen

```
┌──────────────────────────────────────────────────────┐
│  OPTION                                              │
│──────────────────────────────────────────────────────│
│  TEXT SPEED     SLOW   MID   ▶FAST                   │
│  BATTLE SCENE   ▶ON    OFF                           │
│  SOUND          ▶MONO  STEREO                        │
│──────────────────────────────────────────────────────│
│  CONTROLS:                                           │
│    ARROWS  - Move                                    │
│    ENTER   - Confirm / Talk                          │
│    ESC     - Menu / Back                             │
│    SHIFT   - Toggle Debug                            │
└──────────────────────────────────────────────────────┘
```

### Visual Style Guidelines

- **Font**: Use existing `power-clear.ttf` (Pokemon-style)
- **Colors**:
  - Background: Dark blue (#1a1a2e) with slight transparency
  - Panel: White (#ffffff) with black border
  - Text: Black (#000000)
  - HP Bar: Green (#00c800) → Yellow (#f8b800) → Red (#f82020)
  - Cursor: Black triangle (▶)
- **Animations**:
  - Menu slides in from right
  - Cursor blinks
  - HP bar animates when changing

---

## Priority Order

1. **High**: Menu framework + Pokemon view (core UX)
2. **Medium**: Debug Pokemon switcher (testing helper)
3. **Low**: Save/Load, Sound settings (nice-to-have)
