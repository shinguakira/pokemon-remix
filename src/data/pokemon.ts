/**
 * Pokemon data definitions
 * All Pokemon stats, moves, and configurations
 */

import type { PokemonConfig, Move } from "../core/types";

// =============================================================================
// Moves Database
// =============================================================================

export const MOVES: Record<string, Move> = {
  // Water moves
  HYDRO_PUMP: { name: "HYDRO PUMP", power: 50, type: "water", accuracy: 80 },
  HYDRO_CANNON: {
    name: "HYDRO CANNON",
    power: 45,
    type: "water",
    accuracy: 90,
  },
  WATER_GUN: { name: "WATER GUN", power: 50, type: "water", accuracy: 100 },

  // Grass moves
  RAZOR_LEAF: { name: "RAZOR LEAF", power: 55, type: "grass", accuracy: 95 },
  POWER_WHIP: { name: "POWER WHIP", power: 50, type: "grass", accuracy: 85 },

  // Normal moves
  TACKLE: { name: "TACKLE", power: 10, type: "normal", accuracy: 100 },
  TAKE_DOWN: { name: "TAKE DOWN", power: 45, type: "normal", accuracy: 85 },
  SKULL_BASH: { name: "SKULL BASH", power: 60, type: "normal", accuracy: 100 },

  // Fire moves
  FLAMETHROWER: {
    name: "FLAMETHROWER",
    power: 55,
    type: "fire",
    accuracy: 100,
  },
  FIRE_BLAST: { name: "FIRE BLAST", power: 60, type: "fire", accuracy: 85 },

  // Dragon moves
  DRAGON_CLAW: {
    name: "DRAGON CLAW",
    power: 45,
    type: "dragon",
    accuracy: 100,
  },
};

// =============================================================================
// Pokemon Database
// =============================================================================

export const POKEMON_DB: Record<string, PokemonConfig> = {
  BLASTOISE: {
    name: "BLASTOISE",
    level: 50,
    stats: {
      maxHp: 100,
      attack: 83,
      defense: 100,
      speed: 78,
    },
    moves: [
      MOVES.HYDRO_PUMP,
      MOVES.HYDRO_CANNON,
      MOVES.WATER_GUN,
      MOVES.SKULL_BASH,
    ],
    spriteUrl: "assets/BLASTOISE.png",
  },

  VENUSAUR: {
    name: "VENUSAUR",
    level: 50,
    stats: {
      maxHp: 100,
      attack: 82,
      defense: 83,
      speed: 80,
    },
    moves: [MOVES.TACKLE, MOVES.RAZOR_LEAF, MOVES.TAKE_DOWN, MOVES.POWER_WHIP],
    spriteUrl: "assets/VENUSAUR.png",
  },

  CHARIZARD: {
    name: "CHARIZARD",
    level: 50,
    stats: {
      maxHp: 100,
      attack: 84,
      defense: 78,
      speed: 100,
    },
    moves: [
      MOVES.FLAMETHROWER,
      MOVES.FIRE_BLAST,
      MOVES.DRAGON_CLAW,
      MOVES.TAKE_DOWN,
    ],
    spriteUrl: "assets/CHARIZARD.png",
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get Pokemon config by name
 */
export function getPokemon(name: string): PokemonConfig | undefined {
  return POKEMON_DB[name.toUpperCase()];
}

/**
 * Get all Pokemon names
 */
export function getAllPokemonNames(): string[] {
  return Object.keys(POKEMON_DB);
}

/**
 * Create a Pokemon instance from config
 */
export function createPokemonFromName(name: string): PokemonConfig | null {
  const config = getPokemon(name);
  if (!config) {
    console.warn(`Pokemon "${name}" not found in database`);
    return null;
  }
  return { ...config };
}
