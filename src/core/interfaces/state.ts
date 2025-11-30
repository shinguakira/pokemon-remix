/**
 * State interfaces
 */

import type { PokemonConfig } from "./pokemon";

// =============================================================================
// State Interfaces
// =============================================================================

export interface PlayerState {
  name: string;
  pokemon: PokemonConfig[];
  position: { x: number; y: number; map: string };
  money: number;
  badges: string[];
}

export interface NPCState {
  id: string;
  name: string;
  title: string;
  defeated: boolean;
  pokemon: string[];
  spriteUrl: string;
  battleSpriteUrl: string;
  dialogue: {
    beforeBattle: string;
    afterDefeat: string;
  };
  rewards: {
    money: number;
    exp: number;
  };
}

export interface GameFlags {
  tutorialComplete: boolean;
  firstBattleWon: boolean;
  [key: string]: boolean;
}

export interface GameStateData {
  player: PlayerState;
  npcs: Map<string, NPCState>;
  flags: GameFlags;
  currentMap: string;
}
