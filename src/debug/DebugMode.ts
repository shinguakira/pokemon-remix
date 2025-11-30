import type { ICollidable, P5Instance } from '../core/interfaces';

/**
 * Debug mode singleton for development features.
 * Toggle with Shift key.
 */
class DebugModeClass {
	private enabled = false;
	private fpsHistory: number[] = [];
	private maxFpsHistory = 60;

	/**
	 * Toggle debug mode
	 */
	toggle(): void {
		this.enabled = !this.enabled;
		console.log(`Debug mode: ${this.enabled ? 'ON' : 'OFF'}`);
	}

	/**
	 * Check if debug mode is enabled
	 */
	isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * Enable debug mode
	 */
	enable(): void {
		this.enabled = true;
	}

	/**
	 * Disable debug mode
	 */
	disable(): void {
		this.enabled = false;
	}

	/**
	 * Draw FPS counter
	 */
	drawFpsCounter(p: P5Instance): void {
		if (!this.enabled) return;

		// Update FPS history
		this.fpsHistory.push(p.frameRate());
		if (this.fpsHistory.length > this.maxFpsHistory) {
			this.fpsHistory.shift();
		}

		// Calculate average FPS
		const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

		// Draw FPS
		p.push();
		p.fill(255);
		p.noStroke();
		p.textSize(12);
		p.textAlign(p.LEFT, p.TOP);
		p.text(`FPS: ${Math.round(avgFps)}`, 10, 10);
		p.pop();
	}

	/**
	 * Draw hitbox for an entity
	 */
	drawHitbox(p: P5Instance, entity: ICollidable & { screenX?: number; screenY?: number }): void {
		if (!this.enabled) return;

		const x = entity.screenX ?? entity.x;
		const y = entity.screenY ?? entity.y;

		p.push();
		p.noFill();
		p.stroke(255, 0, 0);
		p.strokeWeight(1);
		p.rect(x, y, entity.width, entity.height);
		p.pop();
	}

	/**
	 * Log a debug message
	 */
	log(...args: unknown[]): void {
		if (!this.enabled) return;
		console.log('[DEBUG]', ...args);
	}
}

// Export singleton instance
export const debugMode = new DebugModeClass();
