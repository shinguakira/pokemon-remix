/**
 * Scene interfaces
 */

import type { KeyEvent } from './core';
import type { IDrawable, ILoadable, IResettable, ISetupable, IUpdatable } from './lifecycle';

// =============================================================================
// Scene Types
// =============================================================================

export type SceneName = 'menu' | 'world' | 'battle';

// =============================================================================
// Scene Interfaces
// =============================================================================

/**
 * Interface for game scenes
 */
export interface IScene extends ILoadable, ISetupable, IUpdatable, IDrawable, IResettable {
	readonly name: SceneName;
	onEnter?(data?: Record<string, unknown>): void;
	onExit?(): void;
	onKeyPressed?(event: KeyEvent): void;
	onKeyReleased?(event: KeyEvent): void;
}

/**
 * Interface for scene management
 */
export interface ISceneManager {
	currentScene: SceneName;
	setScene(name: SceneName, data?: Record<string, unknown>): void;
	getScene(name: SceneName): IScene | undefined;
}
