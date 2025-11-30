import { type IGameContext, gameContext } from '../core/GameContext';
import type { IScene, KeyEvent, P5Instance, SceneName } from '../core/interfaces';

/**
 * Base class for all game scenes.
 * Provides lifecycle methods and common functionality.
 */
export abstract class Scene implements IScene {
	abstract readonly name: SceneName;

	protected p: P5Instance;
	protected isLoaded = false;
	protected isSetup = false;

	/** Shared game context - access player data, NPCs, etc. */
	protected ctx: IGameContext = gameContext;

	constructor(p: P5Instance) {
		this.p = p;
	}

	/**
	 * Load scene assets
	 */
	abstract load(p: P5Instance): void | Promise<void>;

	/**
	 * Setup scene after loading
	 */
	abstract setup(): void;

	/**
	 * Update scene state
	 */
	abstract update(deltaTime: number): void;

	/**
	 * Draw scene
	 */
	abstract draw(p: P5Instance): void;

	/**
	 * Reset scene to initial state
	 */
	abstract reset(): void;

	/**
	 * Called when entering this scene
	 */
	onEnter?(data?: Record<string, unknown>): void;

	/**
	 * Called when leaving this scene
	 */
	onExit?(): void;

	/**
	 * Handle key press events
	 */
	onKeyPressed?(event: KeyEvent): void;

	/**
	 * Handle key release events
	 */
	onKeyReleased?(event: KeyEvent): void;
}
