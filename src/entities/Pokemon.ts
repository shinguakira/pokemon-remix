import { eventBus } from '../core/EventBus';
import type { Move, PokemonConfig, PokemonStats } from '../core/interfaces';

/**
 * Pokemon entity for battle system.
 * Handles stats, moves, damage calculation, and battle state.
 */
export class Pokemon {
	readonly name: string;
	readonly level: number;
	readonly stats: PokemonStats;
	readonly moves: Move[];
	readonly spriteUrl?: string;

	// Battle state
	currentHp: number;
	isFainted = false;

	constructor(config: PokemonConfig) {
		this.name = config.name;
		this.level = config.level;
		this.stats = { ...config.stats };
		this.moves = [...config.moves];
		this.spriteUrl = config.spriteUrl;
		this.currentHp = this.stats.maxHp;
	}

	/**
	 * Get the maximum HP
	 */
	get maxHp(): number {
		return this.stats.maxHp;
	}

	/**
	 * Get the attack stat
	 */
	get attack(): number {
		return this.stats.attack;
	}

	/**
	 * Get the defense stat
	 */
	get defense(): number {
		return this.stats.defense;
	}

	/**
	 * Get HP percentage (0-1)
	 */
	get hpPercentage(): number {
		return this.currentHp / this.stats.maxHp;
	}

	/**
	 * Calculate damage for an attack
	 * Uses a simplified Pokemon damage formula
	 */
	calculateDamage(target: Pokemon, move: Move): number {
		const levelFactor = (2 * this.level) / 5 + 2;
		const attackDefenseRatio = this.attack / target.defense;
		const baseDamage = (levelFactor * move.power * attackDefenseRatio) / 50 + 2;

		// Add some randomness (85-100% of base damage)
		const randomFactor = 0.85 + Math.random() * 0.15;

		return Math.floor(baseDamage * randomFactor);
	}

	/**
	 * Take damage and check if fainted
	 */
	takeDamage(amount: number): void {
		this.currentHp = Math.max(0, this.currentHp - amount);

		if (this.currentHp <= 0) {
			this.isFainted = true;
			eventBus.emit('battle:faint', { pokemon: this.name, isPlayer: false });
		}
	}

	/**
	 * Execute an attack on a target
	 * @returns The damage dealt, or null if move not found
	 */
	performAttack(target: Pokemon, moveIndex: number): number | null {
		const move = this.moves[moveIndex];
		if (!move) {
			console.error(`Move at index ${moveIndex} not found for ${this.name}`);
			return null;
		}

		console.log(`${this.name} used ${move.name}!`);

		const damage = this.calculateDamage(target, move);
		target.takeDamage(damage);

		eventBus.emit('battle:attack', {
			attacker: this.name,
			defender: target.name,
			move: move.name,
			damage,
		});

		console.log(`${target.name} took ${damage} damage.`);

		return damage;
	}

	/**
	 * Get a move by index
	 */
	getMove(index: number): Move | undefined {
		return this.moves[index];
	}

	/**
	 * Get a random move index
	 */
	getRandomMoveIndex(): number {
		return Math.floor(Math.random() * this.moves.length);
	}

	/**
	 * Heal the Pokemon
	 */
	heal(amount: number): void {
		this.currentHp = Math.min(this.stats.maxHp, this.currentHp + amount);
	}

	/**
	 * Fully restore HP and clear faint status
	 */
	fullRestore(): void {
		this.currentHp = this.stats.maxHp;
		this.isFainted = false;
	}

	/**
	 * Reset to full HP (for battle reset)
	 */
	reset(): void {
		this.fullRestore();
	}

	/**
	 * Create a clone of this Pokemon
	 */
	clone(): Pokemon {
		const pokemon = new Pokemon({
			name: this.name,
			level: this.level,
			stats: { ...this.stats },
			moves: this.moves.map((m) => ({ ...m })),
			spriteUrl: this.spriteUrl,
		});
		return pokemon;
	}
}

// =============================================================================
// Pokemon Data Registry
// =============================================================================

/**
 * Registry of all available Pokemon configurations.
 * Extensible - add new Pokemon here.
 */
export const PokemonRegistry: Record<string, PokemonConfig> = {
	BLASTOISE: {
		name: 'BLASTOISE',
		level: 50,
		stats: {
			maxHp: 100,
			attack: 83,
			defense: 100,
		},
		moves: [
			{ name: 'DEATH', power: 1000 },
			{ name: 'HYDRO PUMP', power: 50 },
			{ name: 'HYDRO CANNON', power: 45 },
			{ name: 'WATER GUN', power: 50 },
		],
		spriteUrl: '/assets/BLASTOISE.png',
	},
	VENUSAUR: {
		name: 'VENUSAUR',
		level: 50,
		stats: {
			maxHp: 100,
			attack: 82,
			defense: 83,
		},
		moves: [
			{ name: 'TACKLE', power: 10 },
			{ name: 'RAZOR LEAF', power: 55 },
			{ name: 'TAKE DOWN', power: 45 },
			{ name: 'POWER WHIP', power: 50 },
		],
		spriteUrl: '/assets/VENUSAUR.png',
	},
	CHARIZARD: {
		name: 'CHARIZARD',
		level: 50,
		stats: {
			maxHp: 100,
			attack: 84,
			defense: 78,
		},
		moves: [
			{ name: 'FLAMETHROWER', power: 55 },
			{ name: 'FIRE BLAST', power: 60 },
			{ name: 'DRAGON CLAW', power: 45 },
			{ name: 'SLASH', power: 40 },
		],
		spriteUrl: '/assets/CHARIZARD.png',
	},
};

/**
 * Create a Pokemon from the registry
 */
export function createPokemon(key: keyof typeof PokemonRegistry): Pokemon {
	const config = PokemonRegistry[key];
	if (!config) {
		throw new Error(`Pokemon "${key}" not found in registry`);
	}
	return new Pokemon(config);
}

/**
 * Create a Pokemon directly from a config object
 */
export function createPokemonFromConfig(config: PokemonConfig): Pokemon {
	return new Pokemon(config);
}

/**
 * Register a new Pokemon type
 */
export function registerPokemon(key: string, config: PokemonConfig): void {
	PokemonRegistry[key] = config;
}
