import type p5 from 'p5';
import { emitGameEvent } from '../core/GameEvents';
import type { KeyEvent, P5Instance, SceneName } from '../core/interfaces';
import { wait } from '../core/utils';
import { DialogBox, type Pokemon, createPokemon } from '../entities';
import { Scene } from './Scene';

/**
 * Battle states - using const enum for better extensibility
 */
export const BattleState = {
	DEFAULT: 'default',
	INTRO_NPC: 'intro-npc',
	INTRO_NPC_POKEMON: 'intro-npc-pokemon',
	INTRO_PLAYER_POKEMON: 'intro-player-pokemon',
	PLAYER_TURN: 'player-turn',
	PLAYER_ATTACK: 'player-attack',
	NPC_TURN: 'npc-turn',
	PROCESSING: 'processing',
	BATTLE_END: 'battle-end',
	WINNER_DECLARED: 'winner-declared',
} as const;

export type BattleStateType = (typeof BattleState)[keyof typeof BattleState];

/**
 * Battle UI positions configuration
 */
interface BattlePositions {
	npc: { x: number; y: number };
	playerPokemon: { x: number; initialX: number; finalX: number; y: number };
	npcPokemon: { x: number; initialX: number; finalX: number; y: number };
	playerDataBox: {
		x: number;
		initialX: number;
		y: number;
		nameX: number;
		nameY: number;
		healthBarX: number;
		healthBarY: number;
	};
	npcDataBox: {
		x: number;
		initialX: number;
		y: number;
		nameX: number;
		nameY: number;
		healthBarX: number;
		healthBarY: number;
	};
}

/**
 * Battle scene - turn-based Pokemon battle
 */
export class BattleScene extends Scene {
	readonly name: SceneName = 'battle';

	// Dialog
	private dialogBox: DialogBox;

	// Pokemon
	private playerPokemon: Pokemon;
	private npcPokemon: Pokemon;

	// Sprites
	private sprites: {
		background: p5.Image | null;
		npc: p5.Image | null;
		playerPokemon: p5.Image | null;
		npcPokemon: p5.Image | null;
		playerDataBox: p5.Image | null;
		npcDataBox: p5.Image | null;
	} = {
		background: null,
		npc: null,
		playerPokemon: null,
		npcPokemon: null,
		playerDataBox: null,
		npcDataBox: null,
	};

	// Battle state
	private currentState: BattleStateType = BattleState.DEFAULT;
	private selectedMoveIndex = -1;

	// Positions (mutable for animations)
	private positions: BattlePositions;

	// NPC info
	private currentNpcId = '';

	// Scene changer
	private setScene: ((name: SceneName, data?: Record<string, unknown>) => void) | null = null;

	constructor(p: P5Instance) {
		super(p);

		this.dialogBox = new DialogBox({ x: 0, y: 288 });
		this.playerPokemon = createPokemon('BLASTOISE');
		this.npcPokemon = createPokemon('VENUSAUR');

		// Initialize positions
		this.positions = this.getInitialPositions();
	}

	private getInitialPositions(): BattlePositions {
		return {
			npc: { x: 350, y: 20 },
			playerPokemon: { x: -170, initialX: -170, finalX: 20, y: 128 },
			npcPokemon: { x: 600, initialX: 600, finalX: 310, y: 20 },
			playerDataBox: {
				x: 510,
				initialX: 510,
				y: 220,
				nameX: 38,
				nameY: 30,
				healthBarX: 136,
				healthBarY: 40,
			},
			npcDataBox: {
				x: -300,
				initialX: -300,
				y: 40,
				nameX: 15,
				nameY: 30,
				healthBarX: 118,
				healthBarY: 40,
			},
		};
	}

	/**
	 * Set the scene change callback
	 */
	setSceneChanger(changer: (name: SceneName, data?: Record<string, unknown>) => void): void {
		this.setScene = changer;
	}

	load(p: P5Instance): void {
		// Cast to handle p5's async type definition
		this.sprites.background = p.loadImage('/assets/battle-background.png') as unknown as p5.Image;
		this.sprites.npc = p.loadImage('/assets/GENTLEMAN.png') as unknown as p5.Image;
		this.sprites.playerPokemon = p.loadImage('/assets/BLASTOISE.png') as unknown as p5.Image;
		this.sprites.npcPokemon = p.loadImage('/assets/VENUSAUR.png') as unknown as p5.Image;
		this.sprites.playerDataBox = p.loadImage('/assets/databox_thin.png') as unknown as p5.Image;
		this.sprites.npcDataBox = p.loadImage('/assets/databox_thin_foe.png') as unknown as p5.Image;
		this.dialogBox.load(p);
		this.isLoaded = true;
	}

