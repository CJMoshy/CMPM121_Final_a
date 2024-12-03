import Phaser from "phaser";
import { plantGrowthLevel } from "../util/GameConfig.ts";
import Player from "../prefab/Player.ts";
import PlantManager from "../controller/PlantController.ts";
import UIManager from "../controller/UIController.ts";
import TimeManager from "../controller/TimeController.ts";
import GameManager from "../controller/GameManager.ts";
import CommandPipeline from "../controller/CommandPipeline.ts";
import Action from "../controller/Action.ts";

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

    this.commandPipeline = new CommandPipeline(this.gameManager);

    document.getElementById("loadBtn")?.addEventListener(
      "click",
      () => {
        this.gameManager.loadGameFromSlot();
        this.gameManager.selectedCell = undefined;
        this.player.setX(this.game.config.width as number / 2);
        this.player.setY(this.game.config.height as number / 2 - 64);
        if (this.UIWindowOpen) {
          this.UIManager.closeWindow();
        }
        this.UIManager.updateTextTween(
          this.player.x,
          this.player.y,
          "Load Game",
        );
      },
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

    //initialize/adding sprites for all tiles, sprites will get set later so only added once
    const iterableDirt = map.getObjectLayer("Plantable")!;
    iterableDirt.objects.forEach((element) => {
      this.plantManager.initSprite(
        Math.floor(element.x as number),
        Math.floor(element.y as number),
      );
    });

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

    // if a new game exists then we need to go through all the cells and set them up
    this.events.on("newGameEvent", () => {
      const iterableDirt = map.getObjectLayer("Plantable")!;
      let count = 0;
      iterableDirt.objects.forEach((element) => {
        const cell: Cell = {
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
        };
        this.plantManager.addPlantableCell(count, cell);

        //set all sprites to blank
        this.plantManager.updateSprite(
          Math.floor(element.x as number),
          Math.floor(element.y as number),
          "blank",
        );
        count += 1;
      });
    });

    this.events.on("loadGameSprites", () => {
      const iterableDirt = map.getObjectLayer("Plantable")!;
      iterableDirt.objects.forEach((element) => {
        const plantableCell = this.plantManager.getAllPlantableCells().find((
          cell,
        ) =>
          cell.i === Math.floor(element.x as number) &&
          cell.j === Math.floor(element.y as number)
        );
        const plantSprite = plantableCell?.planterBox.plant.species;
        if (plantSprite != "none") {
          this.plantManager.updateSprite(
            Math.floor(element.x as number),
            Math.floor(element.y as number),
            plantSprite + "Level" + plantableCell?.planterBox.plant.growthLevel,
          );
        } else {
          this.plantManager.updateSprite(
            Math.floor(element.x as number),
            Math.floor(element.y as number),
            "blank",
          );
        }
      });
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

    // THREE THINGS CAN HAPPEN. WE SOW, WE REAP, WE GO NEXT TURN
    // regardless of this, every time one of these 'things' happens, we save the game state
    this.events.on("gameStateAdvance", (event: string) => {
      const state: GameState = {
        currentTurn: this.gameManager.turnCounter,
        currentLevel: this.gameManager.currentLevel,
        plantData: Array.from(
          new Uint8Array(this.plantManager.getPlantableCellBuffer()),
        ),
      };
      this.commandPipeline.addCommand(new Action(state));
      this.commandPipeline.saveToLocalStorage();
      switch (event) {
        case "reap":
          this.reap();
          break;
        case "sow":
          this.sow();
          break;
        default:
          break;
      }
    });

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

    this.events.on("undoEvent", () => {
      this.commandPipeline.undo();
      this.UIManager.updateTextTween(this.player.x, this.player.y, "Undo");
      this.events.emit("updateUndoRedo");
    });
    this.events.on("redoEvent", () => {
      this.commandPipeline.redo();
      this.UIManager.updateTextTween(this.player.x, this.player.y, "Redo");
      this.events.emit("updateUndoRedo");
    });

    this.events.on("updateUndoRedo", () => {
      this.events.emit("loadGameSprites");
      // console.log(this.gameManager.selectedCell?.planterBox);
      if (this.gameManager.selectedCell) {
        const plantableCell = this.plantManager.getAllPlantableCells().find((
          cell,
        ) =>
          cell.i === this.gameManager.selectedCell?.i &&
          cell.j === this.gameManager.selectedCell?.j
        );
        const plantableCellIndex = this.plantManager.getAllPlantableCells()
          .findIndex((
            cell,
          ) =>
            cell.i === this.gameManager.selectedCell?.i &&
            cell.j === this.gameManager.selectedCell?.j
          );
        if (plantableCell) {
          this.gameManager.selectedCell = plantableCell;
          this.gameManager.selectedCellIndex = plantableCellIndex;
          const plantData = plantableCell.planterBox;
          this.UIManager.updatePlantInfoUI(plantData);
        }
      }
    });
  }

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

    plant.species = "none";
    plant.growthLevel = 0;
    this.plantManager.addPlantableCell(
      this.gameManager.selectedCellIndex,
      this.gameManager.selectedCell,
    );
    this.plantManager.updateSprite(
      this.gameManager.selectedCell.i,
      this.gameManager.selectedCell.j,
      "blank",
    ); // set sprite to blank
    this.UIManager.updatePlantInfoUI(this.gameManager.selectedCell.planterBox);
    console.log(plant);
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
      plant.species = selectedRadio
        .value as PlantSpecies;
      this.plantManager.addPlantableCell(
        this.gameManager.selectedCellIndex,
        this.gameManager.selectedCell,
      );
      this.plantManager.updateSprite(
        this.gameManager.selectedCell.i,
        this.gameManager.selectedCell.j,
        plant.species + "Level0",
      ); // set sprite to blank
      this.UIManager.updatePlantInfoUI(
        this.gameManager.selectedCell.planterBox,
      );
    } else {
      console.log("no plant selected");
    }
  }
}

