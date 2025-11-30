/**
 * GameContext - Shared context passed to all scenes
 * Contains references to shared state and services
 */

import { gameState } from '../state/GameState';
import type { PokemonConfig } from './interfaces';

/**
 * Context interface - what scenes can access
 */
export interface IGameContext {
	// Player data
	getPlayerPokemon(): PokemonConfig[];
	setPlayerPokemon(pokemon: PokemonConfig[]): void;
	getPlayerName(): string;

	// NPC data
	getNPC(
		id: string
	): { name: string; title: string; pokemon: string[]; defeated: boolean } | undefined;
	getNPCDialogue(id: string): string;
	isNPCDefeated(id: string): boolean;
	setNPCDefeated(id: string): void;

	// Game actions
	save(): void;

	// Debug
	isDebugMode(): boolean;
}

/**
 * GameContext implementation - wraps gameState
 */
class GameContext implements IGameContext {
	private debugMode = false;

	getPlayerPokemon(): PokemonConfig[] {
		return gameState.getPlayerPokemon();
	}

	setPlayerPokemon(pokemon: PokemonConfig[]): void {
		gameState.setPlayerPokemon(pokemon);
	}

	getPlayerName(): string {
		return gameState.getPlayer().name;
	}

	getNPC(
		id: string
	): { name: string; title: string; pokemon: string[]; defeated: boolean } | undefined {
		const npc = gameState.getNPC(id);
		if (!npc) return undefined;
		return {
			name: npc.name,
			title: npc.title,
			pokemon: npc.pokemon,
			defeated: npc.defeated,
		};
	}

	getNPCDialogue(id: string): string {
		return gameState.getNPCDialogue(id);
	}

	isNPCDefeated(id: string): boolean {
		return gameState.isNPCDefeated(id);
	}

	setNPCDefeated(id: string): void {
		gameState.setNPCDefeated(id);
	}

	save(): void {
		gameState.save();
	}

	isDebugMode(): boolean {
		return this.debugMode;
	}

	setDebugMode(enabled: boolean): void {
		this.debugMode = enabled;
	}
}

// Single context instance
export const gameContext = new GameContext();
