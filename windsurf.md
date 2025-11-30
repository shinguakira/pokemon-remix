# Windsurf Project Analysis

This document provides a brief analysis of the project to be used by the Windsurf agent.

## Project Overview

This is a Pokémon-style game prototype built with Remix, TypeScript, and p5.js. The core game logic is written in TypeScript, while the Remix framework serves the game canvas and assets.

## Tech Stack

- **Framework:** Remix (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Game Engine:** p5.js
- **Linting/Formatting:** Biome
- **Build Tool:** Vite
- **Package Manager:** npm

## Project Structure

```
pokemon-remix/
├── app/                  # Remix application (React)
│   ├── components/       # React components (Game.tsx)
│   ├── routes/           # Page routes (_index.tsx)
│   └── root.tsx          # App shell
├── src/                  # Game source (TypeScript)
│   ├── Game.ts           # Main game class, entry point
│   ├── main.ts           # p5.js initialization
│   ├── core/             # Types, interfaces, events, utilities
│   │   ├── interfaces/   # TypeScript interfaces
│   │   ├── EventBus.ts   # Pub/sub event system
│   │   └── utils.ts      # Helper functions
│   ├── entities/         # Game entities
│   │   ├── Character.ts  # Player, NPC base
│   │   ├── Pokemon.ts    # Pokemon entity
│   │   ├── TiledMap.ts   # Map renderer
│   │   └── DialogBox.ts  # Dialog system
│   ├── scenes/           # Game scenes
│   │   ├── MenuScene.ts
│   │   ├── WorldScene.ts
│   │   ├── BattleScene.ts
│   │   └── SettingsMenuScene.ts
│   ├── state/            # Game state management
│   │   └── GameState.ts
│   ├── data/             # Pokemon & NPC data
│   └── debug/            # Debug utilities
├── public/               # Static assets
│   ├── assets/           # Images, fonts
│   └── maps/             # Tiled map JSON
└── docs/                 # Documentation
```

## Development Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run typecheck`: Runs the TypeScript compiler to check for type errors.

### Linting & Formatting (Biome)

- `npm run lint`: Check for lint errors
- `npm run lint:fix`: Fix lint errors
- `npm run format`: Check formatting
- `npm run format:fix`: Fix formatting
- `npm run check`: Run lint + format check
- `npm run check:fix`: Fix safe lint + format issues
- `npm run check:fix:all`: Fix all issues including unsafe (removes unused imports/variables)

#### Biome Configuration

Config file: `biome.json`

Key rules enabled:

- **TypeScript:** `useImportType`, `useExportType`, `noInferrableTypes`, `useShorthandArrayType`
- **React:** `useExhaustiveDependencies`, `useHookAtTopLevel`, `useSelfClosingElements`
- **Style:** `useConst`, `useTemplate`, `useOptionalChain`
- **Correctness:** `noUnusedImports`, `noUnusedVariables`, `noUnusedPrivateClassMembers`

Ignored files: `**/p5.min.js`
