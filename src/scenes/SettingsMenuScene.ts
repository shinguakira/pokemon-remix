/**
 * SettingsMenuScene - In-game pause/settings menu
 * Pokemon GBA-style menu overlay
 */

import { type IGameContext, gameContext } from '@game/core/GameContext';
import type { KeyEvent, P5Instance, PokemonConfig } from '@game/core/interfaces';
import { POKEMON_DB } from '@game/data/pokemon';
import { debugMode } from '@game/debug/DebugMode';

// =============================================================================
// Types
// =============================================================================

type MenuState = 'main' | 'pokemon' | 'pokemon-detail' | 'bag' | 'option' | 'debug' | 'edit-party';

// =============================================================================
// Constants
// =============================================================================

const MAIN_MENU_ITEMS = ['POKéMON', 'BAG', 'SAVE', 'OPTION', 'EXIT'];
const DEBUG_MENU_ITEMS = [
	'SWITCH POKEMON',
	'HEAL ALL',
	'TOGGLE NPC DEFEATED',
	'EDIT PARTY',
	'BACK',
];

// =============================================================================
// SettingsMenuScene Class
// =============================================================================

export class SettingsMenuScene {
	private p: P5Instance;
	private setPlayerFreeze: (freeze: boolean) => void;
	private ctx: IGameContext = gameContext;

	// State
	isOpen = false;
	private currentState: MenuState = 'main';
	private selectedIndex = 0;
	private selectedPokemonIndex = 0;
	private cursorBlink = 0;

	// Menu dimensions
	private menuWidth = 120;
	private menuX: number = 512 - 130;
	private menuY = 10;
	private itemHeight = 28;

	// Animation
	private slideOffset = 150;
	private targetSlideOffset = 0;

	// Edit party state
	private editPartySlots: (string | null)[] = [null, null, null, null, null, null];
	private editPartySelectedSlot = 0;
	private editPartyPokemonList: string[] = [];
	private editPartyPokemonIndex = 0;
	private editPartyMode: 'slot' | 'pokemon' = 'slot';

	constructor(p: P5Instance, setPlayerFreeze: (freeze: boolean) => void) {
		this.p = p;
		this.setPlayerFreeze = setPlayerFreeze;
	}

	open(): void {
		this.isOpen = true;
		this.currentState = 'main';
		this.selectedIndex = 0;
		this.slideOffset = 150;
		this.targetSlideOffset = 0;
		this.setPlayerFreeze(true);
	}

	close(): void {
		this.isOpen = false;
		this.slideOffset = 150;
		this.setPlayerFreeze(false);
	}

	toggle(): void {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	}

	update(): void {
		if (!this.isOpen) return;
		this.cursorBlink += this.p.deltaTime * 0.005;
		if (this.cursorBlink > 1) this.cursorBlink = 0;
		this.slideOffset += (this.targetSlideOffset - this.slideOffset) * 0.2;
	}

	draw(): void {
		if (!this.isOpen) return;

		const p = this.p;
		p.push();
		p.fill(0, 0, 0, 100);
		p.noStroke();
		p.rect(0, 0, 512, 384);
		p.pop();

		switch (this.currentState) {
			case 'main':
				this.drawMainMenu();
				break;
			case 'pokemon':
				this.drawPokemonScreen();
				break;
			case 'pokemon-detail':
				this.drawPokemonDetail();
				break;
			case 'bag':
				this.drawBagScreen();
				break;
			case 'option':
				this.drawOptionScreen();
				break;
			case 'debug':
				this.drawDebugScreen();
				break;
			case 'edit-party':
				this.drawEditPartyScreen();
				break;
		}
	}

	private drawMainMenu(): void {
		const p = this.p;
		const items = [...MAIN_MENU_ITEMS];
		if (debugMode.isEnabled()) {
			items.push('DEBUG');
		}

		const menuHeight = items.length * this.itemHeight + 20;
		const x = this.menuX + this.slideOffset;
		const y = this.menuY;

		this.drawPanel(x, y, this.menuWidth, menuHeight);

		p.push();
		p.fill(0);
		p.textSize(16);
		p.textAlign(p.LEFT, p.TOP);

		for (let i = 0; i < items.length; i++) {
			const itemY = y + 12 + i * this.itemHeight;
			if (i === this.selectedIndex && this.cursorBlink < 0.7) {
				p.text('▶', x + 8, itemY);
			}
			p.text(items[i], x + 26, itemY);
		}
		p.pop();
	}