//     // TODO FIX
//     // whenever the game state moves forward we want to save the previous board state so we can undo
//     this.events.on("gameStateAdvance", (arg: GameState[]) => {
//       //immediately set the state to local storage
//       localStorage.setItem(
//         `turn#${this.globalTurnCounter}`,
//         JSON.stringify(arg),
//       );

//       const CMD: AbstractGameCommand = {
//         executeUndo: () => {
//           const thisTurn = localStorage.getItem(
//             `turn#${this.gameManager.turnCounter - 1}`,
//           );
//           if (thisTurn) {
//             const parsed = JSON.parse(thisTurn) as GameState[];
//             this.plantManager.setPlantableCellBuffer(
//               new Uint8Array(parsed[0].plantData).buffer,
//             );

//             this.UIManager.setTurnText(
//               parsed[0].currentTurn.toString(),
//             );

//             this.gameManager.turnCounter--;
//             if (this.gameManager.selectedCell) {
//               this.UIManager.updatePlantInfoUI(
//                 this.gameManager.selectedCell.planterBox,
//               );
//             }
//           }
//         },
//         executeRedo: () => {
//           const thisTurn = localStorage.getItem(
//             `turn#${this.gameManager.turnCounter}`,
//           );
//           if (thisTurn) {
//             const parsed = JSON.parse(thisTurn) as GameState[];
//             this.plantManager.setPlantableCellBuffer(
//               new Uint8Array(parsed[1].plantData).buffer,
//             );
//             this.gameManager.turnCounter++;
//             this.UIManager.setTurnText(
//               parsed[1].currentTurn.toString(),
//             );
//           }
//         },
//       };
//       this.commandPipeline.addCommand([["Undo", CMD.executeUndo.toString()], [
//         "Redo",
//         CMD.executeRedo.toString(),
//       ]]);
//       this.globalTurnCounter++;
//     });

//     this.events.on("reapEvent", () => this.reap());
//     this.events.on("sowEvent", () => this.sow());
//   }

//   //deno-lint-ignore no-unused-vars
//   override update(time: number, delta: number): void {
//     this.player.update();
//   }

//   // reap method encapsulates everything it needs to reap or sow in a closure which is passed to command pipeline as undo/redo
//   reap() {
//     if (!this.gameManager.selectedCell) {
//       console.log("no cell selected");
//       return;
//     }
//     const { plant } = this.gameManager.selectedCell.planterBox;
//     if (plant.species === "none") {
//       console.log("no plant to harvest");
//       return;
//     }
//     console.log(
//       `Reaping plant. species: ${plant.species} growthLevel: ${plant.growthLevel}`,
//     );

//     // this is key we need alias of stuff so when they change we can remember the old things
//     const selectedCellAlias = this.gameManager.selectedCell; // this works but we might need to deep copy
//     const selectedCellIndexAlias = this.gameManager.selectedCellIndex; // this works but we might need to deep copy
//     const plantAlias = JSON.parse(JSON.stringify(plant)); // deep copy here to ensure old plant stays the same?

