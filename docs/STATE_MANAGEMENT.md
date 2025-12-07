# Pokemon Remix - State Management

## Overview

State management handles data persistence and communication between scenes without tight coupling.

---

## The Problem (Current)

```typescript
// ❌ BAD: Direct reference between scenes
const battle = makeBattle(p, setScene, world); // Battle knows about World

// ❌ BAD: Direct state mutation
world.isNpcDefeated = true; // Battle directly modifies World

// ❌ BAD: No context on scene transition
setScene("battle"); // Battle doesn't know WHO triggered it
```

**Issues**:

1. Scenes are tightly coupled
2. Adding new NPCs requires code changes
3. Can't track which NPC was battled
4. No save/load capability
5. Hard to debug state changes

---

## The Solution

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        GameState                             │
│                   (Single Source of Truth)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  PlayerState    │  │   NPCRegistry   │  │  GameFlags  │  │
│  │                 │  │                 │  │             │  │
│  │  - pokemon[]    │  │  - npcs Map     │  │  - flags    │  │
│  │  - position     │  │  - defeated     │  │  - settings │  │
│  │  - inventory    │  │  - dialogue     │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │         EventBus (pub/sub)              │
         │                    │                    │
         ▼                    ▼                    ▼
   ┌───────────┐        ┌───────────┐        ┌───────────┐
   │ WorldScene│        │BattleScene│        │ MenuScene │
   │           │        │           │        │           │
   │ READS:    │        │ READS:    │        │           │
   │ - npc data│        │ - context │        │           │
   │           │        │           │        │           │
   │ EMITS:    │        │ EMITS:    │        │           │
   │ - battle  │        │ - complete│        │           │
   │   :start  │        │           │        │           │
   └───────────┘        └───────────┘        └───────────┘
```

---

## State Types

### GameState

```typescript
interface GameState {
  player: PlayerState;
  npcs: Map<string, NPCState>;
  flags: GameFlags;
  currentScene: SceneName;
}
```

### PlayerState

```typescript
interface PlayerState {
  id: string;
  name: string;
  position: { x: number; y: number; map: string };
  pokemon: PokemonInstance[];
  inventory: Item[];
  badges: string[];
  money: number;
}
```

### NPCState

```typescript
interface NPCState {
  id: string;
  name: string;
  type: "trainer" | "npc";
  defeated: boolean;
  pokemon: PokemonInstance[];
  dialogue: {
    default: string;
    beforeBattle: string;
    afterDefeat: string;
  };
  rewards: {
    money: number;
    items?: string[];
  };
}
```

### GameFlags

```typescript
interface GameFlags {
  tutorialComplete: boolean;
  firstBattleWon: boolean;
  // Add more progression flags
}
```

---

## Scene Context

When transitioning between scenes, context is passed:

### World → Battle

```typescript
interface BattleContext {
  npcId: string; // Who triggered the battle
  npcName: string; // Display name
  npcPokemon: PokemonInstance[];
  playerPokemon: PokemonInstance[];
  battleType: "trainer" | "wild";
  location: string; // For background selection
}

// Usage
sceneManager.transition("battle", {
  npcId: "gentleman_01",
  npcName: "Mark the Gentleman",
  npcPokemon: gameState.getNPC("gentleman_01").pokemon,
  playerPokemon: gameState.getPlayerPokemon(),
  battleType: "trainer",
  location: "tower",
});
```

### Battle → World

```typescript
interface BattleResultContext {
  result: "win" | "lose" | "flee";
  npcId: string;
  expGained: number;
  moneyGained: number;
}

