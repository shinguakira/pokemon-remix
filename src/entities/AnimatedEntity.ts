import type p5 from "p5";
import type {
  P5Instance,
  AnimationSet,
  AnimationData,
  FramePosition,
  Direction,
  IAnimatable,
  AnimatedEntityConfig,
} from "../core/interfaces";
import { Entity } from "./Entity";
import { getFramePositions, drawTile } from "../core/utils";

/**
 * Base class for entities with sprite animations.
 * Handles animation state, frame cycling, and sprite rendering.
 */
export abstract class AnimatedEntity extends Entity implements IAnimatable {
  // Sprite
  protected spriteRef: p5.Image | null = null;
  protected spriteUrl: string;

  // Sprite dimensions
  protected tileWidth: number;
  protected tileHeight: number;

  // Sprite offset for drawing
  protected spriteOffsetX: number = 0;
  protected spriteOffsetY: number = -15;

  // Animation state
  currentAnim: string | null = null;
  protected animations: AnimationSet = {};
  protected frames: FramePosition[] = [];
  protected currentFrame: number = 0;
  protected currentFrameData: FramePosition | null = null;

  // Animation timing
  protected animationTimer: number = 0;

  // Direction
  protected direction: Direction = "down";

  // Sprite sheet layout
  protected cols: number;
  protected rows: number;

  constructor(p: P5Instance, config: AnimatedEntityConfig) {
    super(p, config);
    this.spriteUrl = config.spriteUrl;
    this.tileWidth = config.tileWidth ?? 32;
    this.tileHeight = config.tileHeight ?? 48;
    this.cols = config.cols ?? 4;
    this.rows = config.rows ?? 4;
  }

  /**
   * Load the sprite image
   */
  load(p: P5Instance): void {
    // Cast to handle p5's async type definition
    this.spriteRef = p.loadImage(this.spriteUrl) as unknown as p5.Image;
    super.load(p);
  }

  /**
   * Setup animations after loading
   */
  setup(): void {
    this.frames = getFramePositions(
      this.cols,
      this.rows,
      this.tileWidth,
      this.tileHeight
    );
    this.defineAnimations();
    super.setup();
  }

  /**
   * Define available animations
   * Override in subclasses to define specific animations
   */
  protected abstract defineAnimations(): void;

  /**
   * Set the current animation
   */
  setAnimation(name: string): void {
    if (this.currentAnim !== name && this.animations[name] !== undefined) {
      this.currentAnim = name;
      this.currentFrame = 0;
      this.animationTimer = 0;
    }
  }

  /**
   * Set the direction the entity is facing
   */
  setDirection(direction: Direction): void {
    if (this.direction !== direction) {
      this.direction = direction;
    }
  }

  /**
   * Get the current direction
   */
  getDirection(): Direction {
    return this.direction;
  }

  /**
   * Update animation frame based on time
   */
  updateAnimation(deltaTime: number): void {
    if (!this.currentAnim) return;

    const animData = this.animations[this.currentAnim];
    this.currentFrameData = this.computeFrame(animData, deltaTime);
  }

  /**
   * Compute the current frame based on animation data
   */
  protected computeFrame(
    animData: AnimationData,
    deltaTime: number
  ): FramePosition {
    // Static frame (just a number)
    if (typeof animData === "number") {
      this.currentFrame = animData;
      return this.frames[this.currentFrame];
    }

    // Animated sequence
    const { from, to, loop, speed } = animData;

    // Initialize to start frame
    if (this.currentFrame < from || this.currentFrame > to) {
      this.currentFrame = from;
    }

    // Loop back to start
    if (this.currentFrame > to && loop) {
      this.currentFrame = from;
    }

    const currentFrameData = this.frames[this.currentFrame];
    const durationPerFrame = 1000 / speed;

    // Advance animation timer
    this.animationTimer += deltaTime;

    if (this.animationTimer >= durationPerFrame) {
      this.currentFrame++;
      this.animationTimer -= durationPerFrame;
    }

    return currentFrameData;
  }

  /**
   * Update entity state
   */
  update(deltaTime: number): void {
    this.updateAnimation(deltaTime);
  }

  /**
   * Draw the animated sprite
   */
  draw(p: P5Instance): void {
    if (!this.spriteRef || !this.currentFrameData) return;

    p.push();

    // Handle horizontal flip for right-facing sprites
    if (this.direction === "right") {
      p.scale(-1, 1);
      p.translate(-2 * this.screenX - this.tileWidth, 0);
    }

    drawTile(
      p,
      this.spriteRef,
      this.screenX + this.spriteOffsetX,
      this.screenY + this.spriteOffsetY,
      this.currentFrameData.x,
      this.currentFrameData.y,
      this.tileWidth,
      this.tileHeight
    );

    p.pop();
  }

  /**
   * Draw debug hitbox
   */
  drawDebugHitbox(p: P5Instance): void {
    p.push();
    p.noFill();
    p.stroke(255, 0, 0);
    p.strokeWeight(1);
    p.rect(this.screenX, this.screenY, this.width, this.height);
    p.pop();
  }
}
