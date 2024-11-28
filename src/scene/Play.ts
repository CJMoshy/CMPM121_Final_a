import Phaser from "phaser";
import { plantGrowthLevel } from "../util/GameConfig.ts";
import Player from "../prefab/Player.ts";
import PlantManager from "../controller/PlantController.ts";
import UIManager from "../controller/UIController.ts";
import TimeManager from "../controller/TimeController.ts";
import GameManager from "../controller/GameManager.ts";

export default class Play extends Phaser.Scene {
  private player!: Player;
  private UIWindowOpen!: boolean;
  private tileOutline!: Phaser.GameObjects.Image;

  private plantManager!: PlantManager;
  private UIManager!: UIManager;
  private TimeManager!: TimeManager;
  private gameManager: GameManager;

  constructor() {
    super({ key: "playScene" });
    this.UIWindowOpen = false;
    this.plantManager = new PlantManager(this);
    this.UIManager = new UIManager(this);
    this.TimeManager = new TimeManager(this);
    this.gameManager = new GameManager(
      this,
      this.plantManager,
      this.UIManager,
      this.TimeManager,
    );
  }

  init() {}
  preload() {}
  create() {
    const map = this.add.tilemap("FarmTilemap");
    const tiles = map.addTilesetImage("FarmTileset", "base-tileset")!;

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

    const iterableDirt = map.getObjectLayer("Plantable")!;
    iterableDirt.objects.forEach((element) => {
      this.plantManager.addPlantableCell({
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
        const plantableCell = this.plantManager.getCells().find((cell) =>
          cell.i === tile.pixelX + 1 && cell.j === tile.pixelY
        );
        if (plantableCell) {
          this.gameManager.selectedCell = plantableCell;
          const plantData = plantableCell.planterBox;
          this.UIManager.updatePlantInfoUI(plantData);
        }
      }
    });

    this.player = new Player(
      this,
      this.game.config.width as number / 2,
      this.game.config.height as number / 2 - 64,
      "player",
      0,
      64,
    );
    this.gameManager.initGame();

    this.physics.add.overlap(this.player, dirtLayer!, () => {
      const tile = dirtLayer?.getTileAtWorldXY(this.player.x, this.player.y);

      if (tile?.properties.OpenWindow === false && !this.UIWindowOpen) {
        this.UIWindowOpen = true;
        this.UIManager.openWindow();
      } else if (!tile?.properties && this.UIWindowOpen) {
        this.gameManager.selectedCell = undefined;
        this.UIWindowOpen = false;
        this.UIManager.closeWindow();
      }
    });

    this.events.on("reapEvent", () => this.reap());
    this.events.on("sowEvent", () => this.sow());
  }

  //deno-lint-ignore no-unused-vars
  override update(time: number, delta: number): void {
    this.player.update();
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

  reap() {
    if (!this.gameManager.selectedCell) {
      console.log("no cell selected");
      return;
    }
    const { plant } = this.gameManager.selectedCell.planterBox;
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
    plant.growthLevel = 0;
    this.UIManager.updatePlantInfoUI(this.gameManager.selectedCell.planterBox);
  }

  sow() {
    if (!this.gameManager.selectedCell) {
      console.log("No cell selected");
      return;
    }
    if (this.gameManager.selectedCell.planterBox.plant.species !== "none") {
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
      const { plant } = this.gameManager.selectedCell.planterBox;
      plant.sprite = this.add.sprite(
        (this.gameManager.selectedCell.i * 4) + 32,
        (this.gameManager.selectedCell.j * 4) + 32,
        `${selectedRadio.value as PlantSpecies}` + "Level0",
      );
      plant.sprite.setScale(2);
      plant.species = selectedRadio
        .value as PlantSpecies;
      this.UIManager.updatePlantInfoUI(
        this.gameManager.selectedCell.planterBox,
      );
    } else {
      console.log("Plant not selected");
    }
  }
}
