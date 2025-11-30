/**
 * Entity interfaces
 */

// =============================================================================
// Entity Interfaces
// =============================================================================

export type Direction = 'up' | 'down' | 'left' | 'right';

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
