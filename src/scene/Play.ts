import Phaser from "phaser";
import GAME_CONFIG from "../util/GameConfig.ts";

export default class Play extends Phaser.Scene {
  private elapsedTimeText!: Phaser.GameObjects.Text;
  private elapsedTimeEvent!: Phaser.Time.TimerEvent;
  private currentTimeEnum!: number;
  private elapsedTimeToggle!: boolean;
  constructor() {
    super({ key: "playScene" });
  }

  init() {}
  preload() {}
  create() {
    this.initTimeElapsing();
  }

  //deno-lint-ignore no-unused-vars
  override update(time: number, delta: number): void {
  }

  initTimeElapsing() {
    const { timeStamps } = GAME_CONFIG.TIME;
    this.currentTimeEnum = 0; // in the future this will have to be init from local storage
    this.elapsedTimeText = this.add.text(
      GAME_CONFIG.UI.BORDER_PADDING,
      GAME_CONFIG.UI.BORDER_PADDING,
      timeStamps[this.currentTimeEnum],
    );
    this.elapsedTimeToggle = false; // time is initially not fast (or standard)
    this.setTimeElapsing(this.elapsedTimeToggle);
  }

  setTimeElapsing(fast: boolean) {
    this.time.removeEvent(this.elapsedTimeEvent);
    this.elapsedTimeEvent = this.time.addEvent({
      callback: () => {
        const { timeStamps } = GAME_CONFIG.TIME;
        if (this.currentTimeEnum === timeStamps.length - 1) {
          this.currentTimeEnum = 0;
        } else this.currentTimeEnum++;
        this.elapsedTimeText.setText(
          timeStamps[this.currentTimeEnum],
        );
      },
      repeat: -1,
      delay: fast
        ? GAME_CONFIG.TIME.ACCEL_IN_GAME_HOUR
        : GAME_CONFIG.TIME.IN_GAME_HOUR,
    });
  }
}