//     const plantSave = {
//       plant,
//       selectedCellAlias,
//       selectedCellIndexAlias,
//     };

//     localStorage.setItem(
//       `plantSave#${this.globalTurnCounter}`,
//       JSON.stringify(plantSave),
//     );

//     const command = {
//       executeUndo: () => { // this is the opposite of reaping. its not sowing because in the future if we tie more logic into sow we could be potentially losing seeds etc...
//         const plantSave = localStorage.getItem(
//           `plantSave#${++this.globalTurnCounter}`,
//         );
//         if (plantSave) {
//           const parsed = JSON.parse(plantSave);
//           const { plant, selectedCellAlias, selectedCellIndexAlias } = parsed;
//           plant.species = plantAlias.species;
//           plant.growthLevel = plantAlias.growthLevel;
//           this.plantManager.addPlantableCell(
//             selectedCellIndexAlias,
//             selectedCellAlias,
//           );
//           this.UIManager.updatePlantInfoUI(
//             selectedCellAlias.planterBox,
//           );
//         }
//       },
//       executeRedo: () => {
//         console.log(this.globalTurnCounter);
//         const plantSave = localStorage.getItem(
//           `plantSave#${this.globalTurnCounter}`,
//         );
//         if (plantSave) {
//           const parsed = JSON.parse(plantSave);
//           const { plant, selectedCellAlias, selectedCellIndexAlias } = parsed;
//           plant.species = "none"; // this is everything associated with reaping
//           plant.growthLevel = 0; // this is everything associated with reaping
//           this.plantManager.addPlantableCell( // this is everything associated with reaping
//             selectedCellIndexAlias,
//             selectedCellAlias,
//           );
//           this.UIManager.updatePlantInfoUI( // this is everything associated with reaping
//             selectedCellAlias.planterBox,
//           );
//         }
//       },
//     };

//     this.commandPipeline.addCommand([["Undo", command.executeUndo.toString()], [
//       "Redo",
//       command.executeRedo.toString(),
//     ]]);
//     command.executeRedo();
//     this.globalTurnCounter++;
//   }

//   // same idea as above
//   sow() {
//     if (!this.gameManager.selectedCell) {
//       console.log("No cell selected");
//       return;
//     }
//     if (this.gameManager.selectedCell.planterBox.plant.species !== "none") {
//       console.log("Already a plant here");
//       return;
//     }

//     const selectedRadio = document.querySelector(
//       'input[name="choice"]:checked',
//     ) as HTMLInputElement;
//     if (selectedRadio) {
//       console.log(
//         `Sowing plant. species: ${selectedRadio.value as PlantSpecies}`,
//       );
//       if (this.gameManager.selectedCell) {
//         const { plant } = this.gameManager.selectedCell.planterBox;
//         const selectedCellAlias = this.gameManager.selectedCell;
//         const selectedCellIndexAlias = this.gameManager.selectedCellIndex;
//         plant.species = selectedRadio
//           .value as PlantSpecies;
//         this.plantManager.addPlantableCell(
//           selectedCellIndexAlias,
//           selectedCellAlias,
//         );
//         this.UIManager.updatePlantInfoUI(
//           selectedCellAlias!.planterBox,
//         );
//         const plantSave = {
//           plant,
//           selectedCellAlias,
//           selectedCellIndexAlias,
//         };
//         localStorage.setItem(
//           `plantSave#${this.globalTurnCounter}`,
//           JSON.stringify(plantSave),
//         );
//         this.globalTurnCounter++;
//       }

//       const command = {
//         executeUndo: () => {
//           const plantSave = localStorage.getItem(
//             `plantSave#${--this.globalTurnCounter}`,
//           );
//           if (plantSave) {
//             const parsed = JSON.parse(plantSave);
//             const {selectedCellAlias, selectedCellIndexAlias } = parsed;
//             selectedCellAlias.planterBox.plant.species = 'none'
//             selectedCellAlias.planterBox.plant.growthLevel = 0
//             this.plantManager.addPlantableCell(
//               selectedCellIndexAlias,
//               selectedCellAlias,
//             );
//             this.UIManager.updatePlantInfoUI(
//               selectedCellAlias.planterBox,
//             );
//           }
//         },
//         executeRedo: () => {
//           // same alias thing

//         },
//       };

//       this.commandPipeline.addCommand([
//         ["Undo", command.executeUndo.toString()],
//         ["Redo", command.executeRedo.toString()],
//       ]);
//       command.executeRedo();
//     } else {
//       console.log("Plant not selected");
//     }
//   }
// }
