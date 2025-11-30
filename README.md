# Pokemon Remix - TypeScript + p5.js

![Screenshot of the game](./screenshot.png)

A Pokemon-style game built with TypeScript and p5.js.

## Features

- 🎮 Title screen with original Pokemon-style graphics
- 🗺️ Tiled map exploration with camera follow
- 👥 Multiple NPCs with dialogue system
- ⚔️ Turn-based battle system
- 📋 In-game settings menu (ESC key)
- 🐛 Debug mode (Shift key)

## Tech Stack

- **TypeScript** - Type-safe game code
- **p5.js** - Canvas rendering & game loop
- **Remix** - React framework (web wrapper)
- **Vite** - Build tool
- **Biome** - Linting & formatting
- **Tiled** - Map editor

## Getting Started

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
npm run check:fix      # Fix safe issues
npm run check:fix:all  # Fix all issues (including unused imports)
```

## Controls

| Key        | Action             |
| ---------- | ------------------ |
| Arrow Keys | Move player        |
| Enter      | Confirm / Talk     |
| ESC        | Open settings menu |
| Shift      | Toggle debug mode  |

## Project Structure

```
src/                  # TypeScript source
├── Game.ts           # Main game class
├── scenes/           # Menu, World, Battle, Settings
├── entities/         # Player, NPC, Pokemon, Map
├── state/            # GameState management
└── core/             # Types, events, utilities

public/               # Static assets
├── assets/           # Images, fonts
└── maps/             # Tiled JSON maps
```

## Documentation

See [docs/](./docs/) for detailed documentation.

## Credits

Original tutorial by JSLegend: https://youtube.com/@jslegenddev
