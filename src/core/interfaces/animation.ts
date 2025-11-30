/**
 * Animation interfaces
 */

// =============================================================================
// Animation Interfaces
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
