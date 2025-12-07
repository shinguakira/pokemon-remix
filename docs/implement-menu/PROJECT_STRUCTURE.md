# Project Structure Reference

## Important: File Locations

The game uses **TypeScript** with source code in `src/` folder.

### Source Files (TypeScript)

```
src/
├── Game.ts              # Main game class, p5 sketch setup
├── main.ts              # Entry point
├── index.ts             # Module exports
├── lib/
│   └── p5.min.js        # p5.js library
├── core/
│   ├── types.ts         # TypeScript type definitions
│   ├── interfaces.ts    # Interface definitions
│   ├── EventBus.ts      # Event system
│   ├── GameEvents.ts    # Game event helpers
│   └── utils.ts         # Helper functions
├── scenes/
│   ├── Scene.ts         # Base scene class
│   ├── SceneManager.ts  # Scene management
│   ├── MenuScene.ts     # Title screen
│   ├── WorldScene.ts    # Overworld exploration
│   ├── BattleScene.ts   # Pokemon battle system
│   └── SettingsMenuScene.ts  # In-game pause menu
├── entities/
│   ├── Entity.ts        # Base entity class
│   ├── AnimatedEntity.ts # Animated entity class
│   ├── Character.ts     # Player & NPC classes
│   ├── Pokemon.ts       # Pokemon class & registry
│   ├── Camera.ts        # Camera follow system
│   ├── TiledMap.ts      # Tiled map loader
│   ├── DialogBox.ts     # Text dialog system
│   └── Collidable.ts    # Collision detection
├── state/
│   └── GameState.ts     # Centralized game state management
├── data/
│   ├── pokemon.ts       # Pokemon stats database
│   └── npcs.ts          # NPC definitions
└── debug/
    └── DebugMode.ts     # Debug utilities
```

### Static Assets (public/)

```
public/
├── assets/              # Images, fonts
│   ├── title.png        # Title screen
│   ├── start.png        # Press start text
│   ├── boy_run.png      # Player sprite
│   ├── trainer_GENTLEMAN.png  # NPC sprite
│   └── ...
└── maps/
    └── world.json       # Tiled JSON maps
```

### App Files (Remix)

```
app/
├── components/
│   └── Game.tsx         # React wrapper for p5 game
├── routes/
│   └── _index.tsx       # Main route
├── root.tsx             # Root layout
└── tailwind.css         # Styles
```

## Key Patterns

### Scene Class Structure

Each scene extends the base `Scene` class:

```typescript
import { Scene } from "./Scene";

export class MyScene extends Scene {
  readonly name: SceneName = "myScene";

  load(p: P5Instance): void {} // Preload assets
  setup(): void {} // Initialize state
  update(deltaTime: number): void {} // Game logic per frame
  draw(p: P5Instance): void {} // Render to canvas
  reset(): void {} // Reset state
  onKeyPressed(event: KeyEvent): void {} // Handle input
  onKeyReleased(event: KeyEvent): void {} // Handle key release
}
```

### Debug Mode

- Toggle: Press `Shift`
- Shows: FPS counter, hitboxes
- Access: `import { debugMode } from "./debug/DebugMode"`

### Scene Switching

```typescript
// Via EventBus
import { emitGameEvent } from "./core/GameEvents";

emitGameEvent("scene:transition", { to: "world" });

// Via SceneManager
sceneManager.setScene("battle", { npcId: "gentleman_01" });
```

### Game State

```typescript
import { gameState } from "./state/GameState";

// Player data
const pokemon = gameState.getPlayerPokemon();
const money = gameState.getPlayerMoney();

// NPC data
const npc = gameState.getNPC("gentleman_01");
const isDefeated = gameState.isNPCDefeated("gentleman_01");
```

## Available Pokemon Data

Located in `src/data/pokemon.ts`:

- BLASTOISE (Water)
- VENUSAUR (Grass)
- CHARIZARD (Fire)

## NPCs

Located in `src/state/GameState.ts`:

- gentleman_01 (Mark) - Has VENUSAUR
- gentleman_02 (James) - Has BLASTOISE
