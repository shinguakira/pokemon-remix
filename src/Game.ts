import p5 from "p5";
import type { P5Instance, KeyEvent } from "./core/types";
import { SceneManager, MenuScene, WorldScene, BattleScene } from "./scenes";
import { debugMode } from "./debug/DebugMode";
import { eventBus } from "./core/EventBus";
import { gameState } from "./state/GameState";

// Extend p5 type to include preload
declare module "p5" {
  interface p5InstanceExtensions {
    preload?: () => void;
  }
}

/**
 * Main game class that initializes and runs the game loop.
 * This is the entry point for the game.
 */
export class Game {
  private p: P5Instance | null = null;
  private sceneManager: SceneManager | null = null;
  private font: p5.Font | null = null;

  /**
   * Initialize and start the game
   */
  start(): void {
    new p5((p: P5Instance) => {
      this.p = p;

      (p as unknown as { preload: () => void }).preload = () => this.preload(p);
      p.setup = () => this.setup(p);
      p.draw = () => this.draw(p);
      p.keyPressed = (event?: KeyboardEvent) => {
        if (event) this.keyPressed(event as unknown as KeyEvent);
      };
      p.keyReleased = (event?: KeyboardEvent) => {
        if (event) this.keyReleased(event as unknown as KeyEvent);
      };
    });
  }

  /**
   * Preload assets
   */
  private preload(p: P5Instance): void {
    // Load font (cast to handle async type)
    this.font = p.loadFont("./assets/power-clear.ttf") as unknown as p5.Font;

    // Initialize scene manager
    this.sceneManager = new SceneManager(p, "menu");

    // Create and register scenes
    const menuScene = new MenuScene(p);
    const worldScene = new WorldScene(p);
    const battleScene = new BattleScene(p);

    // Set up scene changers
    const setScene = (
      name: "menu" | "world" | "battle",
      data?: Record<string, unknown>
    ) => {
      this.sceneManager?.setScene(name, data);
    };
    worldScene.setSceneChanger(setScene);
    battleScene.setSceneChanger(setScene);

    // Register scenes
    this.sceneManager.registerScene(menuScene);
    this.sceneManager.registerScene(worldScene);
    this.sceneManager.registerScene(battleScene);

    // Load all scenes
    this.sceneManager.loadAll();

    // SceneManager now handles scene:transition events automatically
    // Enable debug mode for event logging during development
    eventBus.setDebug(false);
  }

  /**
   * Setup game
   */
  private setup(p: P5Instance): void {
    // Create canvas
    const gameCanvas = document.getElementById("game") as HTMLCanvasElement;
    p.createCanvas(512, 384, gameCanvas);

    // Make canvas sharper
    p.pixelDensity(3);

    // Clear default p5 styles on canvas
    gameCanvas.style.cssText = "";

    // Set font
    if (this.font) {
      p.textFont(this.font);
    }

    // Disable smoothing for pixel art
    p.noSmooth();

    // Setup all scenes
    this.sceneManager?.setupAll();
  }

  /**
   * Main draw loop
   */
  private draw(p: P5Instance): void {
    // Update and draw current scene
    this.sceneManager?.update(p.deltaTime);
    this.sceneManager?.draw();

    // Draw debug overlay
    debugMode.drawFpsCounter(p);
  }

  /**
   * Handle key press
   */
  private keyPressed(event: KeyEvent): void {
    // Toggle debug mode with Shift
    if (event.key === "Shift") {
      debugMode.toggle();
      return;
    }

    // Let scenes handle their own input
    // Menu scene handles ENTER key internally

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
