# Pokemon Remix - Scene System

## Overview

Scenes are distinct game states (menu, world, battle). The SceneManager handles transitions and lifecycle.

---

## Scene Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                     SCENE LIFECYCLE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐                                              │
│   │  load()  │  Load assets (images, sounds, data)          │
│   └────┬─────┘                                              │
│        │                                                    │
│        ▼                                                    │
│   ┌──────────┐                                              │
│   │  setup() │  Initialize entities, state                  │
│   └────┬─────┘                                              │
│        │                                                    │
│        ▼                                                    │
│   ┌──────────┐                                              │
│   │ onEnter()│  Called when transitioning TO this scene    │
│   └────┬─────┘  Receives context from previous scene        │
│        │                                                    │
│        ▼                                                    │
│   ┌─────────────────────────────────┐                       │
│   │         GAME LOOP               │                       │
│   │  ┌────────────┐ ┌────────────┐  │                       │
│   │  │  update()  │ │   draw()   │  │  Every frame          │
│   │  │  (logic)   │ │ (render)   │  │                       │
│   │  └────────────┘ └────────────┘  │                       │
│   └─────────────────────────────────┘                       │
│        │                                                    │
│        ▼                                                    │
│   ┌──────────┐                                              │
│   │ onExit() │  Called when transitioning AWAY              │
│   └────┬─────┘  Cleanup, save state                         │
│        │                                                    │
│        ▼                                                    │
│   ┌──────────┐                                              │
│   │ cleanup()│  Unload resources if needed                  │
│   └──────────┘                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Scene Interface

```typescript
interface IScene {
  readonly name: SceneName;

  // Lifecycle
  load(p: P5Instance): Promise<void> | void;
  setup(): void;
  cleanup(): void;

  // Game loop
  update(deltaTime: number): void;
  draw(p: P5Instance): void;

  // Transitions
  onEnter(context?: SceneContext): void;
  onExit(): void;

  // Input
  onKeyPressed?(event: KeyEvent): void;
  onKeyReleased?(event: KeyEvent): void;
}

type SceneName = "menu" | "world" | "battle";

interface SceneContext {
  [key: string]: unknown;
}
```

---

## Scene Manager

```typescript
class SceneManager {
  private scenes: Map<SceneName, IScene> = new Map();
  private currentScene: SceneName = "menu";
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for transition requests
    this.eventBus.on("scene:transition", (data) => {
      this.transition(data.to, data.context);
    });
  }

  registerScene(scene: IScene): void {
    this.scenes.set(scene.name, scene);
  }

  async loadAll(p: P5Instance): Promise<void> {
    for (const scene of this.scenes.values()) {
      await scene.load(p);
    }
  }

  setupAll(): void {
    for (const scene of this.scenes.values()) {
      scene.setup();
    }
  }

  transition(to: SceneName, context?: SceneContext): void {
    const fromScene = this.scenes.get(this.currentScene);
    const toScene = this.scenes.get(to);

    if (!toScene) {
      console.error(`Scene "${to}" not found`);
      return;
    }

    // Exit current scene
    fromScene?.onExit();

    // Update current
    const previousScene = this.currentScene;
    this.currentScene = to;

    // Enter new scene
    toScene.onEnter(context);

    // Emit event
    this.eventBus.emit("scene:changed", {
      from: previousScene,
      to: to,
      context,
    });
  }

  update(deltaTime: number): void {
    this.scenes.get(this.currentScene)?.update(deltaTime);
  }

  draw(p: P5Instance): void {
    this.scenes.get(this.currentScene)?.draw(p);
  }

  onKeyPressed(event: KeyEvent): void {
    this.scenes.get(this.currentScene)?.onKeyPressed?.(event);
  }

  onKeyReleased(event: KeyEvent): void {
    this.scenes.get(this.currentScene)?.onKeyReleased?.(event);
  }
}
```

---

## Scene Implementations

### MenuScene

