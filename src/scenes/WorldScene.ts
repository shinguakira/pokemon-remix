import type { P5Instance, SceneName, KeyEvent } from "../core/types";
import { Scene } from "./Scene";
import { Player, NPC, Camera, DialogBox, TiledMap } from "../entities";
import { checkCollision, preventOverlap } from "../core/utils";
import { emitGameEvent, onGameEvent, offGameEvent } from "../core/EventEmitter";

/**
 * World scene - the main overworld exploration scene
 */
export class WorldScene extends Scene {
  readonly name: SceneName = "world";

  // Entities
  private player: Player;
  private npc: NPC;
  private camera: Camera;
  private map: TiledMap;
  private dialogBox: DialogBox;

  // State
  private isInDialogue: boolean = false;
  private isNpcDefeated: boolean = false;

  // Screen flash effect
  private isFlashing: boolean = false;
  private flashAlpha: number = 0;
  private flashDirection: number = 1;
  private flashSpeed: number = 0.7;

  // Scene changer callback
  private setScene:
    | ((name: SceneName, data?: Record<string, unknown>) => void)
    | null = null;

  constructor(p: P5Instance) {
    super(p);

    // Initialize entities
    this.camera = new Camera(p, { x: 100, y: 0 });
    this.player = new Player(p, {
      x: 0,
      y: 0,
      spriteUrl: "assets/boy_run.png",
    });
    this.npc = new NPC(p, {
      x: 0,
      y: 0,
      spriteUrl: "assets/trainer_GENTLEMAN.png",
      npcId: "gentleman",
    });
    this.map = new TiledMap({ x: 100, y: -150 });
    this.dialogBox = new DialogBox({ x: 0, y: 280 });
  }

  /**
   * Set the scene change callback
   */
  setSceneChanger(
    changer: (name: SceneName, data?: Record<string, unknown>) => void
  ): void {
    this.setScene = changer;
  }

  /**
   * Set NPC defeated state (called from battle scene via events)
   */
  setNpcDefeated(defeated: boolean): void {
    this.isNpcDefeated = defeated;
    this.npc.setDefeated(defeated);
  }

  load(p: P5Instance): void {
    this.player.load(p);
    this.npc.load(p);
    this.dialogBox.load(p);
    this.map.load(p, "assets/Trainer Tower interior.png", "maps/world.json");
    this.isLoaded = true;
  }

  setup(): void {
    // Setup player
    this.player.setup();

    // Get spawn points from map
    const playerSpawn = this.map.getSpawnPosition("player");
    const npcSpawn = this.map.getSpawnPosition("npc");

    if (playerSpawn) {
      this.player.x = playerSpawn.x;
      this.player.y = playerSpawn.y;
    }

    if (npcSpawn) {
      this.npc.x = npcSpawn.x;
      this.npc.y = npcSpawn.y;
    }

    // Setup NPC
    this.npc.setup();

    // Attach camera to player
    this.camera.attachTo(this.player);

    // Listen for battle end events
    this.setupEventListeners();

    this.isSetup = true;
  }

  private setupEventListeners(): void {
    onGameEvent("battle:end", (data) => {
      if (data.winner === "player") {
        this.setNpcDefeated(true);
      }
    });
  }

  update(deltaTime: number): void {
    // Update camera
    this.camera.update(deltaTime);

    // Update player (handles input)
    this.player.update(deltaTime);

    // Update NPC
    this.npc.update(deltaTime);

    // Update screen positions
    this.player.updateScreenPosition(this.camera.x, this.camera.y);
    this.npc.updateScreenPosition(this.camera.x, this.camera.y);

    // Update dialog
    this.dialogBox.update(deltaTime);

    // Handle collision with NPC
    this.handleNpcCollision();

    // Handle map boundaries
    this.map.handleCollisions(this.player);

    // Update flash effect
    this.updateFlashEffect(deltaTime);
  }

  private handleNpcCollision(): void {
    // Skip if player is already frozen in dialogue
    if (this.player.isFrozen() && this.isInDialogue) return;

    if (checkCollision(this.npc, this.player)) {
      preventOverlap(this.npc, this.player);

      if (!this.isNpcDefeated) {
        this.player.setFreeze(true);
        this.isInDialogue = true;
        this.dialogBox.show();
        this.dialogBox.displayText(
          "I see that you need training.\nLet's battle!",
          async () => {
            await this.startBattleTransition();
          }
        );
      } else {
        this.dialogBox.show();
        this.dialogBox.displayTextImmediately("You already defeated me...");
      }
    }
  }

  private async startBattleTransition(): Promise<void> {
    // Wait a moment before flash
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.dialogBox.hide();
    this.isFlashing = true;

    // Wait for flash effect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.isFlashing = false;

    // Change to battle scene
    if (this.setScene) {
      this.setScene("battle", { npcId: this.npc.npcId });
    } else {
      emitGameEvent("scene:change", {
        to: "battle",
        data: { npcId: this.npc.npcId },
      });
    }
  }

  private updateFlashEffect(deltaTime: number): void {
    if (!this.isFlashing) return;

    if (this.flashAlpha <= 0) this.flashDirection = 1;
    if (this.flashAlpha >= 255) this.flashDirection = -1;

    this.flashAlpha += this.flashDirection * this.flashSpeed * 3 * deltaTime;
    this.flashAlpha = Math.max(0, Math.min(255, this.flashAlpha));
  }

  draw(p: P5Instance): void {
    p.clear();
    p.background(0);

    // Draw map
    this.map.draw(p, this.camera);

    // Draw NPC
    this.npc.draw(p);

    // Draw player
    this.player.draw(p);

    // Draw dialog box
    this.dialogBox.draw(p);

    // Draw flash effect
    if (this.isFlashing) {
      p.push();
      p.fill(0, 0, 0, this.flashAlpha);
      p.noStroke();
      p.rect(0, 0, p.width, p.height);
      p.pop();
    }
  }

  reset(): void {
    this.player.setFreeze(false);
    this.dialogBox.reset();
    this.isInDialogue = false;
    this.isFlashing = false;
    this.flashAlpha = 0;
  }

  onEnter(data?: Record<string, unknown>): void {
    // Reset dialogue state when entering
    this.reset();
  }

  onKeyPressed(event: KeyEvent): void {
    // ENTER keyCode is 13
    if (this.isInDialogue && event.keyCode === 13) {
      this.dialogBox.hide();
      this.isInDialogue = false;
      this.player.setFreeze(false);
    }
  }

  onKeyReleased(_event: KeyEvent): void {
    this.player.handleKeyRelease();
  }
}
