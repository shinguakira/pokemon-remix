/**
 * Type definitions for all game events
 * Provides type safety when emitting and listening to events
 */

import type { SceneName } from "./interfaces";

// =============================================================================
// Event Data Types
// =============================================================================

export interface SceneTransitionData {
  to: SceneName;
  context?: Record<string, unknown>;
}

export interface SceneChangedData {
  from: SceneName;
  to: SceneName;
}

export interface BattleStartData {
  npcId: string;
  npcName: string;
  npcPokemon: string[];
  playerPokemon: string[];
  location?: string;
}

export interface BattleCompleteData {
  npcId: string;
  result: "win" | "lose" | "flee";
  expGained?: number;
  moneyGained?: number;
}

export interface BattleAttackData {
  attacker: string;
  defender: string;
  move: string;
  damage: number;
  critical?: boolean;
  effective?: "super" | "not-very" | "normal";
}

export interface DialogShowData {
  text: string;
  speaker?: string;
}

export interface NPCInteractData {
  npcId: string;
}

export interface PlayerMoveData {
  x: number;
  y: number;
  direction: string;
}

// =============================================================================
// Event Map - All events and their data types
// =============================================================================

export interface GameEventMap {
  // Scene events
  "scene:transition": SceneTransitionData;
  "scene:changed": SceneChangedData;
  "scene:ready": { scene: SceneName };

  // Battle events
  "battle:start": BattleStartData;
  "battle:complete": BattleCompleteData;
  "battle:attack": BattleAttackData;
  "battle:faint": { pokemon: string; isPlayer: boolean };
  "battle:turn-start": { turn: number };

  // Dialog events
  "dialog:show": DialogShowData;
  "dialog:complete": void;
  "dialog:hide": void;
  "dialog:skip": void;

  // NPC events
  "npc:interact": NPCInteractData;
  "npc:defeated": { npcId: string };

  // Player events
  "player:move": PlayerMoveData;
  "player:collision": { with: string };
  "player:freeze": { frozen: boolean };

  // Game state events
  "game:save": void;
  "game:load": void;
  "game:pause": void;
  "game:resume": void;

  // Debug events
  "debug:toggle": { enabled: boolean };
}

// =============================================================================
// Type-safe event helpers
// =============================================================================

import { eventBus } from "./EventBus";

/**
 * Type-safe event emitter
 */
export function emitGameEvent<K extends keyof GameEventMap>(
  event: K,
  data: GameEventMap[K]
): void {
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
