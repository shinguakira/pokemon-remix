import { makeNPC } from "../entities/npc.js";
import { makePlayer } from "../entities/player.js";
import { makeTiledMap } from "../entities/map.js";
import { makeDialogBox } from "../entities/dialogBox.js";
import { makeCamera } from "../entities/camera.js";

export function makeWorld(p, setScene) {
  return {
    camera: makeCamera(p, 100, 0),
    player: makePlayer(p, 0, 0),
    npc1: makeNPC(p, 0, 0),
    npc2: makeNPC(p, 0, 0),
    map: makeTiledMap(p, 100, -150),
    dialogBox: makeDialogBox(p, 0, 280),
    isNpcDefeated: false,
    isInDialogue: false,
    makeScreenFlash: false,
    alpha: 0,
    blinkBack: false,
    easing: 3,
    load() {
      this.dialogBox.load();
      this.map.load("./assets/Trainer Tower interior.png", "./maps/world.json");
      this.player.load();
      this.npc1.load();
      this.npc2.load();
    },
    setup() {
      this.map.prepareTiles();
      const spawnPoints = this.map.getSpawnPoints();
      for (const spawnPoint of spawnPoints) {
        switch (spawnPoint.name) {
          case "player":
            this.player.x = this.map.x + spawnPoint.x;
            this.player.y = this.map.y + spawnPoint.y + 32;
            break;
          case "npc1":
            this.npc1.x = this.map.x + spawnPoint.x;
            this.npc1.y = this.map.y + spawnPoint.y + 32;
            break;
          case "npc2":
          this.npc2.x = this.map.x + spawnPoint.x;
          this.npc2.y = this.map.y + spawnPoint.y + 32;
            break;
          default:
        }
      }
      this.player.setup();
      this.camera.attachTo(this.player);

      this.npc1.setup();
      this.npc2.setup();
    },

    update() {
      this.camera.update();
      this.player.update(); // this being before the map draw call is important
      this.npc1.update();
      this.npc2.update();
      this.dialogBox.update();
      if (this.alpha <= 0) this.blinkBack = true;
      if (this.alpha >= 255) this.blinkBack = false;

      if (this.blinkBack) {
        this.alpha += 0.7 * this.easing * p.deltaTime;
      } else {
        this.alpha -= 0.7 * this.easing * p.deltaTime;
      }
    },
    draw() {
      p.clear();
      p.background(0);
      this.npc1.handleCollisionsWith(this.player, () => {
        this.isInDialogue = true;
        if (this.isNpcDefeated) {
          this.dialogBox.displayText("You already defeated me...");
        } else {
          this.dialogBox.displayText(
            "I see that you need training.\nLet's battle !",
            async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              this.dialogBox.setVisibility(false);
              this.makeScreenFlash = true;
              await new Promise((resolve) => setTimeout(resolve, 1000));
              this.makeScreenFlash = false;
              setScene("battle");
            }
          );
        }
        this.dialogBox.setVisibility(true);
        if(this.isNpcDefeated) {
          this.dialogBox.displayTextImmediately("You already defeated me...");
          this.dialogBox.setVisibility(false);
        }
      }, !this.isNpcDefeated);
      this.npc2.handleCollisionsWith(this.player, () => {
        this.isInDialogue = true;
        if (this.isNpcDefeated) {
          this.dialogBox.displayText("You already defeated me...");
        } else {
          this.dialogBox.displayText(
            "I am the second guardian",
            async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              this.dialogBox.setVisibility(false);
              this.makeScreenFlash = true;
              await new Promise((resolve) => setTimeout(resolve, 1000));
              this.makeScreenFlash = false;
              setScene("battle");
            }
          );
        }
        this.dialogBox.setVisibility(true);
        if(this.isNpcDefeated) {
          this.dialogBox.displayTextImmediately("You already defeated me...");
          this.dialogBox.setVisibility(false);
        }
      }, !this.isNpcDefeated);
      this.map.draw(this.camera, this.player);
      this.npc1.draw(this.camera);
      this.npc2.draw(this.camera);
      this.player.draw(this.camera);
      this.dialogBox.draw();

      if (this.makeScreenFlash) {
        p.fill(0, 0, 0, this.alpha);
        p.rect(0, 0, 512, 384);
      }
    },

    keyReleased() {
      for (const key of [
        p.RIGHT_ARROW,
        p.LEFT_ARROW,
        p.UP_ARROW,
        p.DOWN_ARROW,
      ]) {
        if (p.keyIsDown(key)) {
          return;
        }
      }

      switch (this.player.direction) {
        case "up":
          this.player.setAnim("idle-up");
          break;
        case "down":
          this.player.setAnim("idle-down");
          break;
        case "left":
        case "right":
          this.player.setAnim("idle-side");
          break;
        default:
      }
    },

    reset() {
      this.player.freeze = false;
      this.dialogBox.clearText();
      this.dialogBox.setVisibility(false);
      this.isInDialogue = false;
    },

    onKeyPressed(keyEvent) {
      if (this.isInDialogue && keyEvent.keyCode === p.ENTER) {
        this.dialogBox.setVisibility(false);
        this.isInDialogue = false;
        this.player.freeze = false;
      }
    },
  };
}
