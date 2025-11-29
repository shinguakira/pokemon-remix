# Pokemon Remix - Documentation

Welcome to the Pokemon Remix documentation. This guide covers the game's architecture, systems, and how to extend it.

---

## Quick Links

| Document                                     | Description                                             |
| -------------------------------------------- | ------------------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)         | System overview, directory structure, design principles |
| [GAME_DESIGN.md](./GAME_DESIGN.md)           | Gameplay, scenes, entities, assets                      |
| [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) | Data flow, GameState, scene context                     |
| [ENTITIES.md](./ENTITIES.md)                 | Entity hierarchy, base classes, creating entities       |
| [SCENES.md](./SCENES.md)                     | Scene lifecycle, SceneManager, transitions              |
| [EVENTS.md](./EVENTS.md)                     | EventBus, event catalog, best practices                 |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    REMIX APP                             │
│                  (Web Framework)                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    GAME CORE                             │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │  Game   │  │ SceneManager │  │    EventBus     │    │
│  │  Loop   │  │              │  │   (pub/sub)     │    │
│  └─────────┘  └──────────────┘  └─────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  Menu    │  │  World   │  │  Battle  │
    │  Scene   │  │  Scene   │  │  Scene   │
    └──────────┘  └──────────┘  └──────────┘
          │              │              │
          └──────────────┼──────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     ENTITIES                             │
│  Player, NPC, Pokemon, Map, Camera, DialogBox           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    GAME STATE                            │
│              (Single Source of Truth)                    │
└─────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### 1. Event-Driven Communication

Components don't reference each other directly. They communicate through events:

```typescript
// Emit event
eventBus.emit("battle:complete", { npcId: "npc1", result: "win" });

// Listen for event
eventBus.on("battle:complete", (data) => {
  gameState.setNPCDefeated(data.npcId);
});
```

### 2. Scene Context

Data passed between scenes during transitions:

```typescript
sceneManager.transition("battle", {
  npcId: "gentleman_01",
  npcPokemon: ["VENUSAUR"],
  playerPokemon: ["BLASTOISE"],
});
```

### 3. Entity Inheritance

Entities inherit from base classes for shared functionality:

```
Entity → Sprite → AnimatedSprite → Character → Player
```

### 4. Single Source of Truth

All game state lives in `GameState`. Scenes read from it and emit events to modify it.

---

## Getting Started

### Running the Game

```bash
npm install
npm run dev
# Navigate to http://localhost:5173/game
```

### Project Structure

```
pokemon-remix/
├── app/              # Remix web app
├── src/              # Game source (TypeScript)
│   ├── core/         # Game loop, events, utilities
│   ├── state/        # State management
│   ├── entities/     # Game objects
│   ├── scenes/       # Game scenes
│   └── data/         # JSON configurations
├── public/           # Static assets
│   ├── assets/       # Images, fonts
│   └── maps/         # Tiled map data
└── docs/             # Documentation (you are here)
```

---

## Extending the Game

### Adding a New Pokemon

1. Add entry to `src/data/pokemon.json`
2. Add sprite to `public/assets/`

### Adding a New NPC

1. Add entry to `src/data/npcs.json`
2. Add sprites to `public/assets/`
3. Add spawn point in Tiled map

### Adding a New Scene

1. Create scene class in `src/scenes/`
2. Implement `IScene` interface
3. Register in `SceneManager`

### Adding a New Event

1. Define event type in `src/events/types.ts`
2. Emit from appropriate component
3. Add listeners in relevant handlers

---

## Tech Stack

| Technology     | Purpose                     |
| -------------- | --------------------------- |
| **p5.js**      | Canvas rendering, game loop |
| **Remix**      | React framework, routing    |
| **TypeScript** | Type safety                 |
| **Tiled**      | Map editor (JSON export)    |

---

## Contributing

1. Read the architecture docs
2. Follow existing patterns
3. Add tests for new features
4. Update documentation
