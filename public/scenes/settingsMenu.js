import { debugMode } from "../entities/debugMode.js";
import { gameState } from "../entities/gameState.js";
import { POKEMON_DATA } from "../entities/pokemon-data.js";
import { makePokemon } from "../entities/pokemon.js";

const MENU_STATES = {
  MAIN: "main",
  POKEMON: "pokemon",
  POKEMON_DETAIL: "pokemon-detail",
  BAG: "bag",
  OPTION: "option",
  DEBUG: "debug",
};

const MAIN_MENU_ITEMS = ["POKéMON", "BAG", "SAVE", "OPTION", "EXIT"];
const DEBUG_MENU_ITEMS = [
  "SWITCH POKEMON",
  "HEAL ALL",
  "TOGGLE NPC DEFEATED",
  "BACK",
];

export function makeSettingsMenu(p, setScene, world, battle) {
  return {
    isOpen: false,
    currentState: MENU_STATES.MAIN,
    selectedIndex: 0,
    cursorBlink: 0,

    // Menu dimensions
    menuWidth: 120,
    menuX: 512 - 130, // Right aligned
    menuY: 10,
    itemHeight: 28,

    // Pokemon detail view
    selectedPokemonIndex: 0,

    // Animation
    slideOffset: 150,
    targetSlideOffset: 0,

    open() {
      this.isOpen = true;
      this.currentState = MENU_STATES.MAIN;
      this.selectedIndex = 0;
      this.slideOffset = 150;
      this.targetSlideOffset = 0;
      // Freeze player movement
      if (world && world.player) {
        world.player.freeze = true;
      }
    },

    close() {
      this.isOpen = false;
      this.slideOffset = 150;
      // Unfreeze player movement
      if (world && world.player) {
        world.player.freeze = false;
      }
    },

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    update() {
      if (!this.isOpen) return;

      // Cursor blink animation
      this.cursorBlink += p.deltaTime * 0.005;
      if (this.cursorBlink > 1) this.cursorBlink = 0;

      // Slide animation
      this.slideOffset += (this.targetSlideOffset - this.slideOffset) * 0.2;
    },

    draw() {
      if (!this.isOpen) return;

      // Semi-transparent overlay
      p.push();
      p.fill(0, 0, 0, 100);
      p.noStroke();
      p.rect(0, 0, 512, 384);
      p.pop();

      switch (this.currentState) {
        case MENU_STATES.MAIN:
          this.drawMainMenu();
          break;
        case MENU_STATES.POKEMON:
          this.drawPokemonScreen();
          break;
        case MENU_STATES.POKEMON_DETAIL:
          this.drawPokemonDetail();
          break;
        case MENU_STATES.BAG:
          this.drawBagScreen();
          break;
        case MENU_STATES.OPTION:
          this.drawOptionScreen();
          break;
        case MENU_STATES.DEBUG:
          this.drawDebugScreen();
          break;
      }
    },

    drawMainMenu() {
      const items = [...MAIN_MENU_ITEMS];
      if (debugMode.enabled) {
        items.push("DEBUG");
      }

      const menuHeight = items.length * this.itemHeight + 20;
      const x = this.menuX + this.slideOffset;
      const y = this.menuY;

      // Menu panel
      this.drawPanel(x, y, this.menuWidth, menuHeight);

      // Menu items
      p.push();
      p.fill(0);
      p.textSize(16);
      p.textAlign(p.LEFT, p.TOP);

      for (let i = 0; i < items.length; i++) {
        const itemY = y + 12 + i * this.itemHeight;

        // Draw cursor
        if (i === this.selectedIndex && this.cursorBlink < 0.7) {
          p.text("▶", x + 8, itemY);
        }

        // Draw item text
        p.text(items[i], x + 26, itemY);
      }
      p.pop();
    },

    drawPokemonScreen() {
      // Full screen Pokemon party view
      this.drawPanel(20, 20, 472, 344);

      p.push();
      p.fill(0);
      p.textSize(14);

      // Title
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(18);
      p.text("POKéMON", 256, 30);

      // Draw party slots
      const party = gameState.party;

      // First slot (active, larger, left side)
      this.drawPokemonSlot(30, 60, 180, 120, party[0], 0, true);

      // Slots 2-6 (right side, smaller)
      for (let i = 1; i < 6; i++) {
        const slotY = 60 + (i - 1) * 52;
        this.drawPokemonSlot(230, slotY, 250, 48, party[i] || null, i, false);
      }

      // Bottom instruction
      p.textSize(14);
      p.textAlign(p.LEFT, p.TOP);
      p.text("Choose a POKéMON.  [ENTER] Select  [ESC] Back", 30, 330);

      p.pop();
    },

    drawPokemonSlot(x, y, w, h, pokemon, index, isActive) {
      const isSelected = this.selectedPokemonIndex === index;

      // Slot background
      p.push();
      if (isSelected) {
        p.fill(200, 220, 255);
      } else {
        p.fill(240, 240, 240);
      }
      p.stroke(0);
      p.strokeWeight(2);
      p.rect(x, y, w, h, 4);
      p.pop();

      if (!pokemon) {
        p.push();
        p.fill(150);
        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
        p.text("(empty)", x + w / 2, y + h / 2);
        p.pop();
        return;
      }

      p.push();
      p.fill(0);
      p.textSize(isActive ? 14 : 12);
      p.textAlign(p.LEFT, p.TOP);

      // Pokemon name
      p.text(pokemon.name, x + 10, y + 8);

      // Level
      p.text(
        "Lv." + pokemon.level,
        x + (isActive ? 10 : w - 60),
        y + (isActive ? 28 : 8)
      );

      // HP Bar
      const hpBarX = x + 10;
      const hpBarY = y + (isActive ? 70 : 28);
      const hpBarWidth = isActive ? 140 : 100;
      const hpBarHeight = isActive ? 10 : 6;

      // HP bar background
      p.fill(80);
      p.rect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

      // HP bar fill
      const hpPercent = pokemon.currentHp / pokemon.maxHp;
      if (hpPercent > 0.5) {
        p.fill(0, 200, 0);
      } else if (hpPercent > 0.2) {
        p.fill(248, 184, 0);
      } else {
        p.fill(248, 32, 32);
      }
      p.rect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);

      // HP text
      if (isActive) {
        p.textSize(12);
        p.fill(0);
        p.text(pokemon.currentHp + " / " + pokemon.maxHp, hpBarX, hpBarY + 14);
      }

      // Active indicator
      if (isActive && index === gameState.activePokemonIndex) {
        p.textSize(10);
        p.text("▶ ACTIVE", x + 10, y + 100);
      }

      // Cursor for selection
      if (isSelected && this.cursorBlink < 0.7) {
        p.fill(0);
        p.textSize(14);
        p.text("▶", x - 16, y + h / 2 - 7);
      }

      p.pop();
    },

    drawPokemonDetail() {
      const pokemon = gameState.party[this.selectedPokemonIndex];
      if (!pokemon) {
        this.currentState = MENU_STATES.POKEMON;
        return;
      }

      this.drawPanel(20, 20, 472, 344);

      p.push();
      p.fill(0);

      // Header
      p.textSize(20);
      p.textAlign(p.LEFT, p.TOP);
      p.text(pokemon.name, 40, 35);
      p.textSize(16);
      p.text("Lv. " + pokemon.level, 400, 38);

      // Stats box
      p.textSize(14);
      p.text("HP", 200, 80);

      // HP Bar
      const hpBarWidth = 150;
      const hpPercent = pokemon.currentHp / pokemon.maxHp;
      p.fill(80);
      p.rect(240, 80, hpBarWidth, 14);
      if (hpPercent > 0.5) p.fill(0, 200, 0);
      else if (hpPercent > 0.2) p.fill(248, 184, 0);
      else p.fill(248, 32, 32);
      p.rect(240, 80, hpBarWidth * hpPercent, 14);

      p.fill(0);
      p.text(pokemon.currentHp + "/" + pokemon.maxHp, 400, 80);

      p.text("ATK    " + pokemon.attack, 200, 110);
      p.text("DEF    " + pokemon.defense, 200, 135);

      // Moves section
      p.textSize(16);
      p.text("MOVES:", 40, 180);
      p.textSize(14);

      for (let i = 0; i < pokemon.moves.length; i++) {
        const move = pokemon.moves[i];
        p.text(i + 1 + ". " + move.name, 60, 210 + i * 25);
        p.text("PWR: " + move.power, 250, 210 + i * 25);
      }

      // Debug options
      if (debugMode.enabled) {
        p.fill(100);
        p.text("[DEBUG]  D: Set Active   H: Full Heal", 40, 320);
      }

      p.fill(0);
      p.textSize(12);
      p.text("[ESC] Back", 40, 345);

      p.pop();
    },

    drawBagScreen() {
      this.drawPanel(20, 20, 472, 344);

      p.push();
      p.fill(0);
      p.textSize(18);
      p.textAlign(p.CENTER, p.TOP);
      p.text("BAG", 256, 35);

      p.textSize(14);
      p.textAlign(p.LEFT, p.TOP);
      p.text("ITEMS:", 40, 80);

      const items = gameState.items;
      let y = 110;
      for (const [name, count] of Object.entries(items)) {
        p.text(name.toUpperCase() + "  x" + count, 60, y);
        y += 25;
      }

      p.textSize(12);
      p.text("[ESC] Back", 40, 345);
      p.pop();
    },

    drawOptionScreen() {
      this.drawPanel(20, 20, 472, 344);

      p.push();
      p.fill(0);
      p.textSize(18);
      p.textAlign(p.CENTER, p.TOP);
      p.text("OPTION", 256, 35);

      p.textSize(14);
      p.textAlign(p.LEFT, p.TOP);

      const settings = gameState.settings;

      // Text Speed
      p.text("TEXT SPEED", 40, 80);
      this.drawOptionChoice(
        200,
        80,
        ["SLOW", "MID", "FAST"],
        settings.textSpeed
      );

      // Battle Scene
      p.text("BATTLE SCENE", 40, 115);
      this.drawOptionChoice(
        200,
        115,
        ["ON", "OFF"],
        settings.battleScene ? "ON" : "OFF"
      );

      // Sound
      p.text("SOUND", 40, 150);
      this.drawOptionChoice(
        200,
        150,
        ["MONO", "STEREO"],
        settings.sound.toUpperCase()
      );

      // Controls help
      p.text("CONTROLS:", 40, 200);
      p.textSize(12);
      p.text("ARROWS  - Move", 60, 230);
      p.text("ENTER   - Confirm / Talk", 60, 250);
      p.text("ESC     - Menu / Back", 60, 270);
      p.text("SHIFT   - Toggle Debug", 60, 290);

      p.text("[ESC] Back", 40, 345);
      p.pop();
    },

    drawOptionChoice(x, y, options, selected) {
      p.push();
      p.textSize(14);
      let offsetX = x;
      for (const opt of options) {
        if (opt.toLowerCase() === selected.toLowerCase()) {
          p.fill(0);
          p.text("▶" + opt, offsetX, y);
        } else {
          p.fill(120);
          p.text(" " + opt, offsetX, y);
        }
        offsetX += 70;
      }
      p.pop();
    },

    drawDebugScreen() {
      this.drawPanel(20, 20, 472, 344);

      p.push();
      p.fill(0);
      p.textSize(18);
      p.textAlign(p.CENTER, p.TOP);
      p.text("DEBUG OPTIONS", 256, 35);

      p.textSize(14);
      p.textAlign(p.LEFT, p.TOP);

      for (let i = 0; i < DEBUG_MENU_ITEMS.length; i++) {
        const itemY = 80 + i * 28;
        if (i === this.selectedIndex && this.cursorBlink < 0.7) {
          p.text("▶", 40, itemY);
        }
        p.text(DEBUG_MENU_ITEMS[i], 60, itemY);
      }

      // Quick Pokemon selector
      p.text("───────────────────────────", 40, 200);
      p.text("AVAILABLE POKEMON:", 40, 230);

      const pokemonNames = Object.keys(POKEMON_DATA);
      for (let i = 0; i < pokemonNames.length; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        p.text(
          "[" + (i + 1) + "] " + pokemonNames[i],
          60 + col * 140,
          260 + row * 25
        );
      }

      p.textSize(12);
      p.text("Press 1-6 to quick-select Pokemon", 40, 320);
      p.text("[ESC] Back", 40, 345);
      p.pop();
    },

    drawPanel(x, y, w, h) {
      p.push();
      // Shadow
      p.fill(0, 0, 0, 50);
      p.noStroke();
      p.rect(x + 4, y + 4, w, h, 6);

      // Panel background
      p.fill(255);
      p.stroke(0);
      p.strokeWeight(3);
      p.rect(x, y, w, h, 6);
      p.pop();
    },

    onKeyPressed(keyEvent) {
      if (!this.isOpen) return false;

      const key = keyEvent.key;
      const keyCode = keyEvent.keyCode;

      // ESC to go back or close
      if (keyCode === 27) {
        // ESC
        if (this.currentState === MENU_STATES.MAIN) {
          this.close();
        } else {
          this.currentState = MENU_STATES.MAIN;
          this.selectedIndex = 0;
        }
        return true;
      }

      switch (this.currentState) {
        case MENU_STATES.MAIN:
          return this.handleMainMenuInput(keyCode);
        case MENU_STATES.POKEMON:
          return this.handlePokemonScreenInput(keyCode, key);
        case MENU_STATES.POKEMON_DETAIL:
          return this.handlePokemonDetailInput(key);
        case MENU_STATES.DEBUG:
          return this.handleDebugInput(keyCode, key);
        default:
          return true;
      }
    },

    handleMainMenuInput(keyCode) {
      const items = [...MAIN_MENU_ITEMS];
      if (debugMode.enabled) items.push("DEBUG");

      if (keyCode === p.UP_ARROW) {
        this.selectedIndex =
          (this.selectedIndex - 1 + items.length) % items.length;
      } else if (keyCode === p.DOWN_ARROW) {
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
      } else if (keyCode === p.ENTER) {
        this.selectMenuItem(items[this.selectedIndex]);
      }
      return true;
    },

    selectMenuItem(item) {
      switch (item) {
        case "POKéMON":
          this.currentState = MENU_STATES.POKEMON;
          this.selectedPokemonIndex = 0;
          break;
        case "BAG":
          this.currentState = MENU_STATES.BAG;
          break;
        case "SAVE":
          gameState.save();
          // Could show "Game Saved!" message
          break;
        case "OPTION":
          this.currentState = MENU_STATES.OPTION;
          break;
        case "EXIT":
          this.close();
          break;
        case "DEBUG":
          this.currentState = MENU_STATES.DEBUG;
          this.selectedIndex = 0;
          break;
      }
    },

    handlePokemonScreenInput(keyCode, key) {
      const partySize = Math.max(gameState.party.length, 1);

      if (keyCode === p.UP_ARROW) {
        this.selectedPokemonIndex = Math.max(0, this.selectedPokemonIndex - 1);
      } else if (keyCode === p.DOWN_ARROW) {
        this.selectedPokemonIndex = Math.min(5, this.selectedPokemonIndex + 1);
      } else if (keyCode === p.ENTER) {
        if (gameState.party[this.selectedPokemonIndex]) {
          this.currentState = MENU_STATES.POKEMON_DETAIL;
        }
      }
      return true;
    },

    handlePokemonDetailInput(key) {
      if (debugMode.enabled) {
        if (key.toLowerCase() === "d") {
          // Set as active Pokemon
          gameState.setActivePokemon(this.selectedPokemonIndex);
          // Also update battle pokemon
          if (battle) {
            const pokemon = gameState.getActivePokemon();
            battle.playerPokemon = makePokemon({
              name: pokemon.name,
              level: pokemon.level,
              maxHp: pokemon.maxHp,
              attack: pokemon.attack,
              defense: pokemon.defense,
              moves: pokemon.moves,
            });
          }
        } else if (key.toLowerCase() === "h") {
          // Heal this Pokemon
          const pokemon = gameState.party[this.selectedPokemonIndex];
          if (pokemon) {
            pokemon.currentHp = pokemon.maxHp;
            pokemon.isFainted = false;
          }
        }
      }
      return true;
    },

    handleDebugInput(keyCode, key) {
      if (keyCode === p.UP_ARROW) {
        this.selectedIndex =
          (this.selectedIndex - 1 + DEBUG_MENU_ITEMS.length) %
          DEBUG_MENU_ITEMS.length;
      } else if (keyCode === p.DOWN_ARROW) {
        this.selectedIndex = (this.selectedIndex + 1) % DEBUG_MENU_ITEMS.length;
      } else if (keyCode === p.ENTER) {
        this.executeDebugAction(DEBUG_MENU_ITEMS[this.selectedIndex]);
      }

      // Number keys for quick Pokemon select
      const num = parseInt(key);
      if (num >= 1 && num <= 6) {
        const pokemonNames = Object.keys(POKEMON_DATA);
        if (num <= pokemonNames.length) {
          const pokemonData = POKEMON_DATA[pokemonNames[num - 1]];
          if (battle) {
            battle.playerPokemon = makePokemon(pokemonData);
          }
          // Also update game state party
          gameState.party[0] = makePokemon(pokemonData);
          gameState.activePokemonIndex = 0;
        }
      }

      return true;
    },

    executeDebugAction(action) {
      switch (action) {
        case "SWITCH POKEMON":
          this.currentState = MENU_STATES.POKEMON;
          this.selectedPokemonIndex = 0;
          break;
        case "HEAL ALL":
          gameState.healAllPokemon();
          if (battle) {
            battle.playerPokemon.currentHp = battle.playerPokemon.maxHp;
            battle.playerPokemon.isFainted = false;
          }
          break;
        case "TOGGLE NPC DEFEATED":
          if (world) {
            world.isNpcDefeated = !world.isNpcDefeated;
          }
          break;
        case "BACK":
          this.currentState = MENU_STATES.MAIN;
          this.selectedIndex = 0;
          break;
      }
    },
  };
}
