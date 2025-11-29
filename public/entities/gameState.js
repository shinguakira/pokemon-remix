import { POKEMON_DATA } from "./pokemon-data.js";
import { makePokemon } from "./pokemon.js";

// Centralized game state for player data, settings, and inventory
function makeGameState() {
  return {
    // Player's Pokemon party (max 6)
    party: [makePokemon(POKEMON_DATA.BLASTOISE)],

    // Currently active Pokemon for battle (index in party)
    activePokemonIndex: 0,

    // Items bag (placeholder structure)
    items: {
      potions: 3,
      pokeballs: 5,
    },

    // Game settings
    settings: {
      textSpeed: "fast", // "slow" | "mid" | "fast"
      battleScene: true,
      sound: "mono", // "mono" | "stereo"
    },

    // Stats tracking
    stats: {
      battlesWon: 0,
      battlesLost: 0,
      playTime: 0, // in seconds
    },

    // Get active Pokemon
    getActivePokemon() {
      return this.party[this.activePokemonIndex];
    },

    // Add Pokemon to party
    addPokemon(pokemonData) {
      if (this.party.length < 6) {
        this.party.push(makePokemon(pokemonData));
        return true;
      }
      return false;
    },

    // Set active Pokemon by index
    setActivePokemon(index) {
      if (index >= 0 && index < this.party.length) {
        this.activePokemonIndex = index;
        return true;
      }
      return false;
    },

    // Heal all Pokemon
    healAllPokemon() {
      for (const pokemon of this.party) {
        pokemon.currentHp = pokemon.maxHp;
        pokemon.isFainted = false;
      }
    },

    // Save to localStorage
    save() {
      const saveData = {
        party: this.party.map((p) => ({
          name: p.name,
          currentHp: p.currentHp,
        })),
        activePokemonIndex: this.activePokemonIndex,
        items: this.items,
        settings: this.settings,
        stats: this.stats,
      };
      localStorage.setItem("pokemon-remix-save", JSON.stringify(saveData));
    },

    // Load from localStorage
    load() {
      const saveStr = localStorage.getItem("pokemon-remix-save");
      if (saveStr) {
        try {
          const saveData = JSON.parse(saveStr);
          // Restore party
          if (saveData.party) {
            this.party = saveData.party
              .map((saved) => {
                const data = POKEMON_DATA[saved.name];
                if (data) {
                  const pokemon = makePokemon(data);
                  pokemon.currentHp = saved.currentHp;
                  return pokemon;
                }
                return null;
              })
              .filter((p) => p !== null);
          }
          if (saveData.activePokemonIndex !== undefined) {
            this.activePokemonIndex = saveData.activePokemonIndex;
          }
          if (saveData.items) this.items = saveData.items;
          if (saveData.settings) this.settings = saveData.settings;
          if (saveData.stats) this.stats = saveData.stats;
          return true;
        } catch (e) {
          console.error("Failed to load save:", e);
        }
      }
      return false;
    },
  };
}

export const gameState = makeGameState();
