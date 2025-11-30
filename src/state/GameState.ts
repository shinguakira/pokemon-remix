import { emitGameEvent, onGameEvent } from '@game/core/GameEvents';
import type { GameFlags, NPCState, PlayerState, PokemonConfig } from '@game/core/interfaces';

// Re-export state interfaces for convenience
export type {
	PlayerState,
	NPCState,
	GameFlags,
	GameStateData,
} from '@game/core/interfaces';

// =============================================================================
// Default Data
// =============================================================================

const DEFAULT_PLAYER: PlayerState = {
	name: 'RED',
	pokemon: [
		{
			name: 'BLASTOISE',
			level: 50,
			stats: { maxHp: 100, attack: 83, defense: 100 },
			moves: [
				{ name: 'HYDRO PUMP', power: 50 },
				{ name: 'HYDRO CANNON', power: 45 },
				{ name: 'WATER GUN', power: 50 },
				{ name: 'SKULL BASH', power: 60 },
			],
			spriteUrl: '/assets/BLASTOISE.png',
		},
	],
	position: { x: 0, y: 0, map: 'tower' },
	money: 3000,
	badges: [],
};

const DEFAULT_NPCS: Record<string, NPCState> = {
	gentleman_01: {
		id: 'gentleman_01',
		name: 'Mark',
		title: 'Gentleman',
		defeated: false,
		pokemon: ['VENUSAUR'],
		spriteUrl: '/assets/trainer_GENTLEMAN.png',
		battleSpriteUrl: '/assets/GENTLEMAN.png',
		dialogue: {
			beforeBattle: "I see that you need training.\nLet's battle!",
			afterDefeat: 'You already defeated me...',
		},
		rewards: {
			money: 1000,
			exp: 500,
		},
	},
	gentleman_02: {
		id: 'gentleman_02',
		name: 'James',
		title: 'Gentleman',
		defeated: false,
		pokemon: ['BLASTOISE'],
		spriteUrl: '/assets/trainer_GENTLEMAN.png',
		battleSpriteUrl: '/assets/GENTLEMAN.png',
		dialogue: {
			beforeBattle: 'I am the second guardian.',
			afterDefeat: 'You already defeated me...',
		},
		rewards: {
			money: 1500,
			exp: 750,
		},
	},
};

const DEFAULT_FLAGS: GameFlags = {
	tutorialComplete: false,
	firstBattleWon: false,
};

// =============================================================================
// GameState Class
// =============================================================================

export class GameState {
	private player: PlayerState;
	private npcs: Map<string, NPCState>;
	private flags: GameFlags;
	private currentMap: string;

	constructor() {
		this.player = { ...DEFAULT_PLAYER };
		this.npcs = new Map(Object.entries(DEFAULT_NPCS));
		this.flags = { ...DEFAULT_FLAGS };
		this.currentMap = 'tower';

		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		// Listen for battle completion
		onGameEvent('battle:complete', (data) => {
			if (data.result === 'win') {
				this.setNPCDefeated(data.npcId);
				if (data.moneyGained) {
					this.addMoney(data.moneyGained);
				}
				if (!this.flags.firstBattleWon) {
					this.setFlag('firstBattleWon', true);
				}
			}
		});

		// Listen for NPC defeated
		onGameEvent('npc:defeated', (data) => {
			this.setNPCDefeated(data.npcId);
		});
	}

	// ===========================================================================
	// Player Methods
	// ===========================================================================

	getPlayer(): PlayerState {
		return this.player;
	}

	getPlayerPokemon(): PokemonConfig[] {
		return this.player.pokemon;
	}

	setPlayerPokemon(pokemon: PokemonConfig[]): void {
		this.player.pokemon = pokemon;
	}

	getPlayerPosition(): { x: number; y: number; map: string } {
		return this.player.position;
	}

	setPlayerPosition(x: number, y: number, map?: string): void {
		this.player.position.x = x;
		this.player.position.y = y;
		if (map) {
			this.player.position.map = map;
		}
	}

	getMoney(): number {
		return this.player.money;
	}

	addMoney(amount: number): void {
		this.player.money += amount;
	}

	// ===========================================================================
	// NPC Methods
	// ===========================================================================

	getNPC(id: string): NPCState | undefined {
		return this.npcs.get(id);
	}

	getAllNPCs(): NPCState[] {
		return Array.from(this.npcs.values());
	}

	isNPCDefeated(id: string): boolean {
		return this.npcs.get(id)?.defeated ?? false;
	}

	setNPCDefeated(id: string): void {
		const npc = this.npcs.get(id);
		if (npc && !npc.defeated) {
			npc.defeated = true;
			console.log(`[GameState] NPC ${id} marked as defeated`);
		}
	}

	getNPCDialogue(id: string): string {
		const npc = this.npcs.get(id);
		if (!npc) return '';
		return npc.defeated ? npc.dialogue.afterDefeat : npc.dialogue.beforeBattle;
	}

	// ===========================================================================
	// Flag Methods
	// ===========================================================================

	getFlag(key: string): boolean {
		return this.flags[key] ?? false;
	}

	setFlag(key: string, value: boolean): void {
		this.flags[key] = value;
	}

	// ===========================================================================
	// Map Methods
	// ===========================================================================

	getCurrentMap(): string {
		return this.currentMap;
	}

	setCurrentMap(map: string): void {
		this.currentMap = map;
	}

	// ===========================================================================
	// Persistence
	// ===========================================================================

	serialize(): string {
		return JSON.stringify({
			player: this.player,
			npcs: Object.fromEntries(this.npcs),
			flags: this.flags,
			currentMap: this.currentMap,
		});
	}

	deserialize(data: string): void {
		try {
			const parsed = JSON.parse(data);
			this.player = parsed.player;
			this.npcs = new Map(Object.entries(parsed.npcs));
			this.flags = parsed.flags;
			this.currentMap = parsed.currentMap;
		} catch (error) {
			console.error('[GameState] Failed to deserialize:', error);
		}
	}

	save(): void {
		const data = this.serialize();
		localStorage.setItem('pokemon-remix-save', data);
		emitGameEvent('game:save', undefined);
		console.log('[GameState] Game saved');
	}

	load(): boolean {
		const data = localStorage.getItem('pokemon-remix-save');
		if (data) {
			this.deserialize(data);
			emitGameEvent('game:load', undefined);
			console.log('[GameState] Game loaded');
			return true;
		}
		return false;
	}

	// ===========================================================================
	// Reset
	// ===========================================================================

	reset(): void {
		this.player = { ...DEFAULT_PLAYER };
		this.npcs = new Map(Object.entries(DEFAULT_NPCS));
		this.flags = { ...DEFAULT_FLAGS };
		this.currentMap = 'tower';
	}
}

// Global singleton instance
export const gameState = new GameState();
