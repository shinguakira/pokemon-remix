# Pokemon Remix - Entity System

## Overview

Entities are game objects with position, behavior, and rendering. The system uses class inheritance for shared functionality.

---

## Entity Hierarchy

```
Entity (base)
│   - id, x, y, width, height
│   - update(), draw()
│
├── Sprite
│   │   - spriteRef, draw with image
│   │
│   └── AnimatedSprite
│       │   - animations, frames, currentAnim
│       │   - setAnimation(), updateAnimation()
│       │
│       └── Character
│           │   - direction, speed, movement
│           │   - move(), setDirection()
│           │
│           ├── Player
│           │   - handleInput(), keyboard controls
│           │
│           └── NPC
│               - dialogue, AI behavior
│
├── Pokemon
│   - stats, moves, battle logic
│
├── TiledMap
│   - layers, tiles, boundaries
│
├── DialogBox
│   - text display, typewriter effect
│
├── Camera
│   - follow target, screen transform
│
└── Collidable
    - collision bounds, no rendering
```

---

## Base Classes

### Entity

The foundation for all game objects.

```typescript
abstract class Entity {
  readonly id: string;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(config: EntityConfig) {
    this.id = generateId();
    this.x = config.x;
    this.y = config.y;
    this.width = config.width ?? 32;
    this.height = config.height ?? 32;
  }

  abstract update(deltaTime: number): void;
  abstract draw(p: P5Instance): void;

  getBounds(): Rectangle {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}
```

### Sprite

Adds image rendering to Entity.

```typescript
abstract class Sprite extends Entity {
  protected spriteRef: p5.Image | null = null;
  protected spriteUrl: string;

  load(p: P5Instance): void {
    this.spriteRef = p.loadImage(this.spriteUrl);
  }

  draw(p: P5Instance): void {
    if (this.spriteRef) {
      p.image(this.spriteRef, this.screenX, this.screenY);
    }
  }
}
```

### AnimatedSprite

Adds animation system to Sprite.

```typescript
abstract class AnimatedSprite extends Sprite {
  protected animations: AnimationSet = {};
  protected currentAnim: string | null = null;
  protected currentFrame: number = 0;
  protected animationTimer: number = 0;
  protected frames: FramePosition[] = [];

  // Animation definition
  protected abstract defineAnimations(): void;

  setAnimation(name: string): void {
    if (this.currentAnim !== name) {
      this.currentAnim = name;
      this.currentFrame = 0;
      this.animationTimer = 0;
    }
  }

  updateAnimation(deltaTime: number): void {
    const animData = this.animations[this.currentAnim];
    // Handle frame advancement based on animData.speed
  }

  draw(p: P5Instance): void {
    // Draw current frame from spritesheet
    const frame = this.frames[this.currentFrame];
    p.image(
      this.spriteRef,
      this.screenX,
      this.screenY,
      this.tileWidth,
      this.tileHeight,
      frame.x,
      frame.y,
      this.tileWidth,
      this.tileHeight
    );
  }
}
```

### Character

Adds movement and direction to AnimatedSprite.

```typescript
abstract class Character extends AnimatedSprite {
  protected direction: Direction = "down";
  protected speed: number = 200;
  protected isMoving: boolean = false;
  protected freeze: boolean = false;

  move(dx: number, dy: number): void {
    if (this.freeze) return;
    this.x += dx;
    this.y += dy;
  }

  setDirection(direction: Direction): void {
    this.direction = direction;
  }

  setFreeze(frozen: boolean): void {
    this.freeze = frozen;
  }

  // Update animation based on movement state
  protected updateMovementAnimation(): void {
    if (this.isMoving) {
      this.setRunAnimation();
    } else {
      this.setIdleAnimation();
    }
  }
}
```

---

## Concrete Entities

### Player

Player-controlled character with keyboard input.

```typescript
class Player extends Character {
  constructor(config: PlayerConfig) {
    super(config);
    this.spriteUrl = "assets/boy_run.png";
    this.speed = 200;
  }

  protected defineAnimations(): void {
    this.animations = {
      "idle-down": 0,
      "idle-side": 6,
      "idle-up": 12,
      "run-down": { from: 0, to: 3, loop: true, speed: 8 },
      "run-side": { from: 4, to: 7, loop: true, speed: 8 },
      "run-up": { from: 12, to: 15, loop: true, speed: 8 },
    };
  }

  handleInput(p: P5Instance, deltaTime: number): void {
    if (this.freeze) return;

    const moveBy = (this.speed / 1000) * deltaTime;

    if (p.keyIsDown(p.RIGHT_ARROW)) {
      this.setDirection("right");
      this.setAnimation("run-side");
      this.x += moveBy;
    }
    // ... other directions
  }

  update(deltaTime: number): void {
    this.handleInput(this.p, deltaTime);
    this.updateAnimation(deltaTime);
  }
}
```

### NPC

Non-player character with dialogue capability.

