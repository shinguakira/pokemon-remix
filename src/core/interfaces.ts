import type { P5Instance, KeyEvent, SceneName } from "./types";

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

// =============================================================================
// Entity Interfaces
// =============================================================================

/**
 * Interface for objects with position
 */
export interface IPositionable {
  x: number;
  y: number;
}

/**
 * Interface for objects with collision bounds
 */
export interface ICollidable extends IPositionable {
  width: number;
  height: number;
}

/**
 * Interface for objects that can move
 */
export interface IMovable extends IPositionable {
  speed: number;
  move(dx: number, dy: number): void;
}

/**
 * Interface for animated objects
 */
export interface IAnimatable {
  currentAnim: string | null;
  setAnimation(name: string): void;
  updateAnimation(deltaTime: number): void;
}

/**
 * Interface for objects that respond to camera
 */
export interface ICameraAware {
  screenX: number;
  screenY: number;
  updateScreenPosition(cameraX: number, cameraY: number): void;
}

// =============================================================================
// Scene Interfaces
// =============================================================================

/**
 * Interface for game scenes
 */
export interface IScene
  extends ILoadable,
    ISetupable,
    IUpdatable,
    IDrawable,
    IResettable {
  readonly name: SceneName;
  onEnter?(data?: Record<string, unknown>): void;
  onExit?(): void;
  onKeyPressed?(event: KeyEvent): void;
  onKeyReleased?(event: KeyEvent): void;
}

/**
 * Interface for scene management
 */
export interface ISceneManager {
  currentScene: SceneName;
  setScene(name: SceneName, data?: Record<string, unknown>): void;
  getScene(name: SceneName): IScene | undefined;
}

// =============================================================================
// Input Interfaces
// =============================================================================

/**
 * Interface for input handling
 */
export interface IInputHandler {
  onKeyPressed(event: KeyEvent): void;
  onKeyReleased(event: KeyEvent): void;
}

// =============================================================================
// Event Interfaces
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
// Camera Interface
// =============================================================================

export interface ICamera {
  x: number;
  y: number;
  attachTo(target: IPositionable): void;
  update(deltaTime: number): void;
}

// =============================================================================
// Dialog Interface
// =============================================================================

export interface IDialog {
  isVisible: boolean;
  isComplete: boolean;
  show(): void;
  hide(): void;
  displayText(content: string, onComplete?: () => void): void;
  displayTextImmediately(content: string): void;
  clearText(): void;
}
