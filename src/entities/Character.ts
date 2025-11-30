import type {
  P5Instance,
  Direction,
  IMovable,
  CharacterEntityConfig,
} from "../core/interfaces";
import { AnimatedEntity } from "./AnimatedEntity";
import { isOnlyOneDirectionPressed, ARROW_KEYS } from "../core/utils";

/**
 * Base class for movable characters (player, NPCs, etc.)
 * Handles movement, collision response, and character-specific animations.
 */
export abstract class Character extends AnimatedEntity implements IMovable {
  speed: number;

  // Movement state
  protected isMoving: boolean = false;
  protected freeze: boolean = false;

  // Initial position for reset
  protected initialX: number;
  protected initialY: number;

  constructor(p: P5Instance, config: CharacterEntityConfig) {
    super(p, config);
    this.speed = config.speed ?? 200;
    this.initialX = config.x;
    this.initialY = config.y;
  }

  /**
   * Move the character by a delta
   */
  move(dx: number, dy: number): void {
    if (this.freeze) return;

    this.x += dx;
    this.y += dy;
    this.isMoving = dx !== 0 || dy !== 0;
  }

  /**
   * Move in a specific direction
   */
  moveInDirection(direction: Direction, deltaTime: number): void {
    if (this.freeze) return;

    const moveBy = (this.speed / 1000) * deltaTime;

    switch (direction) {
      case "up":
        this.y -= moveBy;
        break;
      case "down":
        this.y += moveBy;
        break;
      case "left":
        this.x -= moveBy;
        break;
      case "right":
        this.x += moveBy;
        break;
    }

    this.setDirection(direction);
    this.isMoving = true;
  }

  /**
   * Freeze the character (prevent movement)
   */
  setFreeze(frozen: boolean): void {
    this.freeze = frozen;
  }

  /**
   * Check if character is frozen
   */
  isFrozen(): boolean {
    return this.freeze;
  }

  /**
   * Stop movement and set idle animation
   */
  stopMoving(): void {
    this.isMoving = false;
    this.setIdleAnimation();
  }

  /**
   * Set the appropriate idle animation based on current direction
   */
  protected setIdleAnimation(): void {
    switch (this.direction) {
      case "up":
        this.setAnimation("idle-up");
        break;
      case "down":
        this.setAnimation("idle-down");
        break;
      case "left":
      case "right":
        this.setAnimation("idle-side");
        break;
    }
  }

  /**
   * Set the appropriate run animation based on current direction
   */
  protected setRunAnimation(): void {
    switch (this.direction) {
      case "up":
        this.setAnimation("run-up");
        break;
      case "down":
        this.setAnimation("run-down");
        break;
      case "left":
      case "right":
        this.setAnimation("run-side");
        break;
    }
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.x = this.initialX;
    this.y = this.initialY;
    this.freeze = false;
    this.isMoving = false;
    this.direction = "down";
    this.setIdleAnimation();
  }
}

/**
 * Player character with keyboard input handling
 */
export class Player extends Character {
  constructor(p: P5Instance, config: CharacterEntityConfig) {
    super(p, {
      ...config,
      spriteUrl: config.spriteUrl ?? "/assets/boy_run.png",
      speed: config.speed ?? 200,
    });
  }

  protected defineAnimations(): void {
    this.animations = {
      "idle-down": 0,
      "idle-side": 6,
      "idle-up": 12,
      "run-down": { from: 0, to: 3, loop: true, speed: 8 },
      "run-side": { from: 4, to: 7, loop: true, speed: 8 },
      "run-up": { from: 12, to: 15, loop: true, speed: 8 },
    };
    this.setAnimation("idle-down");
  }

  /**
   * Handle keyboard input for movement
   */
  handleInput(deltaTime: number): void {
    if (this.freeze || !isOnlyOneDirectionPressed(this.p)) {
      return;
    }

    const moveBy = (this.speed / 1000) * deltaTime;

    if (this.p.keyIsDown(ARROW_KEYS.RIGHT)) {
      this.setDirection("right");
      this.setAnimation("run-side");
      this.x += moveBy;
      this.isMoving = true;
    } else if (this.p.keyIsDown(ARROW_KEYS.LEFT)) {
      this.setDirection("left");
      this.setAnimation("run-side");
      this.x -= moveBy;
      this.isMoving = true;
    } else if (this.p.keyIsDown(ARROW_KEYS.UP)) {
      this.setDirection("up");
      this.setAnimation("run-up");
      this.y -= moveBy;
      this.isMoving = true;
    } else if (this.p.keyIsDown(ARROW_KEYS.DOWN)) {
      this.setDirection("down");
      this.setAnimation("run-down");
      this.y += moveBy;
      this.isMoving = true;
    }
  }

  /**
   * Handle key release - set idle animation
   */
  handleKeyRelease(): void {
    // Check if any arrow key is still pressed
    const anyKeyPressed =
      this.p.keyIsDown(ARROW_KEYS.UP) ||
      this.p.keyIsDown(ARROW_KEYS.DOWN) ||
      this.p.keyIsDown(ARROW_KEYS.LEFT) ||
      this.p.keyIsDown(ARROW_KEYS.RIGHT);

    if (!anyKeyPressed) {
      this.stopMoving();
    }
  }

  update(deltaTime: number): void {
    this.handleInput(deltaTime);
    super.update(deltaTime);
  }
}

/**
 * Non-player character
 */
export class NPC extends Character {
  readonly npcId: string;
  protected isDefeated: boolean = false;

  constructor(
    p: P5Instance,
    config: CharacterEntityConfig & { npcId?: string }
  ) {
    super(p, {
      ...config,
      spriteUrl: config.spriteUrl ?? "/assets/trainer_GENTLEMAN.png",
      speed: config.speed ?? 0,
    });
    this.npcId = config.npcId ?? this.id;
  }

  protected defineAnimations(): void {
    this.animations = {
      "idle-down": 0,
      "idle-side": 4,
      "idle-up": 8,
    };
    this.setAnimation("idle-down");
  }

  /**
   * Mark NPC as defeated
   */
  setDefeated(defeated: boolean): void {
    this.isDefeated = defeated;
  }

  /**
   * Check if NPC has been defeated
   */
  getIsDefeated(): boolean {
    return this.isDefeated;
  }

  update(deltaTime: number): void {
    super.update(deltaTime);
  }

  reset(): void {
    super.reset();
    // Note: isDefeated is intentionally NOT reset as it's persistent game state
  }
}
