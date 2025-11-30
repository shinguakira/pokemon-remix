import type {
  P5Instance,
  SceneName,
  KeyEvent,
  IScene,
  ISceneManager,
} from "../core/interfaces";
import { eventBus } from "../core/EventBus";
import { emitGameEvent, onGameEvent } from "../core/GameEvents";
import { gameState } from "../state/GameState";

/**
 * Manages game scenes and transitions between them.
 * Provides centralized scene lifecycle management.
 */
export class SceneManager implements ISceneManager {
  private scenes: Map<SceneName, IScene> = new Map();
  private _currentScene: SceneName;
  private p: P5Instance;

  constructor(p: P5Instance, initialScene: SceneName = "menu") {
    this.p = p;
    this._currentScene = initialScene;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for scene transitions
   */
  private setupEventListeners(): void {
    onGameEvent("scene:transition", (data) => {
      this.setScene(data.to, data.context);
    });
  }

  /**
   * Get current scene name
   */
  get currentScene(): SceneName {
    return this._currentScene;
  }

  /**
   * Register a scene
   */
  registerScene(scene: IScene): void {
    this.scenes.set(scene.name, scene);
  }

  /**
   * Get a scene by name
   */
  getScene(name: SceneName): IScene | undefined {
    return this.scenes.get(name);
  }

  /**
   * Get the current active scene
   */
  getCurrentScene(): IScene | undefined {
    return this.scenes.get(this._currentScene);
  }

  /**
   * Transition to a new scene
   */
  setScene(name: SceneName, data?: Record<string, unknown>): void {
    const previousScene = this._currentScene;
    const currentSceneObj = this.scenes.get(previousScene);
    const nextSceneObj = this.scenes.get(name);

    if (!nextSceneObj) {
      console.error(`Scene "${name}" not found`);
      return;
    }

    // Exit current scene
    if (currentSceneObj?.onExit) {
      currentSceneObj.onExit();
    }

    // Update current scene
    this._currentScene = name;

    // Enter new scene
    if (nextSceneObj.onEnter) {
      nextSceneObj.onEnter(data);
    }

    // Reset the new scene if coming from a different scene
    if (previousScene !== name) {
      nextSceneObj.reset();
      nextSceneObj.setup();
    }

    // Emit scene change event
    emitGameEvent("scene:changed", {
      from: previousScene,
      to: name,
    });

    console.log(`Scene changed: ${previousScene} -> ${name}`);
  }

  /**
   * Load all registered scenes
   */
  async loadAll(): Promise<void> {
    const loadPromises: Promise<void>[] = [];

    for (const scene of this.scenes.values()) {
      const result = scene.load(this.p);
      if (result instanceof Promise) {
        loadPromises.push(result);
      }
    }

    await Promise.all(loadPromises);
  }

  /**
   * Setup all registered scenes
   */
  setupAll(): void {
    for (const scene of this.scenes.values()) {
      scene.setup();
    }
  }

  /**
   * Update the current scene
   */
  update(deltaTime: number): void {
    const scene = this.getCurrentScene();
    scene?.update(deltaTime);
  }

  /**
   * Draw the current scene
   */
  draw(): void {
    const scene = this.getCurrentScene();
    scene?.draw(this.p);
  }

  /**
   * Forward key press to current scene
   */
  onKeyPressed(event: KeyEvent): void {
    const scene = this.getCurrentScene();
    scene?.onKeyPressed?.(event);
  }

  /**
   * Forward key release to current scene
   */
  onKeyReleased(event: KeyEvent): void {
    const scene = this.getCurrentScene();
    scene?.onKeyReleased?.(event);
  }
}

/**
 * Create a function that can be used to change scenes
 * Useful for passing to scenes without exposing the full manager
 */
export function createSceneChanger(manager: SceneManager) {
  return (name: SceneName, data?: Record<string, unknown>) => {
    manager.setScene(name, data);
  };
}
