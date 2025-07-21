import { makeDialogBox } from "../entities/dialogBox.js";
import { makePokemon } from "../entities/pokemon.js";
import { POKEMON_DATA } from "../entities/pokemon-data.js";

const states = {
  default: "default",
  introNpc: "intro-npc",
  introNpcPokemon: "intro-npc-pokemon",
  introPlayerPokemon: "intro-player-pokemon",
  playerTurn: "player-turn",
  playerAttack: "player-attack",
  npcTurn: "npc-turn",
  battleEnd: "battle-end",
  winnerDeclared: "winner-declared",
};

export function makeBattle(p, setScene, world) {
  return {
    dialogBox: makeDialogBox(p, 0, 288),
    currentState: "default",
    npc: {
      x: 350,
      y: 20,
      spriteRef: null,
    },
    npcPokemon: makePokemon(POKEMON_DATA.VENUSAUR),
    playerPokemon: makePokemon(POKEMON_DATA.BLASTOISE),
    sprites: {
      npc: null,
      npcPokemon: null,
      playerPokemon: null,
      playerDataBox: null,
      npcDataBox: null,
    },
    dataBoxPositions: {
      player: { x: 510, initialX: 510, y: 220, nameX: 38, nameY: 30, healthBarX: 136, healthBarY: 40 },
      npc: { x: -300, initialX: -300, y: 40, nameX: 15, nameY: 30, healthBarX: 118, healthBarY: 40 },
    },
    pokemonPositions: {
      player: { x: -170, initialX: -170, finalX: 20, y: 128 },
      npc: { x: 600, initialX: 600, finalX: 310, y: 20 },
    },
    selectedMoveIndex: -1,

    drawDataBox(pokemon, position, sprite) {
      p.image(sprite, position.x, position.y);
      p.text(
        pokemon.name,
        position.x + position.nameX,
        position.y + position.nameY
      );

      p.push();
      p.angleMode(p.DEGREES);
      p.rotate(360);
      p.noStroke();
      const healthBarLength = (pokemon.currentHp / pokemon.maxHp) * 96;
      if (healthBarLength > 50) {
        p.fill(0, 200, 0);
      } else if (healthBarLength < 20) {
        p.fill(200, 0, 0);
      } else {
        p.fill(255, 165, 0);
      }
      p.rect(
        position.x + position.healthBarX,
        position.y + position.healthBarY,
        healthBarLength,
        6
      );
      p.pop();
    },
    async handlePlayerAttack() {
      this.dialogBox.clearText();
      this.dialogBox.displayText(
        `${this.playerPokemon.name} used ${this.playerPokemon.moves[this.selectedMoveIndex].name}!`,
        async () => {
          this.playerPokemon.attackMove(this.npcPokemon, this.selectedMoveIndex);
          if (this.npcPokemon.isFainted) {
            this.currentState = states.battleEnd;
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            this.dialogBox.clearText();
            this.currentState = states.npcTurn;
          }
        }
      );
    },
    async handleNpcAttack() {
      const moveIndex = Math.floor(Math.random() * this.npcPokemon.moves.length);
      this.dialogBox.clearText();
      this.dialogBox.displayText(
        `The foe's ${this.npcPokemon.name} used ${this.npcPokemon.moves[moveIndex].name}!`,
        async () => {
          this.npcPokemon.attackMove(this.playerPokemon, moveIndex);
          if (this.playerPokemon.isFainted) {
            this.currentState = states.battleEnd;
          }
          else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            this.selectedMoveIndex = -1;
            this.currentState = states.playerTurn;
          }
        }
      );
    },
    load() {
      this.battleBackgroundImage = p.loadImage("assets/battle-background.png");
      this.sprites.npc = p.loadImage("assets/GENTLEMAN.png");
      this.sprites.npcPokemon = p.loadImage("assets/VENUSAUR.png");
      this.sprites.playerPokemon = p.loadImage("assets/BLASTOISE.png");
      this.sprites.playerDataBox = p.loadImage("assets/databox_thin.png");
      this.sprites.npcDataBox = p.loadImage("assets/databox_thin_foe.png");
      this.dialogBox.load();
    },
    setup() {
      this.dialogBox.displayText(
        "Mark the gentleman wants to battle !",
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          this.currentState = states.introNpc;
          this.dialogBox.clearText();
          this.dialogBox.displayText(
            `He sends out a ${this.npcPokemon.name}!`, 
            async () => {
              this.currentState = states.introNpcPokemon;
              await new Promise((resolve) => setTimeout(resolve, 1000));
              this.dialogBox.clearText();
              this.dialogBox.displayText(
                `Go! ${this.playerPokemon.name}!`, 
                async () => {
                  this.currentState = states.introPlayerPokemon;
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  this.dialogBox.clearText();
                  this.dialogBox.displayText(
                    `What will ${this.playerPokemon.name} do?`, 
                    async () => {
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      this.currentState = states.playerTurn;
                    }
                  );
                }
              );
            }
          );
        }
      );
      this.dialogBox.setVisibility(true);
    },
    update() {
      if (this.currentState === states.introNpc) {
        this.npc.x += 0.5 * p.deltaTime;
      }

      if (
        this.currentState === states.introNpcPokemon &&
        this.pokemonPositions.npc.x >= this.pokemonPositions.npc.finalX
      ) {
        this.pokemonPositions.npc.x -= 0.5 * p.deltaTime;
        if (this.dataBoxPositions.npc.x <= 0)
          this.dataBoxPositions.npc.x += 0.5 * p.deltaTime;
      }

      if (
        this.currentState === states.introPlayerPokemon &&
        this.pokemonPositions.player.x <= this.pokemonPositions.player.finalX
      ) {
        this.pokemonPositions.player.x += 0.5 * p.deltaTime;
        this.dataBoxPositions.player.x -= 0.65 * p.deltaTime;
      }

      if (this.playerPokemon.isFainted) {
        this.pokemonPositions.player.y += 0.8 * p.deltaTime;
      }

      if (this.npcPokemon.isFainted) {
        this.pokemonPositions.npc.y += 0.8 * p.deltaTime;
      }

      this.dialogBox.update();
    },
    draw() {
      p.clear();
      p.background(0);
      p.image(this.battleBackgroundImage, 0, 0);

      p.image(this.sprites.npcPokemon, this.pokemonPositions.npc.x, this.pokemonPositions.npc.y);
      this.drawDataBox(this.npcPokemon, this.dataBoxPositions.npc, this.sprites.npcDataBox);

      p.image(this.sprites.playerPokemon, this.pokemonPositions.player.x, this.pokemonPositions.player.y);
      this.drawDataBox(this.playerPokemon, this.dataBoxPositions.player, this.sprites.playerDataBox);

      if (
        this.currentState === states.default ||
        this.currentState === states.introNpc
      )
        p.image(this.sprites.npc, this.npc.x, this.npc.y);

      if (
        this.currentState === states.playerTurn &&
        this.selectedMoveIndex === -1
      ) {
        this.dialogBox.displayTextImmediately(
          `1) ${this.playerPokemon.moves[0].name}    3) ${this.playerPokemon.moves[2].name}\n2) ${this.playerPokemon.moves[1].name}   4) ${this.playerPokemon.moves[3].name}`
        );
      }

      if (this.currentState === states.playerAttack) {
        this.handlePlayerAttack();
        this.currentState = "processing"; // Prevent re-triggering
      }
      
      if (this.currentState === states.npcTurn) {
        this.handleNpcAttack();
        this.currentState = "processing"; // Prevent re-triggering
      }

      if (this.currentState === states.battleEnd) {
        if (this.npcPokemon.isFainted) {
          this.dialogBox.clearText();
          this.dialogBox.displayText(
            `${this.npcPokemon.name} fainted! You won!`,
            async () => {
              world.isNpcDefeated = true;
              this.dialogBox.setVisibility(false); // Explicitly hide dialog box
              await new Promise((resolve) => setTimeout(resolve, 2000));
              setScene("world");
            }
          );
          this.currentState = states.winnerDeclared;
          return;
        }

        if (this.playerPokemon.isFainted) {
          this.dialogBox.clearText();
          this.dialogBox.displayText(
            `${this.playerPokemon.name} fainted! You lost!`,
            async () => {
              this.dialogBox.setVisibility(false); // Explicitly hide dialog box
              await new Promise((resolve) => setTimeout(resolve, 2000));
              setScene("world");
            }
          );
          this.currentState = states.winnerDeclared;
        }
      }

      p.rect(0, 288, 512, 200);
      this.dialogBox.draw();
    },
    onKeyPressed(keyEvent) {
      if (this.currentState === states.playerTurn) {
        switch (keyEvent.key) {
          case "1":
            this.selectedMoveIndex = 0;
            break;
          case "2":
            this.selectedMoveIndex = 1;
            break;
          case "3":
            this.selectedMoveIndex = 2;
            break;
          case "4":
            this.selectedMoveIndex = 3;
            break;
          default:
            return;
        }
        this.currentState = states.playerAttack;
      }
    },

    reset() {
      this.dialogBox.clearText();
      this.dialogBox.setVisibility(false);
      this.currentState = states.default;
      this.selectedMoveIndex = -1;
      // Reset Pokemon HP and fainted status for next battle
      this.playerPokemon.currentHp = this.playerPokemon.maxHp;
      this.playerPokemon.isFainted = false;
      this.npcPokemon.currentHp = this.npcPokemon.maxHp;
      this.npcPokemon.isFainted = false;
      // Reset positions for intro animation
      this.pokemonPositions.player.x = this.pokemonPositions.player.initialX;
      this.pokemonPositions.npc.x = this.pokemonPositions.npc.initialX;
      this.dataBoxPositions.player.x = this.dataBoxPositions.player.initialX;
      this.dataBoxPositions.npc.x = this.dataBoxPositions.npc.initialX;
    },
  };
}
