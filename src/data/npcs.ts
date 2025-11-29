/**
 * NPC data definitions
 * All NPC configurations loaded into GameState
 */

import type { NPCState } from "../state/GameState";

// =============================================================================
// NPC Database
// =============================================================================

export const NPC_DB: Record<string, Omit<NPCState, "defeated">> = {
  gentleman_01: {
    id: "gentleman_01",
    name: "Mark",
    title: "Gentleman",
    pokemon: ["VENUSAUR"],
    spriteUrl: "assets/trainer_GENTLEMAN.png",
    battleSpriteUrl: "assets/GENTLEMAN.png",
    dialogue: {
      beforeBattle: "I see that you need training.\nLet's battle!",
      afterDefeat: "You already defeated me...",
    },
    rewards: {
      money: 1000,
      exp: 500,
    },
  },

  // Add more NPCs here
  youngster_01: {
    id: "youngster_01",
    name: "Joey",
    title: "Youngster",
    pokemon: ["RATTATA"], // Would need to add RATTATA to pokemon.ts
    spriteUrl: "assets/trainer_YOUNGSTER.png",
    battleSpriteUrl: "assets/YOUNGSTER.png",
    dialogue: {
      beforeBattle: "My RATTATA is in the top percentage of RATTATA!",
      afterDefeat: "Your Pokemon are amazing!",
    },
    rewards: {
      money: 200,
      exp: 150,
    },
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get NPC definition by ID
 */
export function getNPCDefinition(
  id: string
): Omit<NPCState, "defeated"> | undefined {
  return NPC_DB[id];
}

/**
 * Get all NPC IDs
 */
export function getAllNPCIds(): string[] {
  return Object.keys(NPC_DB);
}

/**
 * Create initial NPC state from definition
 */
export function createNPCState(id: string): NPCState | null {
  const definition = getNPCDefinition(id);
  if (!definition) {
    console.warn(`NPC "${id}" not found in database`);
    return null;
  }
  return {
    ...definition,
    defeated: false,
  };
}
