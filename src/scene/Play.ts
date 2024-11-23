import Phaser from "phaser";
import GAME_CONFIG from "../util/GameConfig.ts";
import Player from "../prefab/Player.ts";

// come back to this
enum plantGrowthLevel {
  seedling,
  sapling,
  adult,
}

export default class Play extends Phaser.Scene {
  private elapsedTimeText!: Phaser.GameObjects.Text;
  private elapsedTimeEvent!: Phaser.Time.TimerEvent;
  private currentTimeEnum!: number;
  private player!: Player;
  private plantableCells!: Cell[];
  private UIWindowOpen!: boolean;
  private tileOutline!: Phaser.GameObjects.Image;
  private turnCounter!: number;
  private turnText!: Phaser.GameObjects.Text;
  private writingText!: Phaser.GameObjects.Text;
  private writingBox!: Phaser.GameObjects.Sprite;
  private TEXT_X!: number;
  private TEXT_Y!: number;
  private reapBtn!: Phaser.GameObjects.Sprite;
  private sowBtn!: Phaser.GameObjects.Sprite;
  private selectedCell!: Cell | undefined;

  constructor() {
    super({ key: "playScene" });
    this.plantableCells = [];
    this.UIWindowOpen = false;
    this.selectedCell = undefined;
  }

  init() {}
  preload() {}
  create() {
    const map = this.add.tilemap("FarmTilemap");
    const tiles = map.addTilesetImage("FarmTileset", "base-tileset")!;

    this.turnCounter = 0;

    map.createLayer(
      "Ground",
      tiles,
      0,
      0,
    )?.setScale(4);
    map.createLayer(
      "House",
      tiles,
      0,
      0,
    )?.setScale(4);
    const dirtLayer = map.createLayer(
      "Dirt",
      tiles,
      0,
      0,
    )?.setScale(4);
    dirtLayer?.setCollisionByProperty({ Interactable: true });
    map.setCollisionByProperty({ OpenWindow: true });

    const turnButton = this.add.image(
      this.game.config.width as number - GAME_CONFIG.UI.BORDER_PADDING,
      this.game.config.height as number - GAME_CONFIG.UI.BORDER_PADDING * 2.5,
      "turnButton",
    );
    turnButton.setInteractive().setScale(3);
    turnButton.on("pointerdown", () => {
      this.advanceTurn();
      this.setTimeElapsing();
      console.log(`Current turn is ${this.turnCounter}`);
    });

    this.turnText = this.add.text(
      this.game.config.width as number - GAME_CONFIG.UI.BORDER_PADDING,
      this.game.config.height as number - GAME_CONFIG.UI.BORDER_PADDING,
      this.turnCounter.toString(),
      {
        fontFamily: "Serif",
      },
    ).setFontSize(15);

    const iterableDirt = map.getObjectLayer("Plantable")!;
    iterableDirt.objects.forEach((element) => {
      this.plantableCells.push({
        i: Math.floor(element.x as number),
        j: Math.floor(element.y as number),
        planterBox: {
          waterLevel: 0,
          sunLevel: 0,
          plant: {
            species: "none",
            growthLevel: plantGrowthLevel.seedling,
            sprite: undefined,
          },
        },
      });
    });

    this.player = new Player(
      this,
      this.game.config.width as number / 2,
      this.game.config.height as number / 2,
      "player",
      0,
    );
    this.initTimeElapsing();
    this.initPopup();

    dirtLayer?.setInteractive().on("pointermove", () => {
      this.tileOutline?.destroy();
      const tile = dirtLayer?.getTileAtWorldXY(
        this.game.input.activePointer!.x,
        this.game.input.activePointer!.y,
      );
      if (tile?.properties.Interactable) {
        this.tileOutline = this.add.image(
          (tile.pixelX + 8) * 4,
          (tile.pixelY + 8) * 4,
          "outline",
        ).setScale(4);
      }
    });

    dirtLayer?.on("pointerdown", () => {
      if (!this.UIWindowOpen) return;
      const tile = dirtLayer?.getTileAtWorldXY(
        this.game.input.activePointer!.x,
        this.game.input.activePointer!.y,
      );
      if (tile?.properties.Interactable) {
        const plantableCell = this.plantableCells.find((cell) =>
          cell.i === tile.pixelX + 1 && cell.j === tile.pixelY
        );
        if (plantableCell) {
          this.selectedCell = plantableCell;
          const plantData = plantableCell.planterBox;
          this.updatePlantInfoUI(plantData);
        }
      }
    });

    this.physics.add.overlap(this.player, dirtLayer!, () => {
      const tile = dirtLayer?.getTileAtWorldXY(this.player.x, this.player.y);

      if (tile?.properties.OpenWindow === false && !this.UIWindowOpen) {
        this.UIWindowOpen = true;
        this.openWindow();
      } else if (!tile?.properties && this.UIWindowOpen) {
        this.selectedCell = undefined;
        this.UIWindowOpen = false;
        this.closeWindow();
      }
    });
  }

  //deno-lint-ignore no-unused-vars
  override update(time: number, delta: number): void {
    this.player.update();
    this.turnText.setText(this.turnCounter.toString());
  }

  updatePlantInfoUI(plantData: PlanterBox) {
    this.writingText.setText(
      `Water: ${
        plantData.waterLevel.toFixed(3)
      }\nSun: ${plantData.sunLevel}\nSpecies: ${plantData.plant.species}\nGrowth: ${plantData.plant.growthLevel}`,
    );
  }

