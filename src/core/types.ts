import type p5 from "p5";

// =============================================================================
// Core Types
// =============================================================================

export type P5Instance = p5;

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

// =============================================================================
// Animation Types
// =============================================================================

export interface AnimationConfig {
  from: number;
  to: number;
  loop: boolean;
  speed: number;
}

export type AnimationData = number | AnimationConfig;

export interface AnimationSet {
  [key: string]: AnimationData;
}

export interface FramePosition {
  x: number;
  y: number;
}

// =============================================================================
// Entity Types
// =============================================================================

export type Direction = "up" | "down" | "left" | "right";

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
// Pokemon Types
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
// Scene Types
// =============================================================================

export type SceneName = "menu" | "world" | "battle";

export interface SceneTransitionData {
  from?: SceneName;
  to: SceneName;
  data?: Record<string, unknown>;
}

// =============================================================================
// Map Types
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
// Input Types
// =============================================================================

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
  cancel: boolean;
}

export interface KeyEvent {
  key: string;
  keyCode: number;
}
