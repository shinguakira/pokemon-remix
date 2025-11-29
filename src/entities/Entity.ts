import type p5 from "p5";
import type { P5Instance, EntityConfig } from "../core/types";
import type {
  IGameObject,
  ICollidable,
  ICameraAware,
} from "../core/interfaces";
import { generateId } from "../core/utils";

/**
 * Base class for all game entities.
 * Provides common functionality for position, collision, and rendering.
 */
export abstract class Entity implements IGameObject, ICollidable, ICameraAware {
  readonly id: string;

  // Position
  x: number;
  y: number;

  // Screen position (after camera transform)
  screenX: number = 0;
  screenY: number = 0;

  // Collision bounds
  width: number;
  height: number;

  // Reference to p5 instance
  protected p: P5Instance;

  // Loaded state
  protected isLoaded: boolean = false;
  protected isSetup: boolean = false;

  constructor(p: P5Instance, config: EntityConfig) {
    this.p = p;
    this.id = generateId(this.constructor.name);
    this.x = config.x;
    this.y = config.y;
    this.width = config.width ?? 32;
    this.height = config.height ?? 32;
    this.screenX = this.x;
    this.screenY = this.y;
  }

  /**
   * Load assets (sprites, sounds, etc.)
   * Override in subclasses to load specific assets
   */
  load(_p: P5Instance): void | Promise<void> {
    this.isLoaded = true;
  }

  /**
   * Setup entity after loading
   * Override in subclasses for initialization logic
   */
  setup(): void {
    this.isSetup = true;
  }

  /**
   * Update entity state
   * @param deltaTime Time since last frame in milliseconds
   */
  abstract update(deltaTime: number): void;

  /**
   * Draw the entity
   * @param p p5 instance for rendering
   */
  abstract draw(p: P5Instance): void;

  /**
   * Update screen position based on camera
   */
  updateScreenPosition(cameraX: number, cameraY: number): void {
    this.screenX = this.x + cameraX;
    this.screenY = this.y + cameraY;
  }

  /**
   * Check if this entity is visible on screen
   */
  isOnScreen(screenWidth: number, screenHeight: number): boolean {
    return (
      this.screenX + this.width > 0 &&
      this.screenX < screenWidth &&
      this.screenY + this.height > 0 &&
      this.screenY < screenHeight
    );
  }

  /**
   * Get the collision bounds of this entity
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Reset entity to initial state
   */
  reset(): void {
    // Override in subclasses
  }
}
