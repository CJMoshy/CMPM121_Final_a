import GAME_CONFIG from "../util/GameConfig.ts";

export default class UIManager {
  private scene: Phaser.Scene;
  private writingBox!: Phaser.GameObjects.Sprite;
  private writingText!: Phaser.GameObjects.Text;
  private reapBtn!: Phaser.GameObjects.Sprite;
  private sowBtn!: Phaser.GameObjects.Sprite;
  private turnText!: Phaser.GameObjects.Text;
  private turnBtn!: Phaser.GameObjects.Image;
  private undoBtn!: Phaser.GameObjects.Sprite;
  private redoBtn!: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initUI() {
    // UI initialization
    this.turnBtn = this.scene.add.image(
      this.scene.game.config.width as number - GAME_CONFIG.UI.BORDER_PADDING,
      this.scene.game.config.height as number -
        GAME_CONFIG.UI.BORDER_PADDING * 2.5,
      "turnButton",
    ).setInteractive().setScale(3).on("pointerdown", () => {
      this.turnBtn.input!.enabled = false;
      this.scene.time.delayedCall(
        GAME_CONFIG.TIME.IN_GAME_HOUR * 25,
        () => this.turnBtn.input!.enabled = true,
      );
      this.scene.events.emit("nextTurnEvent");
    });

    this.turnText = this.scene.add.text(
      this.scene.game.config.width as number - GAME_CONFIG.UI.BORDER_PADDING,
      this.scene.game.config.height as number - GAME_CONFIG.UI.BORDER_PADDING,
      "0",
      {
        fontFamily: "Serif",
      },
    ).setFontSize(15);

    const TEXT_X = this.scene.game.config.width as number / 2;
    const TEXT_Y = GAME_CONFIG.UI.BORDER_PADDING;

    this.writingBox = this.scene.add.sprite(TEXT_X, TEXT_Y, "dBox")
      .setOrigin(0.5, 0).setAlpha(1).setScale(1.5);

    this.writingText = this.scene.add.text(
      TEXT_X,
      TEXT_Y + GAME_CONFIG.UI.TEXT_PADDING + 8,
    "Select plants below the screen\nPlants grow based on sun, \nwater, and nearby plants\nWalk to the planter box to start"
    ).setScale(1.5).setOrigin(0.5).setAlpha(1);

    this.reapBtn = this.scene.add
      .sprite(TEXT_X - 200, TEXT_Y + 75, "reapButton", 0)
      .setAlpha(0)
      .setScale(3)
      .on("pointerdown", () => this.reap());

    this.sowBtn = this.scene.add
      .sprite(TEXT_X + 200, TEXT_Y + 75, "sowButton", 0)
      .setAlpha(0)
      .setScale(3)
      .on("pointerdown", () => this.sow());

    this.undoBtn = this.scene.add
      .sprite(
        GAME_CONFIG.UI.BORDER_PADDING,
        (this.scene.game.config.height as number) -
          GAME_CONFIG.UI.BORDER_PADDING * 2.5 -
          30,
        "undoButton",
        0
      )
      .setScale(3).on("pointerdown", () => this.undo);;

    this.redoBtn = this.scene.add
      .sprite(
        GAME_CONFIG.UI.BORDER_PADDING,
        (this.scene.game.config.height as number) -
          GAME_CONFIG.UI.BORDER_PADDING * 2.5 +
          30,
        "redoButton",
        0
      )
      .setScale(3).on("pointerdown", () => this.redo);
  }

  setTurnText(turnCounter: string) {
    this.turnText.setText(turnCounter);
  }

  openWindow() {
    this.writingText.setText(
      `         Select a planter box`
    ).setX(this.writingBox.x - GAME_CONFIG.UI.TEXT_PADDING);
    this.scene.add.tween({
      targets: [this.writingBox, this.writingText, this.reapBtn, this.sowBtn],
      alpha: { from: 0, to: 1 },
      duration: 500,
      onComplete: () => {
        this.reapBtn.setInteractive();
        this.sowBtn.setInteractive();
      },
    });
  }

  closeWindow() {
    this.scene.add.tween({
      targets: [this.writingBox, this.writingText, this.reapBtn, this.sowBtn],
      alpha: { from: 1, to: 0 },
      duration: 500,
      onComplete: () => {
        this.reapBtn.setInteractive(false);
        this.sowBtn.setInteractive(false);
      },
    });
  }

  reap() {
    this.scene.events.emit("reapEvent");
    // Manage reap logic or call back into the scene as required
    console.log("Reap button pressed");
  }

  sow() {
    this.scene.events.emit("sowEvent");
    // Sow logic
    console.log("Sow button pressed");
  }

  updatePlantInfoUI(plantData: PlanterBox) {
    this.writingText.setText(
      `        Water: ${plantData.waterLevel.toFixed(3)} 
        Sun: ${plantData.sunLevel}
        Species: ${plantData.plant.species}
        Growth: ${plantData.plant.growthLevel}`,
    ).setX(this.writingBox.x - GAME_CONFIG.UI.TEXT_PADDING);

    this.reapBtn.setAlpha(1);
    this.sowBtn.setAlpha(1);
    this.reapBtn.setInteractive();
    this.sowBtn.setInteractive();
  }

  initLevelRequirements() {
    this.writingText.setText(
      `       Select plants below the screen
        Plants grow based on sun, water, and nearby plants
        You need a certain number of plants to beat the level
        Select a planter box to start`
    ).setX(this.writingBox.x - GAME_CONFIG.UI.TEXT_PADDING);

    this.reapBtn.setAlpha(0);
    this.sowBtn.setAlpha(0);
    this.reapBtn.setInteractive(false);
    this.sowBtn.setInteractive(false);
  }

  updateLevelRequirements(species: string, amount: number, growthLevel: number, currAmount: number) {
    this.writingText.setText(
      `        It is a new day!
        You need ${amount} box(es) of ${species} 
        at growth level ${growthLevel}
        to complete this level
        You currently have ${currAmount}`
    ).setX(this.writingBox.x - GAME_CONFIG.UI.TEXT_PADDING);

    this.reapBtn.setAlpha(0);
    this.sowBtn.setAlpha(0);
    this.reapBtn.setInteractive(false);
    this.sowBtn.setInteractive(false);
  }

  updateWinText(){
    this.writingText.setText(
      `        You beat the level!`
    ).setX(this.writingBox.x - GAME_CONFIG.UI.TEXT_PADDING);
  }

  undo(){

  }

  redo(){

  }
}
