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

    // query the html and get the dropdown of what save
    const gameSavesSelect = document.getElementById(
      "gameSaves",
    ) as HTMLSelectElement; // it will always start at 1

    // whenever it changes set that to the state we want to save
    gameSavesSelect.addEventListener("change", () => {
      this.savedGameSlot = Number(
        gameSavesSelect.value.at(gameSavesSelect.value.length - 1),
      );
      console.log(`User selected: ${this.savedGameSlot}`);
    });

    // save button saves the game
    document.getElementById("saveBtn")?.addEventListener(
      "click",
      () => this.saveGame(),
    );
  }

  // getter for the game slot
  getSavedGameSlot() {
    return this.savedGameSlot;
  }

  // setter
  setSavedGameSlot(slot: number) {
    this.savedGameSlot = slot;
  }

  initGame() {
    this.scene.events.on("nextTurnEvent", () => this.advanceTurn());
    // set up game
    this.TimeManager.initTimeElapsing();
    this.UIManager.initUI();
    this.loadSavedGame(); // load saved game TODO -> load a specific save
    this.UIManager.setTurnText(this.turnCounter.toString());
  }

  // save game funciton
  saveGame() {
    const toByteArr = new Uint8Array(
      this.plantManager.getPlantableCellBuffer(),
    );
    saveGameState({
      currentLevel: this.currentLevel,
      currentTurn: this.turnCounter,
      plantData: Array.from(toByteArr),
    }, this.savedGameSlot); // pass in a 'slot' to save different instances of the game
  }

  // load game from local storage
  loadSavedGame() {
    if (!loadGameState(this.savedGameSlot)) { // loadGameState can return false
      this.scene.events.emit("newGameEvent"); // this means its a new game
      this.turnCounter = 1; // so we set defaults
      this.currentLevel = 1; // so we set defaults
    } else { // otherwise we found some data
      let plantData: ArrayBuffer; // so we load it
      [this.currentLevel, this.turnCounter, plantData] = loadGameState(
        this.savedGameSlot,
      ) as [number, number, ArrayBuffer];
      this.plantManager.setPlantableCellBuffer(plantData); // set all the cells to the loaded data
      this.scene.events.emit("loadGameSprites");
    }
  }

  // logic for advancing turn
  advanceTurn() {
    this.turnCounter += 1;
    const asCells = this.plantManager.getAllPlantableCells(); // get all cells as Cell[] type for easy manip
    this.scene.events.emit( // emit an event that game state is advancing
      "gameStateAdvance",
      JSON.parse(JSON.stringify(asCells)), // make a deep copy of the cells and pass it with the event SEE PLAY.ts line 108
    );
    let arrayBufferOffset = 0; // this is needed for the arraybuffer
    asCells.forEach((cell) => {
      this.generateSun(cell);
      this.generateWater(cell);
      this.plantManager.updatePlantGrowth(cell);
      this.plantManager.addPlantableCell(arrayBufferOffset, cell); // write to the buffer the updated cells
      arrayBufferOffset += 1;
    });

    if (this.selectedCell) { // is there a window open with a cell in it
      this.UIManager.updatePlantInfoUI( // then update the ui
        this.plantManager.getAllPlantableCells()[this.selectedCellIndex]
          .planterBox,
      );
    }

    // query level status
    this.handleCompleteLevel();
    this.UIManager.setTurnText(this.turnCounter.toString()); // increment turn counter

    // save game
    this.saveGame();
  }

  // elton generate thing
  generateSun(currentCell: Cell) {
    currentCell.planterBox.sunLevel = Phaser.Math.Between(0, 5);
  }

  // elton generate thing
  generateWater(currentCell: Cell) {
    currentCell.planterBox.waterLevel = currentCell.planterBox.waterLevel +
      Number(Phaser.Math.FloatBetween(0, 3).toFixed(3));
    if (currentCell.planterBox.waterLevel >= 5) {
      currentCell.planterBox.waterLevel = 5;
    }
  }

  // deals with beating a level
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
        this.UIManager.updateLevelRequirements(species, x.amount, x.growthLevel, 0);
        console.log("no plant found at correct growth level ");
        return;
      }

      // Find the plantable cells that match the species name (e.g., "Flytrap") and are of the right growth
      const matchingCells =
        this.plantManager.getAllPlantableCells().filter((e) =>
          e.planterBox.plant.species === species && e.planterBox.plant.growthLevel == x.growthLevel
        ).length;

      if (matchingCells < x.amount) {
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
