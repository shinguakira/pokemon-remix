import type p5 from 'p5';
import { emitGameEvent } from '../core/GameEvents';
import type { KeyEvent, P5Instance, SceneName } from '../core/interfaces';
import { Scene } from './Scene';

/**
 * Menu scene - the game's title/start screen
 * Uses original title.png and start.png images
 */
export class MenuScene extends Scene {
	readonly name: SceneName = 'menu';

	private titleImage: p5.Image | null = null;
	private startImage: p5.Image | null = null;

	// Blink animation
	private alpha = 255;
	private blinkBack = false;
	private easing = 0.5;

	load(p: P5Instance): void {
		this.titleImage = p.loadImage('/assets/title.png') as unknown as p5.Image;
		this.startImage = p.loadImage('/assets/start.png') as unknown as p5.Image;
		this.isLoaded = true;
	}

	setup(): void {
		this.alpha = 255;
		this.blinkBack = false;
		this.isSetup = true;
	}

	update(deltaTime: number): void {
		// Blink animation for start text
		if (this.alpha <= 0) this.blinkBack = true;
		if (this.alpha >= 255) this.blinkBack = false;

		if (this.blinkBack) {
			this.alpha += 0.7 * this.easing * deltaTime;
		} else {
			this.alpha -= 0.7 * this.easing * deltaTime;
		}
	}

	draw(p: P5Instance): void {
		p.clear();

		// Draw title image
		if (this.titleImage) {
			p.image(this.titleImage, 0, 0);
		}

		// Draw start text with blink
		if (this.startImage) {
			p.tint(255, this.alpha);
			p.image(this.startImage, 0, 320);
			p.noTint();
		}
	}

	reset(): void {
		this.alpha = 255;
		this.blinkBack = false;
	}

	onKeyPressed(event: KeyEvent): void {
		if (event.keyCode === 13) {
			emitGameEvent('scene:transition', { to: 'world' });
		}
	}
}
