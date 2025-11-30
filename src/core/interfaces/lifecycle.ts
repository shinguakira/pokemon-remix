/**
 * Lifecycle interfaces for game objects
 */

import type { P5Instance } from "./core";

// =============================================================================
// Lifecycle Interfaces
// =============================================================================

/**
 * Interface for objects that can be loaded (async resource loading)
 */
export interface ILoadable {
  load(p: P5Instance): void | Promise<void>;
}

/**
 * Interface for objects that require setup after loading
 */
export interface ISetupable {
  setup(): void;
}

/**
 * Interface for objects that update each frame
 */
export interface IUpdatable {
  update(deltaTime: number): void;
}

/**
 * Interface for objects that can be drawn
 */
export interface IDrawable {
  draw(p: P5Instance): void;
}

/**
 * Interface for objects that can be reset to initial state
 */
export interface IResettable {
  reset(): void;
}

/**
 * Complete game object lifecycle interface
 */
export interface IGameObject
  extends ILoadable,
    ISetupable,
    IUpdatable,
    IDrawable {
  readonly id: string;
}
