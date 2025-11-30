import { eventBus } from './core/EventBus';
import type { KeyEvent, P5Instance } from './core/interfaces';
import { debugMode } from './debug/DebugMode';
import { BattleScene, MenuScene, SceneManager, WorldScene } from './scenes';
import { SettingsMenuScene } from './scenes/SettingsMenuScene';

// Use global p5 from script
declare const p5: any;

/**
 * Main game class that initializes and runs the game loop.
 * This is the entry point for the game.
 */
export class Game {
	private p: P5Instance | null = null;
	private sceneManager: SceneManager | null = null;
	private settingsMenu: SettingsMenuScene | null = null;
	private worldScene: WorldScene | null = null;
	private font: any = null;

	/**
	 * Initialize and start the game
	 */
	start(): void {
		// Wait for canvas to be available
		const canvas = document.getElementById('game');
		if (!canvas) {
			console.error('Canvas element not found');
			return;
		}

		const sketch = (p: P5Instance) => {
			this.p = p;

			// Skip preload for now - font will be loaded if available
			// (p as unknown as { preload: () => void }).preload = () => {
			//   this.font = p.loadFont("/assets/power-clear.ttf") as unknown as p5.Font;
			// };

			p.setup = () => {
				p.createCanvas(512, 384, canvas as HTMLCanvasElement);
				p.pixelDensity(3);
				(canvas as HTMLCanvasElement).style.cssText = '';
				if (this.font) p.textFont(this.font);
				p.noSmooth();
				this.initScenes(p);
			};

			p.draw = () => {
				if (!this.sceneManager) {
					p.background(0);
					return;
				}
				this.sceneManager.update(p.deltaTime);
				this.sceneManager.draw();

				// Draw settings menu on top
				if (this.settingsMenu) {
					this.settingsMenu.update();
					this.settingsMenu.draw();
				}

				debugMode.drawFpsCounter(p);
			};

			p.keyPressed = (event?: KeyboardEvent) => {
				if (event) this.keyPressed(event as unknown as KeyEvent);
			};

			p.keyReleased = (event?: KeyboardEvent) => {
				if (event) this.keyReleased(event as unknown as KeyEvent);
			};
		};

		new p5(sketch);
	}

	/**
	 * Initialize scenes after p5 is ready
	 */
	private initScenes(p: P5Instance): void {
		try {
			// Initialize scene manager
			this.sceneManager = new SceneManager(p, 'menu');

			// Create menu scene first (simplest)
			const menuScene = new MenuScene(p);
			this.sceneManager.registerScene(menuScene);

			// Load and setup menu
			menuScene.load(p);
			menuScene.setup();

			// Create other scenes after menu works
			const worldScene = new WorldScene(p);
			this.worldScene = worldScene;
			const battleScene = new BattleScene(p);

			// Create settings menu with player freeze callback
			this.settingsMenu = new SettingsMenuScene(p, (freeze: boolean) => {
				if (this.worldScene) {
					this.worldScene.setPlayerFreeze(freeze);
				}
			});

			// Set up scene changers
			const setScene = (name: 'menu' | 'world' | 'battle', data?: Record<string, unknown>) => {
				this.sceneManager?.setScene(name, data);
			};
			worldScene.setSceneChanger(setScene);
			battleScene.setSceneChanger(setScene);

			// Register other scenes
			this.sceneManager.registerScene(worldScene);
			this.sceneManager.registerScene(battleScene);

			// Load other scenes (async)
			worldScene.load(p);
			battleScene.load(p);
			worldScene.setup();
			battleScene.setup();

			eventBus.setDebug(false);
		} catch (e) {
			console.error('Error initializing scenes:', e);
		}
	}

	/**
	 * Handle key press
	 */
	private keyPressed(event: KeyEvent): void {
		// Toggle debug mode with Shift
		if (event.key === 'Shift') {
			debugMode.toggle();
			return;
		}

		// ESC to toggle settings menu (only in world scene)
		if (event.keyCode === 27 && this.sceneManager?.currentScene === 'world') {
			this.settingsMenu?.toggle();
			return;
		}

		// If settings menu is open, only handle menu input
		if (this.settingsMenu?.isOpen) {
			this.settingsMenu.onKeyPressed(event);
			return;
		}

		// Forward to current scene
		this.sceneManager?.onKeyPressed(event);
	}

	/**
	 * Handle key release
	 */
	private keyReleased(event: KeyEvent): void {
		this.sceneManager?.onKeyReleased(event);
	}
}

/**
 * Create and start the game
 */
export function createGame(): Game {
	const game = new Game();
	game.start();
	return game;
}
