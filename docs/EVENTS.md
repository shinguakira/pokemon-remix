# Pokemon Remix - Event System

## Overview

The Event System (EventBus) enables decoupled communication between game components. Instead of direct references, components publish and subscribe to events.

---

## Why Events?

### Without Events (Tight Coupling)

```typescript
// ❌ BAD: Battle scene directly modifies World scene
class BattleScene {
  private world: WorldScene; // Direct reference

  endBattle() {
    this.world.isNpcDefeated = true; // Direct mutation
    this.world.player.setFreeze(false);
  }
}
```

**Problems**:

- BattleScene needs reference to WorldScene
- Changes to WorldScene break BattleScene
- Can't test BattleScene in isolation
- Adding new scenes requires modifying existing ones

### With Events (Loose Coupling)

```typescript
// ✅ GOOD: Battle emits event, anyone can listen
class BattleScene {
  private eventBus: EventBus;

  endBattle() {
    this.eventBus.emit("battle:complete", {
      npcId: "gentleman_01",
      result: "win",
    });
  }
}

// GameState listens and updates
class GameState {
  constructor(eventBus: EventBus) {
    eventBus.on("battle:complete", this.onBattleComplete.bind(this));
  }

  onBattleComplete(data: BattleCompleteEvent) {
    this.setNPCDefeated(data.npcId);
  }
}
```

**Benefits**:

- Components don't know about each other
- Easy to add new listeners
- Testable in isolation
- Clear data flow

---

## EventBus Implementation

```typescript
type EventCallback<T = unknown> = (data: T) => void;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T>(event: string, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
  }

  /**
   * Unsubscribe from an event
   */
  off<T>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
    }
  }

  /**
   * Emit an event with data
   */
  emit<T>(event: string, data?: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Subscribe to an event only once
   */
  once<T>(event: string, callback: EventCallback<T>): void {
    const wrappedCallback: EventCallback<T> = (data) => {
      this.off(event, wrappedCallback);
      callback(data);
    };
    this.on(event, wrappedCallback);
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Debug: list all registered events
   */
  debug(): void {
    console.log("Registered events:");
    for (const [event, callbacks] of this.listeners) {
      console.log(`  ${event}: ${callbacks.size} listeners`);
    }
  }
}

// Singleton instance
export const eventBus = new EventBus();
```

---

## Event Catalog

### Scene Events

| Event              | Data                                  | Description            |
| ------------------ | ------------------------------------- | ---------------------- |
| `scene:transition` | `{ to: SceneName, context?: object }` | Request scene change   |
| `scene:changed`    | `{ from: SceneName, to: SceneName }`  | Scene change completed |
| `scene:ready`      | `{ scene: SceneName }`                | Scene finished loading |

```typescript
// Request transition
eventBus.emit('scene:transition', {
  to: 'battle',
  context: { npcId: 'gentleman_01', ... }
});

// Listen for scene changes
eventBus.on('scene:changed', ({ from, to }) => {
  console.log(`Scene changed: ${from} → ${to}`);
});
```

### Battle Events

| Event             | Data                  | Description      |
| ----------------- | --------------------- | ---------------- |
| `battle:start`    | `BattleContext`       | Battle initiated |
| `battle:complete` | `BattleResult`        | Battle ended     |
| `battle:attack`   | `AttackData`          | Attack executed  |
| `battle:faint`    | `{ pokemon: string }` | Pokemon fainted  |

```typescript
interface BattleContext {
  npcId: string;
  npcName: string;
  npcPokemon: PokemonConfig[];
  playerPokemon: PokemonConfig[];
}

interface BattleResult {
  npcId: string;
  result: "win" | "lose" | "flee";
  expGained: number;
  moneyGained: number;
}

interface AttackData {
  attacker: string;
  defender: string;
  move: string;
  damage: number;
  critical: boolean;
}

// Emit battle complete
eventBus.emit("battle:complete", {
  npcId: "gentleman_01",
  result: "win",
  expGained: 500,
  moneyGained: 1000,
});
```

### Player Events

| Event              | Data                   | Description                   |
| ------------------ | ---------------------- | ----------------------------- |
| `player:move`      | `{ x, y, direction }`  | Player moved                  |
| `player:collision` | `{ with: string }`     | Player hit something          |
| `player:interact`  | `{ targetId: string }` | Player interacted with entity |

```typescript
// Player collided with NPC
eventBus.emit("player:collision", {
  with: "npc:gentleman_01",
});

// Listen for player interactions
eventBus.on("player:interact", ({ targetId }) => {
  if (targetId.startsWith("npc:")) {
    this.startNPCDialogue(targetId);
  }
});
```

### Dialog Events

| Event             | Data               | Description              |
| ----------------- | ------------------ | ------------------------ |
| `dialog:show`     | `{ text: string }` | Dialog opened            |
| `dialog:complete` | `void`             | Text finished displaying |
| `dialog:hide`     | `void`             | Dialog closed            |

```typescript
// Listen for dialog completion
eventBus.on("dialog:complete", () => {
  // Enable player input again
  this.player.setFreeze(false);
});
```

### NPC Events

