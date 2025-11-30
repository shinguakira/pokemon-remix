/**
 * Capability interfaces for entity features
 */

// =============================================================================
// Capability Interfaces
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
