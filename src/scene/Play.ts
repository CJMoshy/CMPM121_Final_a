import Phaser from "phaser";
import GAME_CONFIG from "./GameConfig.ts";

export default class Play extends Phaser.Scene {
  private elapsedTime!: Phaser.GameObjects.Text;
  private currentTimeEnum!: number;
  constructor() {
    super({ key: "playScene" });
  }

  init() {}
  preload() {}
  create() {
    const { width, height } = this.game.config;
    this.currentTimeEnum = 0; // in the future this will have to be init from local storage
    this.elapsedTime = this.add.text(
      width as number / 2,
      height as number / 2,
      GAME_CONFIG.timeStamps[this.currentTimeEnum],
    );
    // this.beginTimeElapsing();
  }

  //deno-lint-ignore no-unused-vars
  override update(time: number, delta: number): void {
  }

  beginTimeElapsing() {
    this.time.addEvent({
      callback: () =>
        this.elapsedTime.setText(
          GAME_CONFIG.timeStamps[++this.currentTimeEnum],
        ),
      repeat: -1,
      delay: 5000,
    });
  }
}
