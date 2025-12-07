/**
 * Core interfaces and type aliases
 */

import type p5 from 'p5';

// =============================================================================
// Type Aliases (unions & aliases that can't be interfaces)
// =============================================================================

export type P5Instance = p5;

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