	setup(): void {
		this.startBattleIntro();
		this.isSetup = true;
	}

	private startBattleIntro(): void {
		this.dialogBox.show();
		this.dialogBox.displayText('Mark the gentleman wants to battle!', async () => {
			await wait(2000);
			this.currentState = BattleState.INTRO_NPC;
			this.dialogBox.clearText();
			this.dialogBox.displayText(`He sends out a ${this.npcPokemon.name}!`, async () => {
				this.currentState = BattleState.INTRO_NPC_POKEMON;
				await wait(1000);
				this.dialogBox.clearText();
				this.dialogBox.displayText(`Go! ${this.playerPokemon.name}!`, async () => {
					this.currentState = BattleState.INTRO_PLAYER_POKEMON;
					await wait(1000);
					this.dialogBox.clearText();
					this.dialogBox.displayText(`What will ${this.playerPokemon.name} do?`, async () => {
						await wait(1000);
						this.currentState = BattleState.PLAYER_TURN;
					});
				});
			});
		});
	}

	update(deltaTime: number): void {
		this.updateAnimations(deltaTime);
		this.dialogBox.update(deltaTime);
	}

	private updateAnimations(deltaTime: number): void {
		const speed = 0.5 * deltaTime;

		// NPC slide in
		if (this.currentState === BattleState.INTRO_NPC) {
			this.positions.npc.x += speed;
		}

		// NPC Pokemon slide in
		if (this.currentState === BattleState.INTRO_NPC_POKEMON) {
			if (this.positions.npcPokemon.x >= this.positions.npcPokemon.finalX) {
				this.positions.npcPokemon.x -= speed;
				if (this.positions.npcDataBox.x <= 0) {
					this.positions.npcDataBox.x += speed;
				}
			}
		}

		// Player Pokemon slide in
		if (this.currentState === BattleState.INTRO_PLAYER_POKEMON) {
			if (this.positions.playerPokemon.x <= this.positions.playerPokemon.finalX) {
				this.positions.playerPokemon.x += speed;
				this.positions.playerDataBox.x -= 0.65 * deltaTime;
			}
		}

		// Faint animations
		if (this.playerPokemon.isFainted) {
			this.positions.playerPokemon.y += 0.8 * deltaTime;
		}
		if (this.npcPokemon.isFainted) {
			this.positions.npcPokemon.y += 0.8 * deltaTime;
		}
	}

	draw(p: P5Instance): void {
		p.clear();
		p.background(0);

		// Background
		if (this.sprites.background) {
			p.image(this.sprites.background, 0, 0);
		}

		// NPC Pokemon
		if (this.sprites.npcPokemon) {
			p.image(this.sprites.npcPokemon, this.positions.npcPokemon.x, this.positions.npcPokemon.y);
		}
		this.drawDataBox(p, this.npcPokemon, this.positions.npcDataBox, this.sprites.npcDataBox);

		// Player Pokemon
		if (this.sprites.playerPokemon) {
			p.image(
				this.sprites.playerPokemon,
				this.positions.playerPokemon.x,
				this.positions.playerPokemon.y
			);
		}
		this.drawDataBox(
			p,
			this.playerPokemon,
			this.positions.playerDataBox,
			this.sprites.playerDataBox
		);

		// NPC trainer (only during intro)
		if (
			(this.currentState === BattleState.DEFAULT || this.currentState === BattleState.INTRO_NPC) &&
			this.sprites.npc
		) {
			p.image(this.sprites.npc, this.positions.npc.x, this.positions.npc.y);
		}

		// Show move selection
		if (this.currentState === BattleState.PLAYER_TURN && this.selectedMoveIndex === -1) {
			this.showMoveSelection();
		}

		// Handle state transitions
		this.handleStateTransitions();

		// Dialog box background
		p.rect(0, 288, 512, 200);

		// Dialog
		this.dialogBox.draw(p);
	}

	private drawDataBox(
		p: P5Instance,
		pokemon: Pokemon,
		position: BattlePositions['playerDataBox'],
		sprite: p5.Image | null
	): void {
		if (!sprite) return;

		p.image(sprite, position.x, position.y);
		p.text(pokemon.name, position.x + position.nameX, position.y + position.nameY);

		// Health bar
		p.push();
		p.noStroke();
		const healthBarLength = pokemon.hpPercentage * 96;

		if (healthBarLength > 50) {
			p.fill(0, 200, 0);
		} else if (healthBarLength < 20) {
			p.fill(200, 0, 0);
		} else {
			p.fill(255, 165, 0);
		}

		p.rect(position.x + position.healthBarX, position.y + position.healthBarY, healthBarLength, 6);
		p.pop();
	}

