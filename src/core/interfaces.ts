import type p5 from "p5";

// =============================================================================
// Type Aliases (unions & aliases that can't be interfaces)
// =============================================================================

export type P5Instance = p5;
export type Direction = "up" | "down" | "left" | "right";
export type SceneName = "menu" | "world" | "battle";
export type AnimationData = number | AnimationConfig;
export type EventCallback<T = unknown> = (data: T) => void;

// =============================================================================
// Core Interfaces
// =============================================================================

export interface Vector2D {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Rectangle extends Vector2D, Dimensions {}

export interface Transform extends Vector2D {
  screenX: number;
  screenY: number;
}

export interface KeyEvent {
  key: string;
  keyCode: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
  cancel: boolean;
}

// =============================================================================
// Animation Interfaces
// =============================================================================

export interface AnimationConfig {
  from: number;
  to: number;
  loop: boolean;
  speed: number;
}

export interface AnimationSet {
  [key: string]: AnimationData;
}

export interface FramePosition {
  x: number;
  y: number;
}

// =============================================================================
// Entity Interfaces
// =============================================================================

export interface EntityConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  speed?: number;
}

export interface CharacterConfig extends EntityConfig {
  spriteUrl: string;
  tileWidth?: number;
  tileHeight?: number;
}

// =============================================================================
// Pokemon Interfaces
// =============================================================================

export interface Move {
  name: string;
  power: number;
  type?: string;
  accuracy?: number;
}

export interface PokemonStats {
  maxHp: number;
  attack: number;
  defense: number;
  speed?: number;
  specialAttack?: number;
  specialDefense?: number;
}

export interface PokemonConfig {
  name: string;
  level: number;
  stats: PokemonStats;
  moves: Move[];
  spriteUrl?: string;
}

// =============================================================================
// Map Interfaces
// =============================================================================

export interface SpawnPoint {
  name: string;
  x: number;
  y: number;
}

export interface TiledLayer {
  name: string;
  type: "tilelayer" | "objectgroup";
  data?: number[];
  objects?: TiledObject[];
  width?: number;
  height?: number;
}

export interface TiledObject {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TiledMapData {
  layers: TiledLayer[];
  tilewidth: number;
  tileheight: number;
  width: number;
  height: number;
}

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