```typescript
class MenuScene implements IScene {
  readonly name: SceneName = "menu";

  private titleImage: p5.Image | null = null;
  private blinkTimer: number = 0;
  private showPrompt: boolean = true;

  load(p: P5Instance): void {
    this.titleImage = p.loadImage("assets/title.png");
  }

  setup(): void {
    this.blinkTimer = 0;
    this.showPrompt = true;
  }

  onEnter(): void {
    // Reset animation
    this.blinkTimer = 0;
  }

  onExit(): void {
    // Nothing to cleanup
  }

  update(deltaTime: number): void {
    // Blink "Press Enter" text
    this.blinkTimer += deltaTime;
    if (this.blinkTimer >= 500) {
      this.showPrompt = !this.showPrompt;
      this.blinkTimer = 0;
    }
  }

  draw(p: P5Instance): void {
    p.background(0);

    // Draw title
    if (this.titleImage) {
      p.image(this.titleImage, p.width / 2 - 100, 50);
    }

    // Draw prompt
    if (this.showPrompt) {
      p.fill(255);
      p.textAlign(p.CENTER);
      p.text("PRESS ENTER", p.width / 2, p.height * 0.75);
    }
  }

  onKeyPressed(event: KeyEvent): void {
    if (event.keyCode === 13) {
      // ENTER
      this.eventBus.emit("scene:transition", { to: "world" });
    }
  }

  cleanup(): void {}
}
```

### WorldScene

```typescript
class WorldScene implements IScene {
  readonly name: SceneName = "world";

  private player: Player;
  private npc: NPC;
  private map: TiledMap;
  private camera: Camera;
  private dialogBox: DialogBox;
  private gameState: GameState;
  private eventBus: EventBus;

  private isInDialogue: boolean = false;

  constructor(gameState: GameState, eventBus: EventBus) {
    this.gameState = gameState;
    this.eventBus = eventBus;
  }

  load(p: P5Instance): void {
    this.player = new Player(p, { x: 0, y: 0 });
    this.npc = new NPC(p, { x: 0, y: 0, npcId: "gentleman_01" });
    this.map = new TiledMap(p, { x: 100, y: -150 });
    this.camera = new Camera(p);
    this.dialogBox = new DialogBox(p, { x: 0, y: 280 });

    this.player.load(p);
    this.npc.load(p);
    this.map.load(p, "assets/Trainer Tower interior.png", "maps/world.json");
    this.dialogBox.load(p);
  }

  setup(): void {
    // Position entities from map spawn points
    const playerSpawn = this.map.getSpawnPoint("player");
    const npcSpawn = this.map.getSpawnPoint("npc");

    if (playerSpawn) {
      this.player.x = this.map.x + playerSpawn.x;
      this.player.y = this.map.y + playerSpawn.y;
    }

    if (npcSpawn) {
      this.npc.x = this.map.x + npcSpawn.x;
      this.npc.y = this.map.y + npcSpawn.y;
    }

    this.player.setup();
    this.npc.setup();
    this.camera.attachTo(this.player);
  }

  onEnter(context?: SceneContext): void {
    // Reset dialogue state
    this.isInDialogue = false;
    this.player.setFreeze(false);
    this.dialogBox.hide();
  }

  onExit(): void {
    // Save player position to state
    this.gameState.setPlayerPosition(this.player.x, this.player.y);
  }

  update(deltaTime: number): void {
    this.camera.update();
    this.player.update(deltaTime);
    this.npc.update(deltaTime);
    this.dialogBox.update(deltaTime);

    // Check NPC collision
    this.checkNPCInteraction();

    // Check map boundaries
    this.map.handleCollisions(this.player);
  }

  private checkNPCInteraction(): void {
    if (this.isInDialogue) return;

    if (checkCollision(this.npc, this.player)) {
      preventOverlap(this.npc, this.player);
      this.startNPCDialogue();
    }
  }

  private startNPCDialogue(): void {
    const npcState = this.gameState.getNPC(this.npc.npcId);

    this.player.setFreeze(true);
    this.isInDialogue = true;
    this.dialogBox.show();

    if (npcState.defeated) {
      this.dialogBox.displayText(npcState.dialogue.afterDefeat);
    } else {
      this.dialogBox.displayText(npcState.dialogue.beforeBattle, () => {
        this.startBattle();
      });
    }
  }

  private startBattle(): void {
    const npcState = this.gameState.getNPC(this.npc.npcId);

    this.eventBus.emit("scene:transition", {
      to: "battle",
      context: {
        npcId: this.npc.npcId,
        npcName: `${npcState.name} the ${npcState.title}`,
        npcPokemon: npcState.pokemon,
        playerPokemon: this.gameState.getPlayerPokemon(),
      },
    });
  }

  draw(p: P5Instance): void {
    p.background(0);

    this.map.draw(p, this.camera);
    this.npc.draw(p, this.camera);
    this.player.draw(p, this.camera);
    this.dialogBox.draw(p);
  }

  onKeyPressed(event: KeyEvent): void {
    if (this.isInDialogue && event.keyCode === 13) {
      this.dialogBox.hide();
      this.isInDialogue = false;
      this.player.setFreeze(false);
    }
  }

  onKeyReleased(): void {
    this.player.handleKeyRelease();
  }

  cleanup(): void {}
}
```