	private showMoveSelection(): void {
		const moves = this.playerPokemon.moves;
		this.dialogBox.displayTextImmediately(
			`1) ${moves[0]?.name ?? '---'}    3) ${moves[2]?.name ?? '---'}\n2) ${
				moves[1]?.name ?? '---'
			}   4) ${moves[3]?.name ?? '---'}`
		);
	}

	private handleStateTransitions(): void {
		if (this.currentState === BattleState.PLAYER_ATTACK) {
			this.handlePlayerAttack();
			this.currentState = BattleState.PROCESSING;
		}

		if (this.currentState === BattleState.NPC_TURN) {
			this.handleNpcAttack();
			this.currentState = BattleState.PROCESSING;
		}

		if (this.currentState === BattleState.BATTLE_END) {
			this.handleBattleEnd();
		}
	}

	private handlePlayerAttack(): void {
		const move = this.playerPokemon.getMove(this.selectedMoveIndex);
		if (!move) return;

		this.dialogBox.clearText();
		this.dialogBox.displayText(`${this.playerPokemon.name} used ${move.name}!`, async () => {
			this.playerPokemon.performAttack(this.npcPokemon, this.selectedMoveIndex);

			if (this.npcPokemon.isFainted) {
				this.currentState = BattleState.BATTLE_END;
			} else {
				await wait(1000);
				this.dialogBox.clearText();
				this.currentState = BattleState.NPC_TURN;
			}
		});
	}

	private handleNpcAttack(): void {
		const moveIndex = this.npcPokemon.getRandomMoveIndex();
		const move = this.npcPokemon.getMove(moveIndex);
		if (!move) return;

		this.dialogBox.clearText();
		this.dialogBox.displayText(`The foe's ${this.npcPokemon.name} used ${move.name}!`, async () => {
			this.npcPokemon.performAttack(this.playerPokemon, moveIndex);

			if (this.playerPokemon.isFainted) {
				this.currentState = BattleState.BATTLE_END;
			} else {
				await wait(1000);
				this.selectedMoveIndex = -1;
				this.currentState = BattleState.PLAYER_TURN;
			}
		});
	}

	private handleBattleEnd(): void {
		if (this.npcPokemon.isFainted) {
			this.dialogBox.clearText();
			this.dialogBox.displayText(`${this.npcPokemon.name} fainted! You won!`, async () => {
				emitGameEvent('battle:complete', {
					npcId: this.currentNpcId,
					result: 'win',
					expGained: 500,
					moneyGained: 1000,
				});
				this.dialogBox.hide();
				await wait(2000);
				this.goToWorld();
			});
			this.currentState = BattleState.WINNER_DECLARED;
		} else if (this.playerPokemon.isFainted) {
			this.dialogBox.clearText();
			this.dialogBox.displayText(`${this.playerPokemon.name} fainted! You lost!`, async () => {
				emitGameEvent('battle:complete', {
					npcId: this.currentNpcId,
					result: 'lose',
				});
				this.dialogBox.hide();
				await wait(2000);
				this.goToWorld();
			});
			this.currentState = BattleState.WINNER_DECLARED;
		}
	}

	private goToWorld(): void {
		if (this.setScene) {
			this.setScene('world');
		} else {
			emitGameEvent('scene:transition', { to: 'world' });
		}
	}

	reset(): void {
		// Reset state
		this.currentState = BattleState.DEFAULT;
		this.selectedMoveIndex = -1;

		// Reset Pokemon
		this.playerPokemon.reset();
		this.npcPokemon.reset();

		// Reset positions
		this.positions = this.getInitialPositions();

		// Reset dialog
		this.dialogBox.reset();
	}

	onEnter(data?: Record<string, unknown>): void {
		this.reset();
		this.setup();

		if (data?.npcId) {
			this.currentNpcId = data.npcId as string;
		}
	}

	onKeyPressed(event: KeyEvent): void {
		if (this.currentState !== BattleState.PLAYER_TURN) return;

		const keyMoveMap: Record<string, number> = {
			'1': 0,
			'2': 1,
			'3': 2,
			'4': 3,
		};

		const moveIndex = keyMoveMap[event.key];
		if (moveIndex !== undefined) {
			this.selectedMoveIndex = moveIndex;
			this.currentState = BattleState.PLAYER_ATTACK;
		}
	}
}