  /**
   * command pipeline will be an array of objects, where each object encapsulates both the command and the data associated with the command at that given point
   * popping from the array to then execute the command is undo
   * this gets pushed onto the redo stack
   * poppinf from redo ...
   *
   * ex .. .[{function: reapCommand, data:{none...}}]
   * ex .. .[{function: sowCommand, data:{plantBeingSowed: someplant }}]
   */

  reapCommand() {
    if (!this.selectedCell) {
      console.log("no cell selected");
      return;
    }
    const { plant } = this.selectedCell.planterBox;
    if (plant.species === "none") {
      console.log("no plant to harvest");
      return;
    }
    console.log(
      `Reaping plant. species: ${plant.species} growthLevel: ${plant.growthLevel}`,
    );
    plant.sprite?.destroy();
    plant.sprite = undefined;
    plant.species = "none";
    this.updatePlantInfoUI(this.selectedCell.planterBox);
  }

  sowCommand() {
    if (!this.selectedCell) {
      console.log("No cell selected");
      return;
    }
    if (this.selectedCell.planterBox.plant.species !== "none") {
      console.log("Already a plant here");
      return;
    }
    const selectedRadio = document.querySelector(
      'input[name="choice"]:checked',
    ) as HTMLInputElement;
    if (selectedRadio) {
      console.log(
        `Sowing plant. species: ${selectedRadio.value as PlantSpecies}`,
      );
      const { plant } = this.selectedCell.planterBox;
      plant.sprite = this.add.sprite(
        (this.selectedCell.i * 4) + 32,
        (this.selectedCell.j * 4) + 32,
        "player",
      );
      plant.species = selectedRadio
        .value as PlantSpecies;
      this.updatePlantInfoUI(this.selectedCell.planterBox);
    } else {
      console.log("Plant not selected");
    }
  }

  initTimeElapsing() {
    const { timeStamps } = GAME_CONFIG.TIME;
    this.currentTimeEnum = 0; // in the future this will have to be init from local storage
    this.elapsedTimeText = this.add.text(
      GAME_CONFIG.UI.BORDER_PADDING,
      this.game.config.height as number - GAME_CONFIG.UI.BORDER_PADDING,
      timeStamps[this.currentTimeEnum],
    );
  }

  setTimeElapsing() {
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
      repeat: 23,
      delay: GAME_CONFIG.TIME.IN_GAME_HOUR,
    });
  }

  initPopup() {
    this.TEXT_X = this.game.config.width as number / 2; // text w/in dialog box x-position
    this.TEXT_Y = GAME_CONFIG.UI.BORDER_PADDING; // text w/in dialog box y-position
    this.writingBox = this.add.sprite(this.TEXT_X, this.TEXT_Y, "dBox")
      .setOrigin(0.5, 0).setAlpha(0).setScale(1.5);
    this.writingText = this.add.text(
      this.TEXT_X,
      this.TEXT_Y + GAME_CONFIG.UI.TEXT_PADDING,
      "Testing",
    ).setScale(1.5).setOrigin(0.5).setAlpha(0);
    this.reapBtn = this.add.sprite(
      this.TEXT_X - 200,
      this.TEXT_Y + 75,
      "player",
      0,
    ).setAlpha(0).on("pointerdown", () => this.reapCommand());
    this.sowBtn = this.add.sprite(
      this.TEXT_X + 200,
      this.TEXT_Y + 75,
      "player",
      0,
    ).setAlpha(0).on("pointerdown", () => this.sowCommand());
  }

  //USE EVENTS
  openWindow() {
    this.writingText.setText("Select A Plant");
    this.add.tween({
      targets: [this.writingBox, this.writingText, this.reapBtn, this.sowBtn],
      alpha: { from: 0, to: 1 },
      delay: 0,
      duration: 500,
      onComplete: () => {
        this.reapBtn.setInteractive();
        this.sowBtn.setInteractive();
        this.writingBox.setAlpha(1);
      },
    });
  }

  closeWindow() {
    this.add.tween({
      targets: [this.writingBox, this.writingText, this.reapBtn, this.sowBtn],
      alpha: { from: 1, to: 0 },
      delay: 0,
      duration: 500,
      onComplete: () => {
        this.reapBtn.setInteractive(false);
        this.sowBtn.setInteractive(false);
        this.writingBox.setAlpha(0);
      },
    });
  }

  advanceTurn() {
    this.turnCounter += 1;
    this.plantableCells.forEach((cell) => {
      this.generateSun(cell);
      this.generateWater(cell);
    });
    if (this.selectedCell) {
      this.updatePlantInfoUI(this.selectedCell.planterBox);
    }
  }

  generateSun(currentCell: Cell) {
    currentCell.planterBox.sunLevel = Phaser.Math.Between(0, 5);
    // console.log(
    //   `this cell\'s current sun is ${currentCell.planterBox.sunLevel} at ${currentCell.i}, ${currentCell.j}`,
    // );
  }

  generateWater(currentCell: Cell) {
    currentCell.planterBox.waterLevel = currentCell.planterBox.waterLevel +
      Number(Phaser.Math.FloatBetween(0, 3).toFixed(3));
    if (currentCell.planterBox.waterLevel >= 5) {
      currentCell.planterBox.waterLevel = 5;
    }
    // console.log(
    //   `this cell\'s current water level is ${currentCell.planterBox.waterLevel} at ${currentCell.i}, ${currentCell.j}`,
    // );
  }

  // handlePlantGrowth(currentCell: Cell) {
  // }

  getPlantsNearby(): number {
    return this.plantableCells.filter((e) =>
      e.planterBox.plant.species !== "none"
    ).length;
  }
}