### BattleScene

```typescript
class BattleScene implements IScene {
  readonly name: SceneName = "battle";

  private playerPokemon: Pokemon;
  private npcPokemon: Pokemon;
  private dialogBox: DialogBox;
  private eventBus: EventBus;

  private state: BattleState = "intro";
  private npcId: string = "";
  private selectedMove: number = -1;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  load(p: P5Instance): void {
    // Load battle sprites, backgrounds, etc.
  }

  setup(): void {}

  onEnter(context?: BattleContext): void {
    if (!context) {
      console.error("BattleScene requires context");
      return;
    }

    // Initialize from context
    this.npcId = context.npcId;
    this.playerPokemon = new Pokemon(context.playerPokemon[0]);
    this.npcPokemon = new Pokemon(context.npcPokemon[0]);

    // Start battle intro
    this.state = "intro";
    this.startIntro(context.npcName);
  }

  onExit(): void {
    // Reset state for next battle
    this.state = "intro";
    this.selectedMove = -1;
  }

  private startIntro(npcName: string): void {
    this.dialogBox.displayText(`${npcName} wants to battle!`, () => {
      this.state = "player-turn";
    });
  }

  update(deltaTime: number): void {
    this.dialogBox.update(deltaTime);
    this.updateBattleState();
  }

  private updateBattleState(): void {
    switch (this.state) {
      case "player-attack":
        this.executePlayerAttack();
        break;
      case "npc-turn":
        this.executeNPCAttack();
        break;
      case "battle-end":
        this.handleBattleEnd();
        break;
    }
  }

  private executePlayerAttack(): void {
    const damage = this.playerPokemon.performAttack(
      this.npcPokemon,
      this.selectedMove
    );

    this.dialogBox.displayText(
      `${this.playerPokemon.name} dealt ${damage} damage!`,
      () => {
        if (this.npcPokemon.isFainted) {
          this.state = "battle-end";
        } else {
          this.state = "npc-turn";
        }
      }
    );
  }

  private handleBattleEnd(): void {
    const playerWon = this.npcPokemon.isFainted;

    this.dialogBox.displayText(playerWon ? "You won!" : "You lost...", () => {
      this.eventBus.emit("battle:complete", {
        npcId: this.npcId,
        result: playerWon ? "win" : "lose",
      });

      this.eventBus.emit("scene:transition", { to: "world" });
    });

    this.state = "finished";
  }

  draw(p: P5Instance): void {
    // Draw battle background
    // Draw Pokemon sprites
    // Draw HP bars
    // Draw move menu (if player turn)
    // Draw dialog
  }

  onKeyPressed(event: KeyEvent): void {
    if (this.state !== "player-turn") return;

    const moveKeys: Record<string, number> = {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 3,
    };

    if (event.key in moveKeys) {
      this.selectedMove = moveKeys[event.key];
      this.state = "player-attack";
    }
  }

  cleanup(): void {}
}
```

---

## Scene Transitions

### Transition Flow

```
┌─────────────┐    context: {}     ┌─────────────┐
│    MENU     │ ─────────────────► │    WORLD    │
└─────────────┘                    └─────────────┘
                                          │
                                          │ context: {
                                          │   npcId,
                                          │   npcPokemon,
                                          │   playerPokemon
                                          │ }
                                          ▼
┌─────────────┐    event:          ┌─────────────┐
│    WORLD    │ ◄───────────────── │   BATTLE    │
└─────────────┘  battle:complete   └─────────────┘
```

### Context Types

```typescript
// Menu → World (no context needed)
interface MenuToWorldContext {}

// World → Battle
interface WorldToBattleContext {
  npcId: string;
  npcName: string;
  npcPokemon: PokemonConfig[];
  playerPokemon: PokemonConfig[];
  location: string;
}

// Battle → World (via event, not context)
interface BattleCompleteEvent {
  npcId: string;
  result: "win" | "lose";
  expGained?: number;
  moneyGained?: number;
}
```
