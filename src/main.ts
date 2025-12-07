/**
 * Pokemon Remix - Main Entry Point
 *
 * This file initializes and starts the game.
 * All game logic is organized in the src/ directory:
 *
 * - core/       - Core utilities, types, interfaces, and event system
 * - entities/   - Game entities (Player, NPC, Pokemon, Camera, etc.)
 * - scenes/     - Game scenes (Menu, World, Battle)
 * - debug/      - Debug utilities
 *
 * The architecture follows these principles:
 * - TypeScript for type safety and better IDE support
 * - Class-based entities with inheritance for extensibility
 * - Event system for decoupled communication
 * - Scene manager for organized game flow
 * - Interfaces for contracts and extensibility
 */

import { createGame } from '@game/Game';

// Start the game when the DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		createGame();
	});
} else {
	createGame();
}
