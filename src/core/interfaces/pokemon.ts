/**
 * Pokemon interfaces
 */

// =============================================================================
// Pokemon Interfaces
// =============================================================================

export interface Move {
  name: string;
  power: number;
  type?: string;
  accuracy?: number;
}

export interface PokemonStats {
  maxHp: number;
  attack: number;
  defense: number;
  speed?: number;
  specialAttack?: number;
  specialDefense?: number;
}

export interface PokemonConfig {
  name: string;
  level: number;
  stats: PokemonStats;
  moves: Move[];
  spriteUrl?: string;
}
