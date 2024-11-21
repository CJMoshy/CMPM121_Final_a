import Phaser from "phaser";
import GAME_CONFIG from "./GameConfig.ts";

export default class Play extends Phaser.Scene {
  private elapsedTime!: Phaser.GameObjects.Text;
  private standardTimeEvent!: Phaser.Time.TimerEvent;
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
    this.beginTimeElapsing();
  }

  //deno-lint-ignore no-unused-vars
  override update(time: number, delta: number): void {
  }

  beginTimeElapsing() {
    this.standardTimeEvent = this.time.addEvent({
      callback: () => {
        if (this.currentTimeEnum === GAME_CONFIG.timeStamps.length) {
          this.currentTimeEnum = 0;
        } else this.currentTimeEnum++;
        this.elapsedTime.setText(
          GAME_CONFIG.timeStamps[this.currentTimeEnum],
        );
      },
      repeat: -1,
      delay: 5000,
    });
  }

  beginRapidTimeElapsing() {
    this.time.removeEvent(this.standardTimeEvent);
  }
}