```typescript
class NPC extends Character {
  readonly npcId: string;
  private dialogueState: "idle" | "talking" = "idle";

  constructor(config: NPCConfig) {
    super(config);
    this.npcId = config.npcId;
    this.speed = 0; // Static NPC
  }

  protected defineAnimations(): void {
    this.animations = {
      "idle-down": 0,
      "idle-side": 4,
      "idle-up": 8,
    };
  }

  // NPCs don't move by default
  update(deltaTime: number): void {
    this.updateAnimation(deltaTime);
  }

  // Face the player when interacting
  facePlayer(playerX: number, playerY: number): void {
    const dx = playerX - this.x;
    const dy = playerY - this.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.setDirection(dx > 0 ? "right" : "left");
    } else {
      this.setDirection(dy > 0 ? "down" : "up");
    }
  }
}
```

### Pokemon

Battle entity with stats and moves.

```typescript
class Pokemon {
  readonly name: string;
  readonly level: number;
  readonly stats: PokemonStats;
  readonly moves: Move[];

  currentHp: number;
  isFainted: boolean = false;

  constructor(config: PokemonConfig) {
    this.name = config.name;
    this.level = config.level;
    this.stats = config.stats;
    this.moves = config.moves;
    this.currentHp = this.stats.maxHp;
  }

  calculateDamage(target: Pokemon, move: Move): number {
    const levelFactor = (2 * this.level) / 5 + 2;
    const ratio = this.stats.attack / target.stats.defense;
    return Math.floor((levelFactor * move.power * ratio) / 50) + 2;
  }

  performAttack(target: Pokemon, moveIndex: number): number {
    const move = this.moves[moveIndex];
    const damage = this.calculateDamage(target, move);
    target.takeDamage(damage);
    return damage;
  }

  takeDamage(amount: number): void {
    this.currentHp = Math.max(0, this.currentHp - amount);
    if (this.currentHp === 0) {
      this.isFainted = true;
    }
  }

  reset(): void {
    this.currentHp = this.stats.maxHp;
    this.isFainted = false;
  }
}
```

### Camera

Follows a target and handles screen positioning.

```typescript
class Camera {
  x: number = 0;
  y: number = 0;
  private target: Entity | null = null;
  private screenWidth: number;
  private screenHeight: number;

  constructor(p: P5Instance) {
    this.screenWidth = p.width;
    this.screenHeight = p.height;
  }

  attachTo(target: Entity): void {
    this.target = target;
  }

  update(): void {
    if (!this.target) return;

    // Center camera on target
    this.x = this.screenWidth / 2 - this.target.x;
    this.y = this.screenHeight / 2 - this.target.y;
  }

  // Convert world position to screen position
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX + this.x,
      y: worldY + this.y,
    };
  }
}
```

### DialogBox

Text display with typewriter effect.

```typescript
class DialogBox {
  private x: number;
  private y: number;
  private text: string = "";
  private displayedText: string = "";
  private charQueue: string[] = [];
  private isVisible: boolean = false;
  private isComplete: boolean = false;
  private onComplete: (() => void) | null = null;

  show(): void {
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
  }

  displayText(content: string, onComplete?: () => void): void {
    this.text = content;
    this.displayedText = "";
    this.charQueue = content.split("");
    this.isComplete = false;
    this.onComplete = onComplete ?? null;
  }

  update(deltaTime: number): void {
    if (!this.isVisible || this.isComplete) return;

    // Add characters over time (typewriter effect)
    // When complete, call onComplete callback
  }

  draw(p: P5Instance): void {
    if (!this.isVisible) return;
    // Draw background and text
  }
}
```

---

## Creating New Entities

### Example: Adding a Wild Pokemon Encounter Entity

```typescript
class WildPokemonSpawner extends Entity {
  private spawnChance: number;
  private possiblePokemon: string[];
  private cooldown: number = 0;

  constructor(config: SpawnerConfig) {
    super(config);
    this.spawnChance = config.spawnChance;
    this.possiblePokemon = config.pokemon;
  }

  update(deltaTime: number): void {
    this.cooldown -= deltaTime;
  }

  checkEncounter(player: Player): boolean {
    if (this.cooldown > 0) return false;
    if (!this.isPlayerInZone(player)) return false;

    if (Math.random() < this.spawnChance) {
      this.cooldown = 5000; // 5 second cooldown
      return true;
    }
    return false;
  }

  getRandomPokemon(): string {
    const index = Math.floor(Math.random() * this.possiblePokemon.length);
    return this.possiblePokemon[index];
  }

  draw(): void {
    // Invisible entity, no rendering
  }
}
```

---

## Animation Data Format

```typescript
// Static frame (just an index)
type StaticAnimation = number;

// Animated sequence
interface AnimatedAnimation {
  from: number; // Start frame index
  to: number; // End frame index
  loop: boolean; // Loop when finished?
  speed: number; // Frames per second
}

type AnimationData = StaticAnimation | AnimatedAnimation;

// Example
const animations = {
  "idle-down": 0, // Static
  "run-down": { from: 0, to: 3, loop: true, speed: 8 }, // Animated
};
```

---

## Collision Handling

```typescript
// Utility functions
function checkCollision(a: Entity, b: Entity): boolean {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

function preventOverlap(static_: Entity, dynamic: Entity): void {
  // Push dynamic entity out of static entity
  // Calculate overlap and resolve on smallest axis
}
```
