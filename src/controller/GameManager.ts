import PlantManager from "./PlantController.ts";
import UIManager from "./UIController.ts";
import TimeManager from "./TimeController.ts";
import { loadGameState, saveGameState } from "../util/Storage.ts";

export default class GameManager {
  private scene: Phaser.Scene;
  private plantManager: PlantManager;
  private UIManager: UIManager;
  private TimeManager: TimeManager;
  public selectedCell!: Cell | undefined;
  public selectedCellIndex: number = 0;
  private currentLevel!: number;
  public turnCounter!: number;
  private savedGameSlot: number;

  constructor(
    scene: Phaser.Scene,
    plantManager: PlantManager,
    UIManager: UIManager,
    TimeManager: TimeManager,
  ) {
    this.scene = scene;
    this.plantManager = plantManager;
    this.UIManager = UIManager;
    this.TimeManager = TimeManager;
    this.savedGameSlot = 1;
  }

  getSavedGameSlot() {
    return this.savedGameSlot;
  }
  
  setSavedGameSlot(slot: number) {
    this.savedGameSlot = slot;
  }

  initGame() {
    this.scene.events.on("nextTurnEvent", () => this.advanceTurn());
    // set up game
    this.TimeManager.initTimeElapsing();
    this.UIManager.initUI();
    this.loadSavedGame();
    this.UIManager.setTurnText(this.turnCounter.toString());
  }

  saveGame() {
    const toByteArr = new Uint8Array(
      this.plantManager.getPlantableCellBuffer(),
    );
    saveGameState({
      currentLevel: this.currentLevel,
      currentTurn: this.turnCounter,
      plantData: Array.from(toByteArr),
    }, this.savedGameSlot); // for now only save is in slot 1
  }

  loadSavedGame() {
    if (!loadGameState(this.savedGameSlot)) {
      this.scene.events.emit("newGameEvent");
      this.turnCounter = 1;
      this.currentLevel = 1;
    } else {
      let plantData: ArrayBuffer;
      [this.currentLevel, this.turnCounter, plantData] = loadGameState(
        this.savedGameSlot,
      ) as [number, number, ArrayBuffer];
      this.plantManager.setPlantableCellBuffer(plantData);
    }
  }

  advanceTurn() {
    this.turnCounter += 1;
    const asCells = this.plantManager.getAllPlantableCells();
    let count = 0;
    asCells.forEach((cell) => {
      this.generateSun(cell);
      this.generateWater(cell);
      this.plantManager.updatePlantGrowth(cell);
      this.plantManager.addPlantableCell(count, cell);
      count += 1;
    });

    if (this.selectedCell) {
      this.UIManager.updatePlantInfoUI(
        this.plantManager.getAllPlantableCells()[this.selectedCellIndex]
          .planterBox,
      );
    }

    this.handleCompleteLevel();
    this.UIManager.setTurnText(this.turnCounter.toString());

    // save NEW TODO
    this.saveGame();
  }

  generateSun(currentCell: Cell) {
    currentCell.planterBox.sunLevel = Phaser.Math.Between(0, 5);
  }

  generateWater(currentCell: Cell) {
    currentCell.planterBox.waterLevel = currentCell.planterBox.waterLevel +
      Number(Phaser.Math.FloatBetween(0, 3).toFixed(3));
    if (currentCell.planterBox.waterLevel >= 5) {
      currentCell.planterBox.waterLevel = 5;
    }
  }

  handleCompleteLevel() {
    const query = this.scene.cache.json.get("scenario") as LevelsData;
    const levelRequirement = query.levels.find((e) =>
      e.levelNum === this.currentLevel
    )?.requirements;
    if (!levelRequirement) {
      console.log("wtf this is bad");
      return;
    }

    // Convert the plant requirements to an array
    const plants = Object.entries(levelRequirement.plants); // We use `Object.entries` to get both the plant name and the requirement

    for (const [species, x] of plants) {
      // Check if there's a planter box that matches the growth level of this plant
      const hasMatchingGrowthLevel = this.plantManager.getAllPlantableCells()
        .find((e) => e.planterBox.plant.growthLevel === x.growthLevel);

      if (!hasMatchingGrowthLevel) {
        console.log("no plant found at correct growth level ");
        return;
      }

      // Find the plantable cells that match the species name (e.g., "Flytrap")
      const matchingCells =
        this.plantManager.getAllPlantableCells().filter((e) =>
          e.planterBox.plant.species === species
        ).length;

      if (matchingCells !== x.ammount) {
        console.log("not enough plants for level to beat");
        return;
      }

      // Now, you can handle the matching cells for the current species (e.g., Flytrap)
      console.log(
        `Found ${matchingCells} plantable cells for ${species} with growth level ${x.growthLevel}, LEVEL COMPLETE!`,
      );
    }
  }
}
