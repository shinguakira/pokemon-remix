/**
 * Game-specific interfaces
 */

import type { IPositionable } from './capabilities';
import type { KeyEvent } from './core';

// =============================================================================
// Game Interfaces
// =============================================================================

/**
 * Interface for input handling
 */
export interface IInputHandler {
	onKeyPressed(event: KeyEvent): void;
	onKeyReleased(event: KeyEvent): void;
}

/**
 * Interface for camera
 */
export interface ICamera {
	x: number;
	y: number;
	attachTo(target: IPositionable): void;
	update(deltaTime: number): void;
}

/**
 * Interface for dialog system
 */
export interface IDialog {
	isVisible: boolean;
	isComplete: boolean;
	show(): void;
	hide(): void;
	displayText(content: string, onComplete?: () => void): void;
	displayTextImmediately(content: string): void;
	clearText(): void;
}
