/**
 * Type-safe event helpers
 * Interfaces are defined in ./interfaces/events.ts
 */

import { eventBus } from './EventBus';
import type { GameEventMap } from './interfaces';

// Re-export event interfaces for convenience
export type {
	SceneTransitionData,
	SceneChangedData,
	BattleStartData,
	BattleCompleteData,
	BattleAttackData,
	DialogShowData,
	NPCInteractData,
	PlayerMoveData,
	GameEventMap,
} from './interfaces';

/**
 * Type-safe event emitter
 */
export function emitGameEvent<K extends keyof GameEventMap>(event: K, data: GameEventMap[K]): void {
	eventBus.emit(event, data);
}

/**
 * Type-safe event listener
 */
export function onGameEvent<K extends keyof GameEventMap>(
	event: K,
	callback: (data: GameEventMap[K]) => void
): () => void {
	return eventBus.on(event, callback);
}

/**
 * Type-safe one-time event listener
 */
export function onceGameEvent<K extends keyof GameEventMap>(
	event: K,
	callback: (data: GameEventMap[K]) => void
): () => void {
	return eventBus.once(event, callback);
}
