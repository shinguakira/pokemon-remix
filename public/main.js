import { makeMenu } from "./scenes/menu.js";
import { debugMode } from "./entities/debugMode.js";
import { makeWorld } from "./scenes/world.js";
import { makeBattle } from "./scenes/battle.js";
import { makeSettingsMenu } from "./scenes/settingsMenu.js";
import { gameState } from "./entities/gameState.js";

new p5((p) => {
  let font;
  const scenes = ["menu", "world", "battle"];
  let currentScene = "menu";
  function setScene(name) {
    if (scenes.includes(name)) {
      const previousScene = currentScene; // Store the current scene before updating
      currentScene = name;

      if (name === "world") {
        world.reset();
        // If coming from battle, reset battle scene as well
        if (previousScene === "battle") {
          battle.reset();
        }
      } else if (name === "battle") {
        battle.setup();
      }
    }
  }

  const menu = makeMenu(p);
  const world = makeWorld(p, setScene);
  const battle = makeBattle(p, setScene, world);
  const settingsMenu = makeSettingsMenu(p, setScene, world, battle);

  p.preload = () => {
    font = p.loadFont("./assets/power-clear.ttf");
    world.load();
    menu.load();
    battle.load();

    // Try to load saved game
    gameState.load();
  };

  p.setup = () => {
    const canvasEl = p.createCanvas(512, 384, document.getElementById("game"));
    // make canvas sharper temporarly
    p.pixelDensity(3);
    canvasEl.canvas.style = "";

    p.textFont(font);
    p.noSmooth(); // for pixels to not become blurry

    world.setup();
    battle.setup();
  };

  p.draw = () => {
    switch (currentScene) {
      case "menu":
        menu.update();
        menu.draw();
        break;
      case "world":
        world.update();
        world.draw();
        break;
      case "battle":
        battle.update();
        battle.draw();
        break;
      default:
    }

    debugMode.drawFpsCounter(p);

    // Draw settings menu on top
    settingsMenu.update();
    settingsMenu.draw();
  };

  p.keyPressed = (keyEvent) => {
    if (keyEvent.key === "Shift") {
      debugMode.toggle();
    }

    // ESC to toggle settings menu (only in world scene)
    if (keyEvent.keyCode === 27 && currentScene === "world") {
      settingsMenu.toggle();
      return;
    }

    // If settings menu is open, only handle menu input
    if (settingsMenu.isOpen) {
      settingsMenu.onKeyPressed(keyEvent);
      return;
    }

    if (keyEvent.keyCode === p.ENTER && currentScene === "menu")
      setScene("world");

    if (currentScene === "battle") battle.onKeyPressed(keyEvent);
    if (currentScene === "world") world.onKeyPressed(keyEvent);
  };

  p.keyReleased = () => {
    if (currentScene === "world") {
      world.keyReleased();
    }
  };
});
