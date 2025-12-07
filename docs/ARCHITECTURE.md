# Pokemon Remix - Architecture Documentation

## Overview

Pokemon Remix is a browser-based Pokemon-style game built with:

- **p5.js** - Canvas rendering and game loop
- **Remix** - React framework for web integration
- **TypeScript** - Type safety and better DX
- **Biome** - Linting and formatting
- **Vite** - Build tool

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Remix App (React)                                           │   │
│  │  └── /game route loads Game component                        │   │
│  │      └── Canvas element for p5.js rendering                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           GAME LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Game.ts    │  │ SceneManager │  │      EventBus            │  │
│  │              │  │              │  │                          │  │
│  │ - p5 setup   │  │ - scene      │  │ - publish/subscribe      │  │
│  │ - game loop  │  │   lifecycle  │  │ - decoupled messaging    │  │
│  │ - input      │  │ - transitions│  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SCENE LAYER                                │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │   MenuScene    │  │   WorldScene   │  │  BattleScene   │        │
│  │                │  │                │  │                │        │
│  │ - title screen │  │ - exploration  │  │ - turn-based   │        │
│  │ - start game   │  │ - NPC interact │  │   combat       │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         ENTITY LAYER                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Entity (base)                                                │  │
│  │    └── Sprite (rendering)                                     │  │
│  │          └── AnimatedSprite (animation)                       │  │
│  │                └── Character (movement, direction)            │  │
│  │                      ├── Player (input handling)              │  │
│  │                      └── NPC (AI, dialogue)                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │    Pokemon     │  │    TiledMap    │  │   DialogBox    │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          STATE LAYER                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       GameState                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │  │
│  │  │ PlayerState │  │  NPCState   │  │  GameFlags  │           │  │
│  │  │ - pokemon   │  │ - defeated  │  │ - progress  │           │  │
│  │  │ - position  │  │ - dialogue  │  │ - settings  │           │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │  pokemon.ts    │  │    npcs.ts     │  │  world.json    │        │
│  │ - stats        │  │ - definitions  │  │ - spawn points │        │
│  │ - moves        │  │ - pokemon team │  │ - boundaries   │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
pokemon-remix/
├── app/                      # Remix application
│   ├── components/
│   │   └── Game.tsx          # p5.js integration component
│   ├── routes/
│   │   └── _index.tsx        # Main route
│   └── root.tsx              # App shell
│
├── src/                      # Game source (TypeScript)
│   ├── Game.ts               # Main game class
│   ├── main.ts               # p5.js initialization
│   │
│   ├── core/                 # Core infrastructure
│   │   ├── interfaces/       # TypeScript interfaces
│   │   ├── EventBus.ts       # Event system
│   │   ├── GameEvents.ts     # Game event handlers
│   │   └── utils.ts          # Helper functions
│   │
│   ├── state/                # State management
│   │   └── GameState.ts      # Central state
│   │
│   ├── entities/             # Game entities
│   │   ├── Character.ts      # Player/NPC base
│   │   ├── Player.ts
│   │   ├── NPC.ts
│   │   ├── Pokemon.ts
│   │   ├── TiledMap.ts
│   │   ├── DialogBox.ts
│   │   └── Camera.ts
│   │
│   ├── scenes/               # Game scenes
│   │   ├── SceneManager.ts
│   │   ├── Scene.ts          # Base class
│   │   ├── MenuScene.ts
│   │   ├── WorldScene.ts
│   │   ├── BattleScene.ts
│   │   └── SettingsMenuScene.ts
│   │
│   ├── data/                 # Static data
│   │   ├── pokemon.ts
│   │   └── npcs.ts
│   │
│   └── debug/                # Debug utilities
│       └── DebugMode.ts
│
├── public/                   # Static assets
│   ├── assets/               # Images, fonts
│   └── maps/                 # Tiled map data
│
└── docs/                     # Documentation
```

---

## Design Principles

### 1. **Separation of Concerns**

Each layer has a single responsibility:

- **Presentation** - Rendering and user interaction
- **Game** - Core loop and coordination
- **Scene** - Game state contexts
- **Entity** - Game objects
- **State** - Data persistence
- **Data** - Configuration

### 2. **Loose Coupling**

Components communicate through:

- **EventBus** - For cross-system events
- **Scene Context** - For scene transitions
- **GameState** - For shared data

### 3. **Single Source of Truth**

- All game state lives in `GameState`
- Scenes READ from state, EMIT events to modify
- No direct state mutation between scenes

### 4. **Composition Over Inheritance**

- Entities built from composable behaviors
- Systems process entities with specific components
- Easy to add new entity types

### 5. **Data-Driven Design**

- Pokemon, NPCs, maps defined in JSON
- Easy to add content without code changes
- Supports modding and expansion

---

## Key Interfaces

```typescript
// Scene lifecycle
interface IScene {
  name: string;
  load(): Promise<void>;
  setup(): void;
  update(deltaTime: number): void;
  draw(): void;
  cleanup(): void;
  onEnter(context?: SceneContext): void;
  onExit(): void;
}

// Entity base
interface IEntity {
  id: string;
  x: number;
  y: number;
  update(deltaTime: number): void;
  draw(): void;
}

// State management
interface IGameState {
  getPlayer(): PlayerState;
  getNPC(id: string): NPCState;
  emit(event: string, data: any): void;
  subscribe(event: string, handler: Function): void;
}
```

---

## Data Flow

See [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) for detailed data flow documentation.

---

## Next Steps

1. Read [GAME_DESIGN.md](./GAME_DESIGN.md) for gameplay documentation
2. Read [ENTITIES.md](./ENTITIES.md) for entity system details
3. Read [SCENES.md](./SCENES.md) for scene system details
4. Read [EVENTS.md](./EVENTS.md) for event system details
