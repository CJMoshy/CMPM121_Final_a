import GAME_CONFIG from "../util/GameConfig.ts";

export default class TimeManager {
  private scene: Phaser.Scene;
  private elapsedTime: number = 0;
  private elapsedTimeText!: Phaser.GameObjects.Text;
  private currentTimeEnum!: number;
  private elapsedTimeEvent!: Phaser.Time.TimerEvent;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initTimeElapsing() {
    this.scene.events.on("nextTurnEvent", () => this.setTimeElapsing());
    const { timeStamps } = GAME_CONFIG.TIME;
    this.currentTimeEnum = 0; // in the future this will have to be init from local storage
    this.elapsedTimeText = this.scene.add.text(
      GAME_CONFIG.UI.BORDER_PADDING,
      this.scene.game.config.height as number - GAME_CONFIG.UI.BORDER_PADDING,
      timeStamps[this.currentTimeEnum],
    );
  }

  setTimeElapsing() {
    this.scene.time.removeEvent(this.elapsedTimeEvent);
    this.elapsedTimeEvent = this.scene.time.addEvent({
      callback: () => {
        const { timeStamps } = GAME_CONFIG.TIME;
        if (this.currentTimeEnum === timeStamps.length - 1) {
          this.currentTimeEnum = 0;
        } else this.currentTimeEnum++;
        this.elapsedTimeText.setText(
          timeStamps[this.currentTimeEnum],
        );
      },
      repeat: 23,
      delay: GAME_CONFIG.TIME.IN_GAME_HOUR,
    });
  }

  advanceTime() {
    this.elapsedTime++;
    this.elapsedTimeText.setText(`Time: ${this.elapsedTime}`);
  }
}
