import { emitGameEvent } from '@game/core/GameEvents';
import type { KeyEvent, P5Instance, SceneName } from '@game/core/interfaces';
import { checkCollision, preventOverlap } from '@game/core/utils';
import { Camera, DialogBox, NPC, Player, TiledMap } from '@game/entities';
import { Scene } from './Scene';

/**
 * World scene - the main overworld exploration scene
 */
export class WorldScene extends Scene {
	readonly name: SceneName = 'world';

	// Entities
	private player: Player;
	private npc1: NPC;
	private npc2: NPC;
	private camera: Camera;
	private map: TiledMap;
	private dialogBox: DialogBox;

	// State
	private isInDialogue = false;
	private currentNpcId = 'gentleman_01';

	// Screen flash effect
	private isFlashing = false;
	private flashAlpha = 0;
	private flashDirection = 1;
	private flashSpeed = 0.7;

	// Scene changer callback
	private setScene: ((name: SceneName, data?: Record<string, unknown>) => void) | null = null;

	constructor(p: P5Instance) {
		super(p);

		// Initialize entities
		this.camera = new Camera(p, { x: 100, y: 0 });
		this.player = new Player(p, {
			x: 0,
			y: 0,
			spriteUrl: '/assets/boy_run.png',
		});
		this.npc1 = new NPC(p, {
			x: 0,
			y: 0,
			spriteUrl: '/assets/trainer_GENTLEMAN.png',
			npcId: 'gentleman_01',
		});
		this.npc2 = new NPC(p, {
			x: 0,
			y: 0,
			spriteUrl: '/assets/trainer_GENTLEMAN.png',
			npcId: 'gentleman_02',
		});
		this.map = new TiledMap({ x: 100, y: -150 });
		this.dialogBox = new DialogBox({ x: 0, y: 280 });
	}

	/**
	 * Set the scene change callback
	 */
	setSceneChanger(changer: (name: SceneName, data?: Record<string, unknown>) => void): void {
		this.setScene = changer;
	}

	/**
	 * Check if current NPC is defeated (from GameState)
	 */
	private isNpcDefeated(): boolean {
		return this.ctx.isNPCDefeated(this.currentNpcId);
	}

	load(p: P5Instance): void {
		this.player.load(p);
		this.npc1.load(p);
		this.npc2.load(p);
		this.dialogBox.load(p);
		this.map.load(p, '/assets/Trainer Tower interior.png', '/maps/world.json');
		this.isLoaded = true;
	}

	setup(): void {
		// Setup player
		this.player.setup();

		// Get spawn points from map
		const playerSpawn = this.map.getSpawnPosition('player');
		const npc1Spawn = this.map.getSpawnPosition('npc1');
		const npc2Spawn = this.map.getSpawnPosition('npc2');

		if (playerSpawn) {
			this.player.x = playerSpawn.x;
			this.player.y = playerSpawn.y;
		}

		if (npc1Spawn) {
			this.npc1.x = npc1Spawn.x;
			this.npc1.y = npc1Spawn.y;
		}

		if (npc2Spawn) {
			this.npc2.x = npc2Spawn.x;
			this.npc2.y = npc2Spawn.y;
		}

		// Setup NPCs
		this.npc1.setup();
		this.npc2.setup();

		// Attach camera to player
		this.camera.attachTo(this.player);

		// Listen for battle end events
		this.setupEventListeners();

		this.isSetup = true;
	}

	private setupEventListeners(): void {
		// GameState handles battle:complete events automatically
		// NPC defeated state is read from GameState
	}

	/**
	 * Set player freeze state (used by settings menu)
	 */
	setPlayerFreeze(freeze: boolean): void {
		this.player.setFreeze(freeze);
	}

	update(deltaTime: number): void {
		// Update camera
		this.camera.update(deltaTime);

		// Update player (handles input)
		this.player.update(deltaTime);

		// Update NPCs
		this.npc1.update(deltaTime);
		this.npc2.update(deltaTime);

		// Update screen positions
		this.player.updateScreenPosition(this.camera.x, this.camera.y);
		this.npc1.updateScreenPosition(this.camera.x, this.camera.y);
		this.npc2.updateScreenPosition(this.camera.x, this.camera.y);

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

		// Check collision with npc1
		this.checkNpcInteraction(this.npc1, 'gentleman_01');
		// Check collision with npc2
		this.checkNpcInteraction(this.npc2, 'gentleman_02');
	}

	private checkNpcInteraction(npc: NPC, npcId: string): void {
		if (checkCollision(npc, this.player)) {
			preventOverlap(npc, this.player);

			this.currentNpcId = npcId;
			const dialogue = this.ctx.getNPCDialogue(npcId);

			if (!this.ctx.isNPCDefeated(npcId)) {
				this.player.setFreeze(true);
				this.isInDialogue = true;
				this.dialogBox.show();
				this.dialogBox.displayText(dialogue, async () => {
					await this.startBattleTransition();
				});
			} else {
				this.dialogBox.show();
				this.dialogBox.displayTextImmediately(dialogue);
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

		// Get NPC data for battle context
		const npcState = this.ctx.getNPC(this.currentNpcId);
		const playerPokemon = this.ctx.getPlayerPokemon();

		// Emit battle start event with full context
		emitGameEvent('battle:start', {
			npcId: this.currentNpcId,
			npcName: npcState ? `${npcState.name} the ${npcState.title}` : 'Trainer',
			npcPokemon: npcState?.pokemon ?? ['VENUSAUR'],
			playerPokemon: playerPokemon.map((p) => p.name),
			location: 'tower',
		});

		// Transition to battle scene
		emitGameEvent('scene:transition', {
			to: 'battle',
			context: {
				npcId: this.currentNpcId,
				npcName: npcState ? `${npcState.name} the ${npcState.title}` : 'Trainer',
				npcPokemon: npcState?.pokemon ?? ['VENUSAUR'],
				playerPokemon: playerPokemon.map((p) => p.name),
			},
		});
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

		// Draw NPCs
		this.npc1.draw(p);
		this.npc2.draw(p);

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

	onEnter(_data?: Record<string, unknown>): void {
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
