# Pokemon Remix - Game Architecture

This directory contains the refactored game code with improved extensibility and maintainability.

## Directory Structure

```
src/
├── core/           # Core utilities, types, and infrastructure
│   ├── types.ts        # TypeScript type definitions
│   ├── interfaces.ts   # Interface contracts for extensibility
│   ├── EventEmitter.ts # Event system for decoupled communication
│   ├── utils.ts        # Utility functions (collision, animation, etc.)
│   └── index.ts        # Re-exports
│
├── entities/       # Game entities (characters, objects, etc.)
│   ├── Entity.ts           # Base entity class
│   ├── AnimatedEntity.ts   # Base for animated sprites
│   ├── Character.ts        # Base character + Player & NPC classes
│   ├── Pokemon.ts          # Pokemon class + registry
│   ├── Camera.ts           # Camera following system
│   ├── DialogBox.ts        # Dialog/text box
│   ├── Collidable.ts       # Collision boundaries
│   ├── TiledMap.ts         # Tiled map loader/renderer
│   └── index.ts            # Re-exports
│
├── scenes/         # Game scenes (game states)
│   ├── Scene.ts        # Base scene class
│   ├── SceneManager.ts # Scene lifecycle management
│   ├── MenuScene.ts    # Title/menu screen
│   ├── WorldScene.ts   # Overworld exploration
│   ├── BattleScene.ts  # Turn-based battle
│   └── index.ts        # Re-exports
│
├── debug/          # Development utilities
│   └── DebugMode.ts    # Debug overlay (FPS, hitboxes)
│
├── Game.ts         # Main game class
├── main.ts         # Entry point
└── index.ts        # Public API exports
```

## Key Concepts

### 1. Type Safety with TypeScript

All game code is now TypeScript with proper types:

```typescript
// Types are defined in core/types.ts
interface PokemonConfig {
  name: string;
  level: number;
  stats: PokemonStats;
  moves: Move[];
}
```

### 2. Class-Based Inheritance

Entities follow a clear inheritance hierarchy:

```
Entity (base)
  └── AnimatedEntity (adds animation)
        └── Character (adds movement)
              ├── Player (keyboard input)
              └── NPC (AI/scripted behavior)
```

### 3. Interface Contracts

Interfaces define contracts for extensibility:

```typescript
// Implement these interfaces for new entity types
interface IGameObject extends ILoadable, ISetupable, IUpdatable, IDrawable {
  readonly id: string;
}

interface IScene
  extends ILoadable,
    ISetupable,
    IUpdatable,
    IDrawable,
    IResettable {
  readonly name: SceneName;
  onEnter?(data?: Record<string, unknown>): void;
  onExit?(): void;
}
```

### 4. Event System

Decoupled communication via events:

```typescript
import { emitGameEvent, onGameEvent } from "./core";

// Emit an event
emitGameEvent("battle:end", { winner: "player", npcId: "npc1" });

// Listen for events
onGameEvent("battle:end", (data) => {
  if (data.winner === "player") {
    // Handle win
  }
});
```

### 5. Scene Management

Scenes are managed by SceneManager:

```typescript
const sceneManager = new SceneManager(p5Instance, "menu");

// Register scenes
sceneManager.registerScene(new MenuScene(p5Instance));
sceneManager.registerScene(new WorldScene(p5Instance));
sceneManager.registerScene(new BattleScene(p5Instance));

// Change scenes
sceneManager.setScene("world", { someData: "value" });
```

## Extending the Game

### Adding a New Pokemon

```typescript
import { registerPokemon } from "./entities";

registerPokemon("PIKACHU", {
  name: "PIKACHU",
  level: 25,
  stats: { maxHp: 80, attack: 55, defense: 40 },
  moves: [
    { name: "THUNDERBOLT", power: 90 },
    { name: "QUICK ATTACK", power: 40 },
  ],
  spriteUrl: "assets/PIKACHU.png",
});
```

### Adding a New Entity Type

```typescript
import { AnimatedEntity, type AnimatedEntityConfig } from "./entities";

export class Enemy extends AnimatedEntity {
  protected defineAnimations(): void {
    this.animations = {
      idle: 0,
      attack: { from: 0, to: 3, loop: false, speed: 10 },
    };
  }

  update(deltaTime: number): void {
    // Custom AI logic
    super.update(deltaTime);
  }
}
```

### Adding a New Scene

```typescript
import { Scene } from "./scenes";
import type { P5Instance, SceneName, KeyEvent } from "./core";

export class ShopScene extends Scene {
  readonly name: SceneName = "shop"; // Add to SceneName type

  load(p: P5Instance): void {
    // Load assets
  }

  setup(): void {
    // Initialize scene
  }

  update(deltaTime: number): void {
    // Update logic
  }

  draw(p: P5Instance): void {
    // Render scene
  }

  reset(): void {
    // Reset state
  }
}
```

## Debug Mode

Press **Shift** to toggle debug mode:

- FPS counter
- Entity hitboxes (when implemented in draw calls)

## Migration from Old Code

The old JavaScript files in `/entities/`, `/scenes/`, and `main.js` can be removed once the new TypeScript code is verified working. The new entry point is `src/main.ts`.
