import type { CollidableConfig, ICollidable, P5Instance } from '@game/core/interfaces';
import { checkCollision, preventOverlap } from '@game/core/utils';

/**
 * Invisible collision boundary.
 * Used for map boundaries and other collision zones.
 */
export class Collidable implements ICollidable {
	x: number;
	y: number;
	width: number;
	height: number;

	// Screen position
	screenX: number;
	screenY: number;

	// Debug flag
	private showDebug = false;

	constructor(config: CollidableConfig) {
		this.x = config.x;
		this.y = config.y;
		this.width = config.width;
		this.height = config.height;
		this.screenX = this.x;
		this.screenY = this.y;
	}

	/**
	 * Update screen position based on camera
	 */
	updateScreenPosition(cameraX: number, cameraY: number): void {
		this.screenX = this.x + cameraX;
		this.screenY = this.y + cameraY;
	}

	/**
	 * Check collision with another collidable
	 */
	checkCollisionWith(other: ICollidable): boolean {
		return checkCollision(this, other);
	}

	/**
	 * Prevent another entity from passing through this collidable
	 */
	preventPassthroughFrom(entity: ICollidable): boolean {
		if (checkCollision(this, entity)) {
			preventOverlap(this, entity);
			return true;
		}
		return false;
	}

	/**
	 * Enable debug rendering
	 */
	setDebug(enabled: boolean): void {
		this.showDebug = enabled;
	}

	/**
	 * Draw debug visualization
	 */
	draw(p: P5Instance): void {
		if (!this.showDebug) return;

		p.push();
		p.noFill();
		p.stroke(255, 0, 0, 150);
		p.strokeWeight(2);
		p.rect(this.screenX, this.screenY, this.width, this.height);
		p.pop();
	}
}
