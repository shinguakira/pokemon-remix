import type p5 from "p5";
import type { P5Instance, SceneName, KeyEvent } from "../core/types";
import { Scene } from "./Scene";
import { emitGameEvent } from "../core/EventEmitter";

/**
 * Menu scene - the game's title/start screen
 */
export class MenuScene extends Scene {
  readonly name: SceneName = "menu";

  private titleImage: p5.Image | null = null;
  private titleImageUrl: string = "assets/title.png";

  // Animation state
  private blinkTimer: number = 0;
  private showPressEnter: boolean = true;

  constructor(p: P5Instance) {
    super(p);
  }

  load(_p: P5Instance): void {
    // Load title image if you have one
    // this.titleImage = p.loadImage(this.titleImageUrl);
    this.isLoaded = true;
  }

  setup(): void {
    this.blinkTimer = 0;
    this.showPressEnter = true;
    this.isSetup = true;
  }

  update(deltaTime: number): void {
    // Blink "Press Enter" text
    this.blinkTimer += deltaTime;
    if (this.blinkTimer >= 500) {
      this.showPressEnter = !this.showPressEnter;
      this.blinkTimer = 0;
    }
  }

  draw(p: P5Instance): void {
    p.clear();
    p.background(0);

    // Draw title
    p.push();
    p.fill(255);
    p.textSize(48);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("POKEMON REMIX", p.width / 2, p.height / 3);
    p.pop();

    // Draw "Press Enter" with blinking
    if (this.showPressEnter) {
      p.push();
      p.fill(255);
      p.textSize(24);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Press ENTER to start", p.width / 2, (p.height * 2) / 3);
      p.pop();
    }
  }

  reset(): void {
    this.blinkTimer = 0;
    this.showPressEnter = true;
  }

  onKeyPressed(event: KeyEvent): void {
    // ENTER keyCode is 13
    if (event.keyCode === 13) {
      emitGameEvent("scene:change", { to: "world" });
    }
  }
}
