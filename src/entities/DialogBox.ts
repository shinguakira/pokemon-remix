import type p5 from "p5";
import type { P5Instance } from "../core/types";
import type {
  IDialog,
  ILoadable,
  IUpdatable,
  IDrawable,
} from "../core/interfaces";
import { gameEvents } from "../core/EventEmitter";

/**
 * Configuration for dialog box
 */
export interface DialogBoxConfig {
  x: number;
  y: number;
  spriteUrl?: string;
  textSpeed?: number;
  textSize?: number;
  textColor?: string;
  textOffsetX?: number;
  textOffsetY?: number;
}

/**
 * Dialog box for displaying text messages.
 * Supports typewriter effect and completion callbacks.
 */
export class DialogBox implements IDialog, ILoadable, IUpdatable, IDrawable {
  // Position
  private x: number;
  private y: number;

  // Sprite
  private spriteRef: p5.Image | null = null;
  private spriteUrl: string;

  // Text state
  private fullText: string = "";
  private displayedText: string = "";
  private charQueue: string[] = [];

  // Timing
  private textSpeed: number; // characters per second
  private timer: number = 0;

  // Style
  private textSize: number;
  private textColor: string;
  private textOffsetX: number;
  private textOffsetY: number;

  // State
  isVisible: boolean = false;
  isComplete: boolean = false;

  // Callback
  private onCompleteCallback: (() => void) | null = null;

  constructor(config: DialogBoxConfig) {
    this.x = config.x;
    this.y = config.y;
    this.spriteUrl = config.spriteUrl ?? "assets/overlay_message.png";
    this.textSpeed = config.textSpeed ?? 60; // 60 chars per second
    this.textSize = config.textSize ?? 24;
    this.textColor = config.textColor ?? "black";
    this.textOffsetX = config.textOffsetX ?? 30;
    this.textOffsetY = config.textOffsetY ?? 42;
  }

  /**
   * Load the dialog box sprite
   */
  load(p: P5Instance): void {
    // Cast to handle p5's async type definition
    this.spriteRef = p.loadImage(this.spriteUrl) as unknown as p5.Image;
  }

  /**
   * Show the dialog box
   */
  show(): void {
    this.isVisible = true;
    gameEvents.emit("dialog:show", { text: this.fullText });
  }

  /**
   * Hide the dialog box
   */
  hide(): void {
    this.isVisible = false;
    gameEvents.emit("dialog:hide", undefined);
  }

  /**
   * Set visibility directly
   */
  setVisibility(visible: boolean): void {
    this.isVisible = visible;
    if (visible) {
      gameEvents.emit("dialog:show", { text: this.fullText });
    } else {
      gameEvents.emit("dialog:hide", undefined);
    }
  }

  /**
   * Display text with typewriter effect
   */
  displayText(content: string, onComplete?: () => void): void {
    this.fullText = content;
    this.displayedText = "";
    this.charQueue = content.split("");
    this.isComplete = false;
    this.timer = 0;
    this.onCompleteCallback = onComplete ?? null;
  }

  /**
   * Display text immediately without typewriter effect
   */
  displayTextImmediately(content: string): void {
    this.fullText = content;
    this.displayedText = content;
    this.charQueue = [];
    this.isComplete = true;
  }

  /**
   * Clear all text
   */
  clearText(): void {
    this.fullText = "";
    this.displayedText = "";
    this.charQueue = [];
    this.isComplete = false;
    this.onCompleteCallback = null;
  }

  /**
   * Skip to end of current text
   */
  skipToEnd(): void {
    if (!this.isComplete && this.charQueue.length > 0) {
      this.displayedText = this.fullText;
      this.charQueue = [];
      this.completeText();
    }
  }

  /**
   * Update typewriter effect
   */
  update(deltaTime: number): void {
    if (!this.isVisible || this.isComplete) return;

    this.timer += deltaTime;
    const msPerChar = 1000 / this.textSpeed;

    while (this.timer >= msPerChar && this.charQueue.length > 0) {
      const nextChar = this.charQueue.shift();
      if (nextChar) {
        this.displayedText += nextChar;
      }
      this.timer -= msPerChar;
    }

    // Check if text is complete
    if (this.charQueue.length === 0 && !this.isComplete) {
      this.completeText();
    }
  }

  /**
   * Handle text completion
   */
  private completeText(): void {
    this.isComplete = true;
    gameEvents.emit("dialog:complete", undefined);

    if (this.onCompleteCallback) {
      const callback = this.onCompleteCallback;
      this.onCompleteCallback = null; // Prevent re-triggering
      callback();
    }
  }

  /**
   * Draw the dialog box
   */
  draw(p: P5Instance): void {
    if (!this.isVisible || !this.spriteRef) return;

    // Draw background
    p.image(this.spriteRef, this.x, this.y);

    // Draw text
    p.push();
    p.fill(this.textColor);
    p.textSize(this.textSize);
    p.text(
      this.displayedText,
      this.x + this.textOffsetX,
      this.y + this.textOffsetY
    );
    p.pop();
  }

  /**
   * Get current displayed text
   */
  getDisplayedText(): string {
    return this.displayedText;
  }

  /**
   * Check if there's more text to display
   */
  hasMoreText(): boolean {
    return this.charQueue.length > 0;
  }

  /**
   * Reset dialog box
   */
  reset(): void {
    this.clearText();
    this.hide();
  }
}
