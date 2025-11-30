// Interfaces & Types
export * from './interfaces';

// Game Context
export { gameContext, type IGameContext } from './GameContext';

// Event System
export { EventBus, eventBus } from './EventBus';
export { emitGameEvent, onGameEvent, onceGameEvent } from './GameEvents';
export type {
	BattleStartData,
	BattleCompleteData,
	BattleAttackData,
	DialogShowData,
	NPCInteractData,
	PlayerMoveData,
	GameEventMap,
} from './GameEvents';

// Utilities
export * from './utils';