// Emitted as event, GameState handles update
eventBus.emit("battle:complete", {
  result: "win",
  npcId: "gentleman_01",
  expGained: 500,
  moneyGained: 1000,
});
```

---

## Event Flow

### Battle Initiation

```
┌──────────────────────────────────────────────────────────────┐
│  1. Player collides with NPC in WorldScene                   │
│     ↓                                                        │
│  2. WorldScene checks: gameState.isNPCDefeated(npcId)?       │
│     ↓                                                        │
│  3a. If defeated: Show "already defeated" dialogue           │
│  3b. If not: Show battle dialogue                            │
│     ↓                                                        │
│  4. After dialogue: eventBus.emit('battle:start', context)   │
│     ↓                                                        │
│  5. SceneManager listens, transitions to BattleScene         │
│     ↓                                                        │
│  6. BattleScene.onEnter(context) receives NPC data           │
└──────────────────────────────────────────────────────────────┘
```

### Battle Resolution

```
┌──────────────────────────────────────────────────────────────┐
│  1. Pokemon faints in BattleScene                            │
│     ↓                                                        │
│  2. Determine winner                                         │
│     ↓                                                        │
│  3. eventBus.emit('battle:complete', { result, npcId, ... }) │
│     ↓                                                        │
│  4. GameState listener updates:                              │
│     - gameState.setNPCDefeated(npcId)                        │
│     - gameState.addPlayerMoney(rewards)                      │
│     - gameState.addPlayerExp(exp)                            │
│     ↓                                                        │
│  5. SceneManager transitions to WorldScene                   │
│     ↓                                                        │
│  6. WorldScene.onEnter() - NPC now has defeated dialogue     │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation

### GameState Class

```typescript
class GameState {
  private state: GameStateData;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.state = this.getInitialState();
    this.setupListeners();
  }

  private setupListeners() {
    this.eventBus.on("battle:complete", this.onBattleComplete.bind(this));
  }

  private onBattleComplete(data: BattleCompleteEvent) {
    if (data.result === "win") {
      this.setNPCDefeated(data.npcId);
      this.addPlayerMoney(data.moneyGained);
    }
  }

  // Read methods
  getNPC(id: string): NPCState | undefined {
    return this.state.npcs.get(id);
  }

  isNPCDefeated(id: string): boolean {
    return this.state.npcs.get(id)?.defeated ?? false;
  }

  getPlayerPokemon(): PokemonInstance[] {
    return this.state.player.pokemon;
  }

  // Write methods (private, triggered by events)
  private setNPCDefeated(id: string) {
    const npc = this.state.npcs.get(id);
    if (npc) {
      npc.defeated = true;
    }
  }

  private addPlayerMoney(amount: number) {
    this.state.player.money += amount;
  }

  // Persistence
  save(): string {
    return JSON.stringify(this.state);
  }

  load(data: string) {
    this.state = JSON.parse(data);
  }
}
```

### NPCRegistry

```typescript
// data/npcs.json
{
  "gentleman_01": {
    "id": "gentleman_01",
    "name": "Mark",
    "title": "Gentleman",
    "sprite": "trainer_GENTLEMAN.png",
    "battleSprite": "GENTLEMAN.png",
    "pokemon": ["VENUSAUR"],
    "dialogue": {
      "beforeBattle": "I see that you need training.\nLet's battle!",
      "afterDefeat": "You already defeated me..."
    },
    "rewards": {
      "money": 1000
    }
  }
}

// NPCRegistry.ts
class NPCRegistry {
  private definitions: Map<string, NPCDefinition>;
  private states: Map<string, NPCState>;

  loadDefinitions(data: NPCData) {
    // Load from JSON
  }

  getNPC(id: string): NPCState {
    // Merge definition with runtime state
  }
}
```

---

## Benefits

| Aspect          | Before                               | After                         |
| --------------- | ------------------------------------ | ----------------------------- |
| **Coupling**    | Scenes directly reference each other | Scenes communicate via events |
| **Data Flow**   | Unclear, scattered                   | Unidirectional, predictable   |
| **Adding NPCs** | Code changes required                | JSON configuration            |
| **Debugging**   | Hard to track state                  | Single state object           |
| **Save/Load**   | Not possible                         | Serialize GameState           |
| **Testing**     | Difficult                            | Mock GameState easily         |

---

## Usage Examples

### Starting a Battle

```typescript
// In WorldScene
onNPCCollision(npcId: string) {
  const npc = this.gameState.getNPC(npcId);

  if (npc.defeated) {
    this.showDialogue(npc.dialogue.afterDefeat);
    return;
  }

  this.showDialogue(npc.dialogue.beforeBattle, () => {
    this.eventBus.emit('battle:start', {
      npcId: npc.id,
      npcName: `${npc.name} the ${npc.title}`,
      npcPokemon: npc.pokemon,
      playerPokemon: this.gameState.getPlayerPokemon()
    });
  });
}
```

### Checking NPC State

```typescript
// In WorldScene.update()
drawNPC(npc: NPC) {
  const state = this.gameState.getNPC(npc.id);

  // Could change sprite/behavior based on defeated state
  if (state.defeated) {
    npc.setAnimation('idle-defeated');
  }
}
```
