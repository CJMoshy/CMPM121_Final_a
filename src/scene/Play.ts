import Phaser from "phaser";
import { plantGrowthLevel } from "../util/GameConfig.ts";
import Player from "../prefab/Player.ts";
import PlantManager from "../controller/PlantController.ts";
import UIManager from "../controller/UIController.ts";
import TimeManager from "../controller/TimeController.ts";
import GameManager from "../controller/GameManager.ts";
import CommandPipeline from "../controller/CommandPipeline.ts";

export default class Play extends Phaser.Scene {
  private player!: Player;
  private UIWindowOpen!: boolean;
  private tileOutline!: Phaser.GameObjects.Image;

  private plantManager: PlantManager;
  private UIManager: UIManager;
  private TimeManager: TimeManager;
  private gameManager: GameManager;
  private commandPipeline: CommandPipeline;

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
    this.commandPipeline = new CommandPipeline();

    document.getElementById("undoBtn")?.addEventListener(
      "click",
      () => this.commandPipeline.undo(),
    );
    document.getElementById("redoBtn")?.addEventListener(
      "click",
      () => this.commandPipeline.redo(),
    );
  }

  init() {}
  preload() {}
  create() {
    // TILESET LOGIC
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
    )?.setScale(4).setInteractive();
    dirtLayer?.setCollisionByProperty({ Interactable: true });
    map.setCollisionByProperty({ OpenWindow: true });

    dirtLayer?.on("pointermove", () => {
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
        const plantableCell = this.plantManager.getAllPlantableCells().find((
          cell,
        ) => cell.i === tile.pixelX + 1 && cell.j === tile.pixelY);
        const plantableCellIndex = this.plantManager.getAllPlantableCells()
          .findIndex((
            cell,
          ) => cell.i === tile.pixelX + 1 && cell.j === tile.pixelY);
        if (plantableCell) {
          this.gameManager.selectedCell = plantableCell;
          this.gameManager.selectedCellIndex = plantableCellIndex;
          const plantData = plantableCell.planterBox;
          this.UIManager.updatePlantInfoUI(plantData);
        }
      }
    });

    // TODO FIX
    // whenever the game state moves forward we want to save the previous board state so we can undo
    this.events.on("gameStateAdvance", (arg: Cell[]) => {
      this.commandPipeline.addCommand({
        executeUndo: () => {
          let count = 0;
          for (const cell of arg) {
            console.log(cell);
            this.plantManager.addPlantableCell(count, cell);
            count += 1;
          }
          // something something turn counter decrement
          // something something reverse time ? lol
          if (this.gameManager.selectedCell) {
            this.UIManager.updatePlantInfoUI(
              this.gameManager.selectedCell.planterBox,
            );
          }
        },
        executeRedo: () => {
          this.events.emit("newTurnEvent"); // TODO this is busted
        },
      });
    });

    // if a new game exists then we need to go through all the cells and set them up
    this.events.on("newGameEvent", () => {
      const iterableDirt = map.getObjectLayer("Plantable")!;
      let count = 0;
      iterableDirt.objects.forEach((element) => {
        this.plantManager.addPlantableCell(count, {
          i: Math.floor(element.x as number),
          j: Math.floor(element.y as number),
          planterBox: {
            waterLevel: 0,
            sunLevel: 0,
            plant: {
              species: "none",
              growthLevel: plantGrowthLevel.seedling,
            },
          },
        });
        count += 1;
      });
    });

    this.player = new Player(
      this,
      this.game.config.width as number / 2,
      this.game.config.height as number / 2,
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

  // reap method encapsulates everything it needs to reap or sow in a closure which is passed to command pipeline as undo/redo
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

    // this is key we need alias of stuff so when they change we can remember the old things
    const selectedCellAlias = this.gameManager.selectedCell; // this works but we might need to deep copy
    const selectedCellIndexAlias = this.gameManager.selectedCellIndex; // this works but we might need to deep copy
    const plantAlias = JSON.parse(JSON.stringify(plant)); // deep copy here to ensure old plant stays the same?

    const command = {
      executeUndo: () => { // this is the opposite of reaping. its not sowing because in the future if we tie more logic into sow we could be potentially losing seeds etc...
        plant.species = plantAlias.species;
        plant.growthLevel = plantAlias.growthLevel;
        this.plantManager.addPlantableCell(
          selectedCellIndexAlias,
          selectedCellAlias,
        );
        this.UIManager.updatePlantInfoUI(
          selectedCellAlias.planterBox,
        );
      },
      executeRedo: () => {
        plant.species = "none"; // this is everything associated with reaping
        plant.growthLevel = 0; // this is everything associated with reaping
        this.plantManager.addPlantableCell( // this is everything associated with reaping
          selectedCellIndexAlias,
          selectedCellAlias,
        );
        this.UIManager.updatePlantInfoUI( // this is everything associated with reaping
          selectedCellAlias.planterBox,
        );
      },
    };

    this.commandPipeline.addCommand(command);
    command.executeRedo();
  }

  // same idea as above
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

      // same alias thing
      const { plant } = this.gameManager.selectedCell.planterBox;
      const selectedCellAlias = this.gameManager.selectedCell;
      const selectedCellIndexAlias = this.gameManager.selectedCellIndex;

      const command = {
        executeUndo: () => { // opposite / undo
          plant.species = "none";
          plant.growthLevel = 0;
          this.plantManager.addPlantableCell(
            selectedCellIndexAlias,
            selectedCellAlias,
          );
          this.UIManager.updatePlantInfoUI(
            selectedCellAlias.planterBox,
          );
        },
        executeRedo: () => {
          plant.species = selectedRadio
            .value as PlantSpecies;
          this.plantManager.addPlantableCell(
            selectedCellIndexAlias,
            selectedCellAlias,
          );
          this.UIManager.updatePlantInfoUI(
            selectedCellAlias!.planterBox,
          );
        },
      };

      this.commandPipeline.addCommand(command);
      command.executeRedo();
    } else {
      console.log("Plant not selected");
    }
  }
}
