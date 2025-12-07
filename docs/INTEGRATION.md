# Integration Guide

How game systems connect and share data.

---

## GameContext - Shared State Access

All scenes access shared state via `IGameContext` instead of importing singletons directly.

```typescript
// Scene base class provides this.ctx
class BattleScene extends Scene {
  onEnter() {
    const party = this.ctx.getPlayerPokemon(); // ✅ Use context
  }
}

// SettingsMenuScene (not a Scene subclass)
class SettingsMenuScene {
  private ctx: IGameContext = gameContext;
}
```

### IGameContext Interface

```typescript
interface IGameContext {
  // Player
  getPlayerPokemon(): PokemonConfig[];
  setPlayerPokemon(pokemon: PokemonConfig[]): void;
  getPlayerName(): string;

  // NPC
  getNPC(id: string): { pokemon: string[]; defeated: boolean };
  setNPCDefeated(id: string): void;

  // Actions
  save(): void;
}
```

---

## Data Flow

```
GameContext (wraps GameState)
    │
    ├── this.ctx.getPlayerPokemon() ──► BattleScene, SettingsMenuScene
    │
    ├── this.ctx.getNPC(id) ──► WorldScene, BattleScene
    │
    └── this.ctx.save() ──► SettingsMenuScene (SAVE menu)
```

---

## Key Integration Points

### 1. Player Pokemon

**Source:** `gameState.getPlayerPokemon(): PokemonConfig[]`

**Consumers:**
| Location | Usage |
|----------|-------|
| `SettingsMenuScene.drawPokemonScreen()` | Display party |
| `BattleScene.onEnter()` | Load player's active Pokemon |

**To modify:** `gameState.setPlayerPokemon(pokemon: PokemonConfig[])`

### 2. Starting a Battle

**Flow:**

```
WorldScene (NPC interaction)
    │
    ├── emitGameEvent('battle:start', { npcId, playerPokemon, npcPokemon })
    │
    └── SceneManager.setScene('battle', { npcId })
            │
            └── BattleScene.onEnter({ npcId })
                    │
                    ├── Get player Pokemon: gameState.getPlayerPokemon()[0]
                    └── Get NPC Pokemon: gameState.getNPC(npcId).pokemon
```

### 3. Scene Lifecycle Order

SceneManager calls methods in this order:

```
1. reset()   → Clear state, reset positions
2. onEnter() → Load fresh data from gameState
3. setup()   → Initialize scene using loaded data
```

**Important:** `onEnter()` is called BEFORE `setup()`, so data loaded in onEnter is available when setup runs.

```typescript
// ✅ CORRECT - Get data in onEnter, use in setup
onEnter(data?: Record<string, unknown>): void {
    const playerPokemon = gameState.getPlayerPokemon();
    this.playerPokemon = createPokemonFromConfig(playerPokemon[0]);
    // Don't call setup() here - SceneManager handles it
}

setup(): void {
    // this.playerPokemon is already set from onEnter
    this.startBattleIntro(); // Uses correct Pokemon
}

// ❌ WRONG - Hardcoded in constructor
constructor(p: P5Instance) {
    this.playerPokemon = createPokemon('BLASTOISE');
}

// ❌ WRONG - Calling setup() inside onEnter
onEnter(): void {
    this.setup(); // Don't do this! SceneManager calls setup
}
```

---

## Interface Contracts

### PokemonConfig → Pokemon Entity

```typescript
// Config (data/state)
interface PokemonConfig {
    name: string;
    level: number;
    stats: { maxHp, attack, defense };
    moves: Move[];
    spriteUrl?: string;
}

// Entity (battle logic)
class Pokemon {
    constructor(config: PokemonConfig)
    // Has battle methods: takeDamage(), performAttack(), etc.
}

// Conversion
createPokemonFromConfig(config: PokemonConfig): Pokemon
```

### NPCState → Battle Setup

```typescript
interface NPCState {
  id: string;
  pokemon: string[]; // Pokemon names (keys to POKEMON_DB)
  battleSpriteUrl: string;
  // ...
}

// In BattleScene.onEnter():
const npcState = gameState.getNPC(npcId);
const npcPokemonName = npcState.pokemon[0];
this.npcPokemon = createPokemon(npcPokemonName);
```

---

## Checklist for New Features

When adding features that involve player data:

- [ ] Get data from `gameState` in `onEnter()`, not constructor
- [ ] Load sprites dynamically based on config `spriteUrl`
- [ ] Use `createPokemonFromConfig()` for player Pokemon
- [ ] Use `createPokemon(name)` for registry Pokemon (NPCs)
