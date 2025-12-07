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
    └──────────┘  └─────┬────┘  └──────────┘
          │             │              │
          │       ┌─────▼────┐         │
          │       │ Settings │         │
          │       │  Menu    │         │
          │       └──────────┘         │
          └──────────────┼─────────────┘
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
├── app/              # Remix web app (React)
│   ├── components/   # React components (Game.tsx)
│   └── routes/       # Page routes
├── src/              # Game source (TypeScript)
│   ├── core/         # Types, events, utilities
│   ├── state/        # GameState management
│   ├── entities/     # Player, NPC, Pokemon, Map, etc.
│   ├── scenes/       # Menu, World, Battle, Settings
│   ├── data/         # Pokemon & NPC data
│   ├── debug/        # Debug utilities
│   └── lib/          # p5.min.js
├── public/           # Static assets
│   ├── assets/       # Images, fonts
│   └── maps/         # Tiled map JSON
└── docs/             # Documentation (you are here)
```

---

## Extending the Game

### Adding a New Pokemon

1. Add entry to `src/data/pokemon.ts` (POKEMON_DB)
2. Add sprite to `public/assets/`
3. Register in `src/entities/Pokemon.ts` (PokemonRegistry)

### Adding a New NPC

1. Add entry to `src/state/GameState.ts` (DEFAULT_NPCS)
2. Add sprites to `public/assets/`
3. Add spawn point in Tiled map (`public/maps/world.json`)
4. Add to WorldScene if needed

### Adding a New Scene

1. Create scene class in `src/scenes/` extending `Scene`
2. Implement lifecycle methods (load, setup, update, draw)
3. Register in `Game.ts` via `sceneManager.registerScene()`
4. Add scene name to `SceneName` type in `src/core/types.ts`

### Adding a New Event

1. Define event handler in `src/core/GameEvents.ts`
2. Emit with `emitGameEvent("event:name", data)`
3. Listen with `onGameEvent("event:name", callback)`

---

## Tech Stack

| Technology     | Purpose                     |
| -------------- | --------------------------- |
| **p5.js**      | Canvas rendering, game loop |
| **Remix**      | React framework, routing    |
| **TypeScript** | Type safety                 |
| **Biome**      | Linting & formatting        |
| **Vite**       | Build tool                  |
| **Tiled**      | Map editor (JSON export)    |

---

## Contributing

1. Read the architecture docs
2. Follow existing patterns
3. Add tests for new features
4. Update documentation