| Event          | Data                | Description             |
| -------------- | ------------------- | ----------------------- |
| `npc:interact` | `{ npcId: string }` | NPC interaction started |
| `npc:defeated` | `{ npcId: string }` | NPC marked as defeated  |

```typescript
// Mark NPC as defeated (GameState listens)
eventBus.emit("npc:defeated", {
  npcId: "gentleman_01",
});
```

### Game Events

| Event         | Data   | Description         |
| ------------- | ------ | ------------------- |
| `game:save`   | `void` | Save game requested |
| `game:load`   | `void` | Load game requested |
| `game:pause`  | `void` | Game paused         |
| `game:resume` | `void` | Game resumed        |

---

## Type-Safe Events

For better type safety, define event types:

```typescript
// events/types.ts
interface GameEvents {
  "scene:transition": { to: SceneName; context?: SceneContext };
  "scene:changed": { from: SceneName; to: SceneName };
  "battle:complete": BattleResult;
  "npc:defeated": { npcId: string };
  // ... all events
}

// Type-safe emit helper
function emitEvent<K extends keyof GameEvents>(
  event: K,
  data: GameEvents[K]
): void {
  eventBus.emit(event, data);
}

// Type-safe listener helper
function onEvent<K extends keyof GameEvents>(
  event: K,
  callback: (data: GameEvents[K]) => void
): void {
  eventBus.on(event, callback);
}

// Usage
emitEvent("battle:complete", {
  npcId: "gentleman_01",
  result: "win", // TypeScript validates this
  expGained: 500,
  moneyGained: 1000,
});

onEvent("battle:complete", (data) => {
  // data is typed as BattleResult
  console.log(data.result); // 'win' | 'lose' | 'flee'
});
```

---

## Event Flow Examples

### Battle Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    BATTLE FLOW                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  WorldScene                                                  │
│      │                                                       │
│      │ Player collides with NPC                              │
│      │                                                       │
│      ▼                                                       │
│  emit('battle:start', { npcId, pokemon, ... })              │
│      │                                                       │
│      ├──────────────────────────────────────┐               │
│      │                                      │               │
│      ▼                                      ▼               │
│  SceneManager                          GameState            │
│  (listens, transitions                 (logs battle        │
│   to BattleScene)                       start)              │
│      │                                                       │
│      ▼                                                       │
│  BattleScene.onEnter(context)                               │
│      │                                                       │
│      │ ... battle happens ...                               │
│      │                                                       │
│      ▼                                                       │
│  emit('battle:complete', { result: 'win', ... })            │
│      │                                                       │
│      ├──────────────────────────────────────┐               │
│      │                                      │               │
│      ▼                                      ▼               │
│  SceneManager                          GameState            │
│  (transitions back                     (updates NPC        │
│   to WorldScene)                        defeated state)    │
│      │                                                       │
│      ▼                                                       │
│  WorldScene.onEnter()                                       │
│  (NPC now has different dialogue)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Dialog Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DIALOG FLOW                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  WorldScene                                                  │
│      │                                                       │
│      │ NPC collision detected                                │
│      │                                                       │
│      ▼                                                       │
│  player.setFreeze(true)                                     │
│  dialogBox.show()                                            │
│  dialogBox.displayText("Hello!", callback)                  │
│      │                                                       │
│      │ ... typewriter effect ...                            │
│      │                                                       │
│      ▼                                                       │
│  emit('dialog:complete')                                    │
│      │                                                       │
│      ▼                                                       │
│  callback() executes                                        │
│  (might start battle or show next text)                     │
│      │                                                       │
│      │ Player presses ENTER                                 │
│      │                                                       │
│      ▼                                                       │
│  emit('dialog:hide')                                        │
│  player.setFreeze(false)                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Use Descriptive Event Names

```typescript
// ❌ BAD
eventBus.emit('done', { ... });

// ✅ GOOD
eventBus.emit('battle:complete', { ... });
```

### 2. Include Relevant Data

```typescript
// ❌ BAD - WHO was defeated?
eventBus.emit("npc:defeated");

// ✅ GOOD
eventBus.emit("npc:defeated", { npcId: "gentleman_01" });
```

### 3. Clean Up Listeners

```typescript
class MyScene {
  private handleBattle = (data: BattleResult) => { ... };

  onEnter() {
    eventBus.on('battle:complete', this.handleBattle);
  }

  onExit() {
    eventBus.off('battle:complete', this.handleBattle);
  }
}
```

### 4. Don't Overuse Events

Events are for cross-component communication. Within a component, use direct method calls:

```typescript
// ❌ BAD - event for internal state
class Player {
  move() {
    this.x += 1;
    eventBus.emit("player:internal:moved"); // Unnecessary
  }
}

// ✅ GOOD - direct method call
class Player {
  move() {
    this.x += 1;
    this.updateAnimation(); // Direct call
  }
}
```

### 5. Document Event Contracts

Always document what data events carry and who emits/listens:

```typescript
/**
 * Event: battle:complete
 * Emitted by: BattleScene
 * Listened by: GameState, SceneManager
 * Data: BattleResult
 */
```
