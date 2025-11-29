import type { EventCallback, IEventEmitter } from "./interfaces";

/**
 * Type-safe event emitter for decoupled communication between game components.
 * This allows scenes and entities to communicate without direct references.
 */
export class EventEmitter implements IEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event with optional data
   */
  emit<T = unknown>(event: string, data?: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Subscribe to an event only once
   */
  once<T = unknown>(event: string, callback: EventCallback<T>): void {
    const wrappedCallback: EventCallback<T> = (data) => {
      this.off(event, wrappedCallback);
      callback(data);
    };
    this.on(event, wrappedCallback);
  }

  /**
   * Remove all listeners for a specific event or all events
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

// =============================================================================
// Game Events - Strongly typed event definitions
// =============================================================================

/**
 * All game events with their payload types
 */
export interface GameEvents {
  // Scene events
  "scene:change": { from?: string; to: string; data?: Record<string, unknown> };
  "scene:ready": { scene: string };

  // Battle events
  "battle:start": { npcId: string };
  "battle:end": { winner: "player" | "npc"; npcId: string };
  "battle:attack": {
    attacker: string;
    defender: string;
    move: string;
    damage: number;
  };
  "battle:faint": { pokemon: string };

  // Player events
  "player:move": { x: number; y: number; direction: string };
  "player:collision": { with: string };
  "player:interact": { targetId: string };

  // Dialog events
  "dialog:show": { text: string };
  "dialog:complete": void;
  "dialog:hide": void;

  // NPC events
  "npc:defeated": { npcId: string };
  "npc:interact": { npcId: string };

  // Game state events
  "game:save": void;
  "game:load": void;
  "game:pause": void;
  "game:resume": void;
}

/**
 * Global game event emitter singleton
 */
export const gameEvents = new EventEmitter();

/**
 * Type-safe event emitter helper
 */
export function emitGameEvent<K extends keyof GameEvents>(
  event: K,
  data: GameEvents[K]
): void {
  gameEvents.emit(event, data);
}

export function onGameEvent<K extends keyof GameEvents>(
  event: K,
  callback: (data: GameEvents[K]) => void
): void {
  gameEvents.on(event, callback as EventCallback);
}

export function offGameEvent<K extends keyof GameEvents>(
  event: K,
  callback: (data: GameEvents[K]) => void
): void {
  gameEvents.off(event, callback as EventCallback);
}