	private drawPokemonScreen(): void {
		const p = this.p;
		this.drawPanel(20, 20, 472, 344);

		p.push();
		p.fill(0);
		p.textSize(18);
		p.textAlign(p.CENTER, p.TOP);
		p.text('POKéMON', 256, 30);

		const party = this.ctx.getPlayerPokemon();
		this.drawPokemonSlot(30, 60, 180, 120, party[0], 0, true);

		for (let i = 1; i < 6; i++) {
			const slotY = 60 + (i - 1) * 52;
			this.drawPokemonSlot(230, slotY, 250, 48, party[i] || null, i, false);
		}

		p.textSize(14);
		p.textAlign(p.LEFT, p.TOP);
		p.text('Choose a POKéMON.  [ENTER] Select  [ESC] Back', 30, 330);
		p.pop();
	}

	private drawPokemonSlot(
		x: number,
		y: number,
		w: number,
		h: number,
		pokemon: PokemonConfig | null,
		index: number,
		isActive: boolean
	): void {
		const p = this.p;
		const isSelected = this.selectedPokemonIndex === index;

		p.push();
		p.fill(isSelected ? p.color(200, 220, 255) : p.color(240, 240, 240));
		p.stroke(0);
		p.strokeWeight(2);
		p.rect(x, y, w, h, 4);
		p.pop();

		if (!pokemon) {
			p.push();
			p.fill(150);
			p.textSize(12);
			p.textAlign(p.CENTER, p.CENTER);
			p.text('(empty)', x + w / 2, y + h / 2);
			p.pop();
			return;
		}

		p.push();
		p.fill(0);
		p.textSize(isActive ? 14 : 12);
		p.textAlign(p.LEFT, p.TOP);
		p.text(pokemon.name, x + 10, y + 8);
		p.text(`Lv.${pokemon.level}`, x + (isActive ? 10 : w - 60), y + (isActive ? 28 : 8));

		const hpBarX = x + 10;
		const hpBarY = y + (isActive ? 70 : 28);
		const hpBarWidth = isActive ? 140 : 100;
		const hpBarHeight = isActive ? 10 : 6;
		const hpPercent = 1;

		p.fill(80);
		p.rect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
		p.fill(0, 200, 0);
		p.rect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);

		if (isActive) {
			p.textSize(12);
			p.fill(0);
			p.text(`${pokemon.stats.maxHp} / ${pokemon.stats.maxHp}`, hpBarX, hpBarY + 14);
		}

