import type p5 from 'p5';
import type { FramePosition, ICollidable, P5Instance, Rectangle } from './interfaces';

// =============================================================================
// Collision Utilities
// =============================================================================

/**
 * Check if two rectangles are colliding using AABB collision detection
 */
export function checkCollision(a: ICollidable, b: ICollidable): boolean {
	return !(
		a.x + a.width < b.x ||
		a.x > b.x + b.width ||
		a.y + a.height < b.y ||
		a.y > b.y + b.height
	);
}

/**
 * Prevent two objects from overlapping by pushing the second object out
 */
export function preventOverlap(static_: ICollidable, dynamic: ICollidable): void {
	const overlapX =
		Math.min(static_.x + static_.width, dynamic.x + dynamic.width) - Math.max(static_.x, dynamic.x);
	const overlapY =
		Math.min(static_.y + static_.height, dynamic.y + dynamic.height) -
		Math.max(static_.y, dynamic.y);

	if (overlapX < overlapY) {
		if (static_.x < dynamic.x) {
			dynamic.x = static_.x + static_.width;
		} else {
			dynamic.x = static_.x - dynamic.width;
		}
	} else {
		if (static_.y < dynamic.y) {
			dynamic.y = static_.y + static_.height;
		} else {
			dynamic.y = static_.y - dynamic.height;
		}
	}
}

/**
 * Get the collision rectangle for an entity
 */
export function getCollisionRect(entity: ICollidable): Rectangle {
	return {
		x: entity.x,
		y: entity.y,
		width: entity.width,
		height: entity.height,
	};
}

// =============================================================================
// Animation Utilities
// =============================================================================

/**
 * Generate frame positions for a sprite sheet
 */
export function getFramePositions(
	cols: number,
	rows: number,
	tileWidth: number,
	tileHeight: number
): FramePosition[] {
	const frames: FramePosition[] = [];

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			frames.push({
				x: col * tileWidth,
				y: row * tileHeight,
			});
		}
	}

	return frames;
}

/**
 * Draw a tile from a sprite sheet
 */
export function drawTile(
	p: P5Instance,
	spriteSheet: p5.Image,
	destX: number,
	destY: number,
	srcX: number,
	srcY: number,
	tileWidth: number,
	tileHeight: number
): void {
	p.image(spriteSheet, destX, destY, tileWidth, tileHeight, srcX, srcY, tileWidth, tileHeight);
}

// =============================================================================
// Input Utilities
// =============================================================================

/**
 * Arrow key codes for convenience
 */
export const ARROW_KEYS = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39,
} as const;

/**
 * Check if only one directional key is pressed (prevents diagonal movement)
 */
export function isOnlyOneDirectionPressed(p: P5Instance): boolean {
	let pressedCount = 0;

	if (p.keyIsDown(ARROW_KEYS.UP)) pressedCount++;
	if (p.keyIsDown(ARROW_KEYS.DOWN)) pressedCount++;
	if (p.keyIsDown(ARROW_KEYS.LEFT)) pressedCount++;
	if (p.keyIsDown(ARROW_KEYS.RIGHT)) pressedCount++;

	return pressedCount === 1;
}

/**
 * Get the currently pressed direction, or null if none/multiple
 */
export function getPressedDirection(p: P5Instance): 'up' | 'down' | 'left' | 'right' | null {
	if (!isOnlyOneDirectionPressed(p)) return null;

	if (p.keyIsDown(ARROW_KEYS.UP)) return 'up';
	if (p.keyIsDown(ARROW_KEYS.DOWN)) return 'down';
	if (p.keyIsDown(ARROW_KEYS.LEFT)) return 'left';
	if (p.keyIsDown(ARROW_KEYS.RIGHT)) return 'right';

	return null;
}

// =============================================================================
// Math Utilities
// =============================================================================

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
	return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// =============================================================================
// Async Utilities
// =============================================================================

/**
 * Wait for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a deferred promise that can be resolved externally
 */
export function createDeferred<T = void>(): {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
} {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve, reject };
}

// =============================================================================
// ID Generation
// =============================================================================

let idCounter = 0;

/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix = 'entity'): string {
	return `${prefix}_${++idCounter}_${Date.now().toString(36)}`;
}
