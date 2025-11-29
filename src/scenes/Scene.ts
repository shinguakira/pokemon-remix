import type { P5Instance, SceneName, KeyEvent } from "../core/types";
import type { IScene } from "../core/interfaces";

/**
 * Base class for all game scenes.
 * Provides lifecycle methods and common functionality.
 */
export abstract class Scene implements IScene {
  abstract readonly name: SceneName;

  protected p: P5Instance;
  protected isLoaded: boolean = false;
  protected isSetup: boolean = false;

  constructor(p: P5Instance) {
    this.p = p;
  }

  /**
   * Load scene assets
   */
  abstract load(p: P5Instance): void | Promise<void>;

  /**
   * Setup scene after loading
   */
  abstract setup(): void;

  /**
   * Update scene state
   */
  abstract update(deltaTime: number): void;

  /**
   * Draw scene
   */
  abstract draw(p: P5Instance): void;

  /**
   * Reset scene to initial state
   */
  abstract reset(): void;

  /**
   * Called when entering this scene
   */
  onEnter?(data?: Record<string, unknown>): void;

  /**
   * Called when leaving this scene
   */
  onExit?(): void;

  /**
   * Handle key press events
   */
  onKeyPressed?(event: KeyEvent): void;

  /**
   * Handle key release events
   */
  onKeyReleased?(event: KeyEvent): void;
}
