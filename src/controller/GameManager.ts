import PlantManager from "./PlantController.ts";
import UIManager from "./UIController.ts";
import TimeManager from "./TimeController.ts";

export default class GameManager {
  private scene: Phaser.Scene;
  private plantManager: PlantManager;
  private UIManager: UIManager;
  private TimeManager: TimeManager;
  public selectedCell!: Cell | undefined;
  private currentLevel!: number;

  public turnCounter!: number;
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
  }

  initGame() {
    this.scene.events.on("nextTurnEvent", () => this.advanceTurn());
    // set up game
    this.TimeManager.initTimeElapsing();
    this.UIManager.initUI();

    this.currentLevel = 1;
    // turn logic
    this.turnCounter = 0;
  }

  advanceTurn() {
    this.turnCounter += 1;
    this.plantManager.getCells().forEach((cell) => {
      this.generateSun(cell);
      this.generateWater(cell);
      this.plantManager.updatePlantGrowth(cell);
    });
    if (this.selectedCell) {
      this.UIManager.updatePlantInfoUI(this.selectedCell.planterBox);
    }
    this.handleCompleteLevel();
    this.UIManager.setTurnText(this.turnCounter.toString());
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
      const hasMatchingGrowthLevel = this.plantManager.getCells().find((e) =>
        e.planterBox.plant.growthLevel === x.growthLevel
      );

      if (!hasMatchingGrowthLevel) {
        this.UIManager.updateLevelRequirements(species, x.amount, x.growthLevel, 0);
        console.log("no plant found at correct growth level ");
        return;
      }

      // Find the plantable cells that match the species name (e.g., "Flytrap")
      const matchingCells = this.plantManager.getCells().filter((e) =>
        e.planterBox.plant.species === species
      ).length;

      if (matchingCells <= x.amount) {
        this.UIManager.updateLevelRequirements(species, x.amount, x.growthLevel, matchingCells);
        console.log("not enough plants for level to beat");
        return;
      }

      // Now, you can handle the matching cells for the current species (e.g., Flytrap)
      this.UIManager.updateWinText();
      console.log(
        `Found ${matchingCells} plantable cells for ${species} with growth level ${x.growthLevel}, LEVEL COMPLETE!`,
      );
    }
  }
}
