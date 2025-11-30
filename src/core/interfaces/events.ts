/**
 * Event interfaces
 */

import type { SceneName } from "./scene";

// =============================================================================
// Event Types & Interfaces
// =============================================================================

export type EventCallback<T = unknown> = (data: T) => void;

/**
 * Interface for event emitters
 */
export interface IEventEmitter {
  on<T = unknown>(event: string, callback: EventCallback<T>): void;
  off<T = unknown>(event: string, callback: EventCallback<T>): void;
  emit<T = unknown>(event: string, data?: T): void;
}

// =============================================================================
// Game Event Data Interfaces
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
