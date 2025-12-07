/**
 * Configuration interfaces for entities
 */

import type { CharacterConfig } from './entity';

// =============================================================================
// Entity Config Interfaces
// =============================================================================

export interface AnimatedEntityConfig extends CharacterConfig {
	cols?: number;
	rows?: number;
}

export interface CharacterEntityConfig extends AnimatedEntityConfig {
	speed?: number;
}

export interface CameraConfig {
	x?: number;
	y?: number;
	smoothing?: number;
	bounds?: {
		minX: number;
		maxX: number;
		minY: number;
		maxY: number;
	};
}

export interface CollidableConfig {
	x: number;
	y: number;
	width: number;
	height: number;
}

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

export interface TiledMapConfig {
	x: number;
	y: number;
	tileWidth?: number;
	tileHeight?: number;
}