		if (isSelected && this.cursorBlink < 0.7) {
			p.fill(0);
			p.textSize(14);
			p.text('▶', x - 16, y + h / 2 - 7);
		}
		p.pop();
	}

	private drawPokemonDetail(): void {
		const p = this.p;
		const party = this.ctx.getPlayerPokemon();
		const pokemon = party[this.selectedPokemonIndex];

		if (!pokemon) {
			this.currentState = 'pokemon';
			return;
		}

		this.drawPanel(20, 20, 472, 344);

		p.push();
		p.fill(0);
		p.textSize(20);
		p.textAlign(p.LEFT, p.TOP);
		p.text(pokemon.name, 40, 35);
		p.textSize(16);
		p.text(`Lv. ${pokemon.level}`, 400, 38);

		p.textSize(14);
		p.text('HP', 200, 80);
		p.fill(80);
		p.rect(240, 80, 150, 14);
		p.fill(0, 200, 0);
		p.rect(240, 80, 150, 14);

		p.fill(0);
		p.text(`${pokemon.stats.maxHp}/${pokemon.stats.maxHp}`, 400, 80);
		p.text(`ATK    ${pokemon.stats.attack}`, 200, 110);
		p.text(`DEF    ${pokemon.stats.defense}`, 200, 135);

		p.textSize(16);
		p.text('MOVES:', 40, 180);
		p.textSize(14);

		pokemon.moves.forEach((move, i) => {
			p.text(`${i + 1}. ${move.name}`, 60, 210 + i * 25);
			p.text(`PWR: ${move.power}`, 250, 210 + i * 25);
		});

		if (debugMode.isEnabled()) {
			p.fill(100);
			p.text('[DEBUG]  D: Set Active   H: Full Heal', 40, 320);
		}

		p.fill(0);
		p.textSize(12);
		p.text('[ESC] Back', 40, 345);
		p.pop();
	}

	private drawBagScreen(): void {
		const p = this.p;
		this.drawPanel(20, 20, 472, 344);

		p.push();
		p.fill(0);
		p.textSize(18);
		p.textAlign(p.CENTER, p.TOP);
		p.text('BAG', 256, 35);

		p.textSize(14);
		p.textAlign(p.LEFT, p.TOP);
		p.text('ITEMS:', 40, 80);
		p.text('POTION  x3', 60, 110);
		p.text('POKEBALL  x5', 60, 135);

		p.textSize(12);
		p.text('[ESC] Back', 40, 345);
		p.pop();
	}

	private drawOptionScreen(): void {
		const p = this.p;
		this.drawPanel(20, 20, 472, 344);

		p.push();
		p.fill(0);
		p.textSize(18);
		p.textAlign(p.CENTER, p.TOP);
		p.text('OPTION', 256, 35);

		p.textSize(14);
		p.textAlign(p.LEFT, p.TOP);
		p.text('TEXT SPEED', 40, 80);
		p.text('SLOW   MID   ▶FAST', 200, 80);

		p.text('CONTROLS:', 40, 130);
		p.textSize(12);
		p.text('ARROWS  - Move', 60, 160);
		p.text('ENTER   - Confirm / Talk', 60, 180);
		p.text('ESC     - Menu / Back', 60, 200);
		p.text('SHIFT   - Toggle Debug', 60, 220);

		p.text('[ESC] Back', 40, 345);
		p.pop();
	}

	private drawDebugScreen(): void {
		const p = this.p;
		this.drawPanel(20, 20, 472, 344);

		p.push();
		p.fill(0);
		p.textSize(18);
		p.textAlign(p.CENTER, p.TOP);
		p.text('DEBUG OPTIONS', 256, 35);

		p.textSize(14);
		p.textAlign(p.LEFT, p.TOP);

		DEBUG_MENU_ITEMS.forEach((item, i) => {
			const itemY = 80 + i * 28;
			if (i === this.selectedIndex && this.cursorBlink < 0.7) {
				p.text('▶', 40, itemY);
			}
			p.text(item, 60, itemY);
		});

		p.text('───────────────────────────', 40, 200);
		p.text('AVAILABLE POKEMON:', 40, 230);

		const pokemonNames = Object.keys(POKEMON_DB);
		pokemonNames.forEach((name, i) => {
			const col = i % 3;
			const row = Math.floor(i / 3);
			p.text(`[${i + 1}] ${name}`, 60 + col * 140, 260 + row * 25);
		});

		p.textSize(12);
		p.text('Press 1-6 to quick-select Pokemon', 40, 320);
		p.text('[ESC] Back', 40, 345);
		p.pop();
	}

	private drawPanel(x: number, y: number, w: number, h: number): void {
		const p = this.p;
		p.push();
		p.fill(0, 0, 0, 50);
		p.noStroke();
		p.rect(x + 4, y + 4, w, h, 6);
		p.fill(255);
		p.stroke(0);
		p.strokeWeight(3);
		p.rect(x, y, w, h, 6);
		p.pop();
	}

	onKeyPressed(event: KeyEvent): boolean {
		if (!this.isOpen) return false;

		const { key, keyCode } = event;

		if (keyCode === 27) {
			switch (this.currentState) {
				case 'main':
					this.close();
					break;
				case 'pokemon-detail':
					this.currentState = 'pokemon';
					break;
				case 'pokemon':
					this.currentState = 'main';
					this.selectedIndex = 0; // POKéMON is at index 0
					break;
				case 'bag':
					this.currentState = 'main';
					this.selectedIndex = 1; // BAG is at index 1
					break;
				case 'option':
					this.currentState = 'main';
					this.selectedIndex = 3; // OPTION is at index 3
					break;
				case 'edit-party':
					this.saveEditParty();
					this.currentState = 'debug';
					this.selectedIndex = 3; // EDIT PARTY is at index 3 in debug menu
					break;
				case 'debug':
					this.currentState = 'main';
					this.selectedIndex = 5; // DEBUG is at index 5 in main menu
					break;
			}
			return true;
		}

		switch (this.currentState) {
			case 'main':
				return this.handleMainMenuInput(keyCode);
			case 'pokemon':
				return this.handlePokemonScreenInput(keyCode);
			case 'pokemon-detail':
				return this.handlePokemonDetailInput(key);
			case 'debug':
				return this.handleDebugInput(keyCode, key);
			case 'edit-party':
				return this.handleEditPartyInput(keyCode);
			default:
				return true;
		}
	}

	private handleMainMenuInput(keyCode: number): boolean {
		const items = [...MAIN_MENU_ITEMS];
		if (debugMode.isEnabled()) items.push('DEBUG');

		if (keyCode === 38) {
			this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
		} else if (keyCode === 40) {
			this.selectedIndex = (this.selectedIndex + 1) % items.length;
		} else if (keyCode === 13) {
			this.selectMenuItem(items[this.selectedIndex]);
		}
		return true;
	}

	private selectMenuItem(item: string): void {
		switch (item) {
			case 'POKéMON':
				this.currentState = 'pokemon';
				this.selectedPokemonIndex = 0;
				break;
			case 'BAG':
				this.currentState = 'bag';
				break;
			case 'SAVE':
				this.ctx.save();
				break;
			case 'OPTION':
				this.currentState = 'option';
				break;
			case 'EXIT':
				this.close();
				break;
			case 'DEBUG':
				this.currentState = 'debug';
				this.selectedIndex = 0;
				break;
		}
	}

	private handlePokemonScreenInput(keyCode: number): boolean {
		const party = this.ctx.getPlayerPokemon();

		if (keyCode === 38) {
			this.selectedPokemonIndex = Math.max(0, this.selectedPokemonIndex - 1);
		} else if (keyCode === 40) {
			this.selectedPokemonIndex = Math.min(5, this.selectedPokemonIndex + 1);
		} else if (keyCode === 13) {
			if (party[this.selectedPokemonIndex]) {
				this.currentState = 'pokemon-detail';
			}
		}
		return true;
	}

	private handlePokemonDetailInput(_key: string): boolean {
		return true;
	}

	private handleDebugInput(keyCode: number, key: string): boolean {
		if (keyCode === 38) {
			this.selectedIndex =
				(this.selectedIndex - 1 + DEBUG_MENU_ITEMS.length) % DEBUG_MENU_ITEMS.length;
		} else if (keyCode === 40) {
			this.selectedIndex = (this.selectedIndex + 1) % DEBUG_MENU_ITEMS.length;
		} else if (keyCode === 13) {
			this.executeDebugAction(DEBUG_MENU_ITEMS[this.selectedIndex]);
		}

		const num = Number.parseInt(key);
		if (num >= 1 && num <= 6) {
			const pokemonNames = Object.keys(POKEMON_DB);
			if (num <= pokemonNames.length) {
				console.log(`[Debug] Would switch to ${pokemonNames[num - 1]}`);
			}
		}
		return true;
	}

	private executeDebugAction(action: string): void {
		switch (action) {
			case 'SWITCH POKEMON':
				this.currentState = 'pokemon';
				this.selectedPokemonIndex = 0;
				break;
			case 'HEAL ALL':
				console.log('[Debug] Heal all Pokemon');
				break;
			case 'TOGGLE NPC DEFEATED': {
				const npc = this.ctx.getNPC('gentleman_01');
				if (npc) {
					npc.defeated = !npc.defeated;
					console.log(`[Debug] NPC defeated: ${npc.defeated}`);
				}
				break;
			}
			case 'EDIT PARTY':
				this.openEditParty();
				break;
			case 'BACK':
				this.currentState = 'main';
				this.selectedIndex = 0;
				break;
		}
	}

	// ===========================================================================
	// Edit Party Methods
	// ===========================================================================

	private openEditParty(): void {
		this.currentState = 'edit-party';
		this.editPartyPokemonList = Object.keys(POKEMON_DB);
		this.editPartySelectedSlot = 0;
		this.editPartyPokemonIndex = 0;
		this.editPartyMode = 'slot';

		// Initialize slots with current party
		const currentParty = this.ctx.getPlayerPokemon();
		this.editPartySlots = [null, null, null, null, null, null];
		currentParty.forEach((pokemon, i) => {
			if (i < 6) {
				this.editPartySlots[i] = pokemon.name;
			}
		});
	}

	private drawEditPartyScreen(): void {
		const p = this.p;
		this.drawPanel(20, 20, 472, 344);

		p.push();
		p.fill(0);
		p.textSize(18);
		p.textAlign(p.CENTER, p.TOP);
		p.text('EDIT PARTY', 256, 30);

		// Draw party slots on left
		p.textSize(14);
		p.textAlign(p.LEFT, p.TOP);
		p.text('YOUR PARTY:', 40, 60);

		for (let i = 0; i < 6; i++) {
			const slotY = 85 + i * 32;
			const isSelected = this.editPartyMode === 'slot' && this.editPartySelectedSlot === i;

			// Slot background
			p.fill(isSelected ? p.color(200, 220, 255) : p.color(240, 240, 240));
			p.stroke(isSelected ? p.color(0, 100, 200) : p.color(100));
			p.strokeWeight(isSelected ? 2 : 1);
			p.rect(40, slotY, 180, 28, 4);

			// Slot content
			p.fill(0);
			p.noStroke();
			const slotText = this.editPartySlots[i] || '(empty)';
			p.text(`${i + 1}. ${slotText}`, 50, slotY + 7);

			// Cursor
			if (isSelected && this.cursorBlink < 0.7) {
				p.text('▶', 28, slotY + 7);
			}
		}

		// Draw available Pokemon on right
		p.text('AVAILABLE:', 260, 60);

		for (let i = 0; i < this.editPartyPokemonList.length; i++) {
			const itemY = 85 + i * 32;
			const isSelected = this.editPartyMode === 'pokemon' && this.editPartyPokemonIndex === i;

			// Item background
			p.fill(isSelected ? p.color(255, 220, 200) : p.color(240, 240, 240));
			p.stroke(isSelected ? p.color(200, 100, 0) : p.color(100));
			p.strokeWeight(isSelected ? 2 : 1);
			p.rect(260, itemY, 180, 28, 4);

			// Item content
			p.fill(0);
			p.noStroke();
			p.text(this.editPartyPokemonList[i], 270, itemY + 7);

			// Cursor
			if (isSelected && this.cursorBlink < 0.7) {
				p.text('▶', 248, itemY + 7);
			}
		}

		// Instructions
		p.fill(0);
		p.textSize(12);
		p.text('← → Switch columns   ↑ ↓ Navigate', 40, 300);
		p.text('ENTER: Add   DEL: Remove   [S] SAVE   ESC: Back', 40, 320);
		p.fill(200, 0, 0);
		p.textSize(11);
		p.text('Press S to save changes!', 40, 340);
		p.pop();
	}

	private handleEditPartyInput(keyCode: number): boolean {
		const slotCount = 6;
		const pokemonCount = this.editPartyPokemonList.length;

		// Up arrow
		if (keyCode === 38) {
			if (this.editPartyMode === 'slot') {
				this.editPartySelectedSlot = (this.editPartySelectedSlot - 1 + slotCount) % slotCount;
			} else {
				this.editPartyPokemonIndex = (this.editPartyPokemonIndex - 1 + pokemonCount) % pokemonCount;
			}
		}
		// Down arrow
		else if (keyCode === 40) {
			if (this.editPartyMode === 'slot') {
				this.editPartySelectedSlot = (this.editPartySelectedSlot + 1) % slotCount;
			} else {
				this.editPartyPokemonIndex = (this.editPartyPokemonIndex + 1) % pokemonCount;
			}
		}
		// Left arrow - switch to slot mode
		else if (keyCode === 37) {
			this.editPartyMode = 'slot';
		}
		// Right arrow - switch to pokemon mode
		else if (keyCode === 39) {
			this.editPartyMode = 'pokemon';
		}
		// Enter - add pokemon to slot
		else if (keyCode === 13) {
			if (this.editPartyMode === 'pokemon') {
				const selectedPokemon = this.editPartyPokemonList[this.editPartyPokemonIndex];
				this.editPartySlots[this.editPartySelectedSlot] = selectedPokemon;
				this.editPartyMode = 'slot';
				// Move to next slot
				if (this.editPartySelectedSlot < 5) {
					this.editPartySelectedSlot++;
				}
			}
		}
		// Delete/Backspace - remove pokemon from slot
		else if (keyCode === 46 || keyCode === 8) {
			if (this.editPartyMode === 'slot') {
				this.editPartySlots[this.editPartySelectedSlot] = null;
			}
		}
		// S key - SAVE party
		else if (keyCode === 83) {
			this.saveEditParty();
		}

		return true;
	}

	private saveEditParty(): void {
		const newParty: PokemonConfig[] = [];
		for (const slotName of this.editPartySlots) {
			if (slotName && POKEMON_DB[slotName]) {
				newParty.push({ ...POKEMON_DB[slotName] });
			}
		}
		if (newParty.length > 0) {
			this.ctx.setPlayerPokemon(newParty);
		}
	}
}
