/**
 * EventBus - Pub/Sub system for decoupled communication
 *
 * Usage:
 *   eventBus.on('battle:complete', (data) => { ... });
 *   eventBus.emit('battle:complete', { npcId: 'npc1', result: 'win' });
 */

type EventCallback<T = unknown> = (data: T) => void;

export class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private debugMode: boolean = false;

  /**
   * Enable debug logging
   */
  setDebug(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    // Return unsubscribe function
    return () => this.off(event, callback);
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
   * Emit an event with data
   */
  emit<T = unknown>(event: string, data?: T): void {
    if (this.debugMode) {
      console.log(`[EventBus] ${event}`, data);
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Error in handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event only once
   */
  once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    const wrappedCallback: EventCallback<T> = (data) => {
      this.off(event, wrappedCallback);
      callback(data);
    };
    return this.on(event, wrappedCallback);
  }

  /**
   * Remove all listeners for an event (or all events)
   */
  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get count of listeners for an event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * Check if event has listeners
   */
  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0;
  }
}

// Global singleton instance
export const eventBus = new EventBus();
