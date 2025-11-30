import type {
	CameraConfig,
	ICamera,
	IPositionable,
	IUpdatable,
	P5Instance,
} from '../core/interfaces';

/**
 * Camera for following entities and handling viewport transformations.
 * Supports smooth following and optional bounds clamping.
 */
export class Camera implements ICamera, IUpdatable {
	x: number;
	y: number;

	// Target to follow
	private target: IPositionable | null = null;

	// Screen dimensions (for centering)
	private screenWidth: number;
	private screenHeight: number;

	// Smooth following
	private smoothing: number;

	// Optional bounds
	private bounds?: CameraConfig['bounds'];

	constructor(p: P5Instance, config: CameraConfig = {}) {
		this.x = config.x ?? 0;
		this.y = config.y ?? 0;
		this.smoothing = config.smoothing ?? 1; // 1 = instant, lower = smoother
		this.bounds = config.bounds;
		this.screenWidth = p.width;
		this.screenHeight = p.height;
	}

	/**
	 * Attach the camera to follow a target
	 */
	attachTo(target: IPositionable): void {
		this.target = target;
		// Immediately center on target
		this.centerOn(target.x, target.y);
	}

	/**
	 * Detach from current target
	 */
	detach(): void {
		this.target = null;
	}

	/**
	 * Center the camera on a point
	 */
	centerOn(worldX: number, worldY: number): void {
		this.x = this.screenWidth / 2 - worldX;
		this.y = this.screenHeight / 2 - worldY;
		this.clampToBounds();
	}

	/**
	 * Set camera position directly
	 */
	setPosition(x: number, y: number): void {
		this.x = x;
		this.y = y;
		this.clampToBounds();
	}

	/**
	 * Update camera position to follow target
	 */
	update(_deltaTime: number): void {
		if (!this.target) return;

		const targetX = this.screenWidth / 2 - this.target.x;
		const targetY = this.screenHeight / 2 - this.target.y;

		if (this.smoothing >= 1) {
			// Instant following
			this.x = targetX;
			this.y = targetY;
		} else {
			// Smooth following with lerp
			this.x += (targetX - this.x) * this.smoothing;
			this.y += (targetY - this.y) * this.smoothing;
		}

		this.clampToBounds();
	}

	/**
	 * Clamp camera position to bounds if defined
	 */
	private clampToBounds(): void {
		if (!this.bounds) return;

		this.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.x));
		this.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, this.y));
	}

	/**
	 * Set camera bounds
	 */
	setBounds(bounds: CameraConfig['bounds']): void {
		this.bounds = bounds;
		this.clampToBounds();
	}

	/**
	 * Clear camera bounds
	 */
	clearBounds(): void {
		this.bounds = undefined;
	}

	/**
	 * Convert screen coordinates to world coordinates
	 */
	screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
		return {
			x: screenX - this.x,
			y: screenY - this.y,
		};
	}

	/**
	 * Convert world coordinates to screen coordinates
	 */
	worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
		return {
			x: worldX + this.x,
			y: worldY + this.y,
		};
	}

	/**
	 * Check if a point is visible on screen
	 */
	isVisible(worldX: number, worldY: number, width = 0, height = 0): boolean {
		const screen = this.worldToScreen(worldX, worldY);
		return (
			screen.x + width > 0 &&
			screen.x < this.screenWidth &&
			screen.y + height > 0 &&
			screen.y < this.screenHeight
		);
	}

	/**
	 * Reset camera to initial position
	 */
	reset(): void {
		this.x = 0;
		this.y = 0;
		this.target = null;
	}
}
