# Project Structure Reference

## Important: File Locations

The game uses **two separate folder structures**:

### Runtime Files (ACTUAL GAME CODE)

```
public/
├── main.js              # Entry point, scene management
├── p5.min.js            # p5.js library
├── utils.js             # Helper functions
├── scenes/
│   ├── menu.js          # Title screen
│   ├── world.js         # Overworld exploration
│   └── battle.js        # Pokemon battle system
├── entities/
│   ├── player.js        # Player character
│   ├── pokemon.js       # Pokemon class
│   ├── pokemon-data.js  # Pokemon stats database
│   ├── character.js     # Base character class
│   ├── npc.js           # NPC characters
│   ├── camera.js        # Camera follow system
│   ├── map.js           # Tiled map loader
│   ├── dialogBox.js     # Text dialog system
│   ├── debugMode.js     # Debug utilities
│   └── Collidable.js    # Collision detection
├── assets/              # Images, fonts
└── maps/                # Tiled JSON maps
```

### Root Files (Build/Config)

```
/
├── app/                 # Remix app (React wrapper)
├── index.html           # HTML entry
├── vite.config.ts       # Vite bundler config
├── package.json         # Dependencies
└── docs/                # Documentation
```

## Key Patterns

### Scene Object Structure

Each scene exports a factory function returning an object with:

- `load()` - Preload assets
- `setup()` - Initialize state
- `update()` - Game logic per frame
- `draw()` - Render to canvas
- `reset()` - Reset state
- `onKeyPressed(event)` - Handle input

### Debug Mode

- Toggle: Press `Shift`
- Shows: FPS counter, hitboxes
- Access: `import { debugMode } from "./entities/debugMode.js"`

### Scene Switching

```javascript
// In main.js
function setScene(name) {
  // "menu" | "world" | "battle"
  currentScene = name;
}
```

## Available Pokemon Data

Located in `public/entities/pokemon-data.js`:

- BLASTOISE (Water)
- VENUSAUR (Grass)
- CHARIZARD (Fire)
- PIKACHU (Electric)
- GYARADOS (Water/Flying)
- SNORLAX (Normal)
