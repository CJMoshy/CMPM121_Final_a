import Phaser from "phaser";

// USE THESE FOR PROD
const Player = getAssetUrl("./player/player.png");
const TurnButton = getAssetUrl("./turnButton/turnButton.png");
const ReapButton = getAssetUrl("./turnButton/reapButton.png");
const SowButton = getAssetUrl("./turnButton/sowButton.png");
const UndoButton = getAssetUrl("./turnButton/undoButton.png");
const RedoButton = getAssetUrl("./turnButton/redoButton.png");
const Aloe0 = getAssetUrl("./plants/aloeLevel0.png");
const Aloe1 = getAssetUrl("./plants/aloeLevel1.png");
const Aloe2 = getAssetUrl("./plants/aloeLevel2.png");
const Aloe3 = getAssetUrl("./plants/aloeLevel3.png");
const Flytrap0 = getAssetUrl("./plants/flytrapLevel0.png");
const Flytrap1 = getAssetUrl("./plants/flytrapLevel1.png");
const Flytrap2 = getAssetUrl("./plants/flytrapLevel2.png");
const Flytrap3 = getAssetUrl("./plants/flytrapLevel3.png");
const Wheat0 = getAssetUrl("./plants/wheatLevel0.png");
const Wheat1 = getAssetUrl("./plants/wheatLevel1.png");
const Wheat2 = getAssetUrl("./plants/wheatLevel2.png");
const Wheat3 = getAssetUrl("./plants/wheatLevel3.png");
const Blank = getAssetUrl("./plants/blank.png");
const tilemap = getAssetUrl("./tilemap/Farm.png");
const outline = getAssetUrl("./outline.png");
const textBox = getAssetUrl("./DialogueBox.png");

// USE THESE FOR DEV
// const Player = getAssetUrl("/assets/player/player.png");
// const TurnButton = getAssetUrl("/assets/turnButton/turnButton.png");
// const ReapButton = getAssetUrl("/assets/turnButton/reapButton.png");
// const SowButton = getAssetUrl("/assets/turnButton/sowButton.png");
// const UndoButton = getAssetUrl("/assets/turnButton/undoButton.png");
// const RedoButton = getAssetUrl("/assets/turnButton/redoButton.png");
// const Aloe0 = getAssetUrl("/assets/plants/aloeLevel0.png");
// const Aloe1 = getAssetUrl("/assets/plants/aloeLevel1.png");
// const Aloe2 = getAssetUrl("/assets/plants/aloeLevel2.png");
// const Aloe3 = getAssetUrl("/assets/plants/aloeLevel3.png");
// const Flytrap0 = getAssetUrl("/assets/plants/flytrapLevel0.png");
// const Flytrap1 = getAssetUrl("/assets/plants/flytrapLevel1.png");
// const Flytrap2 = getAssetUrl("/assets/plants/flytrapLevel2.png");
// const Flytrap3 = getAssetUrl("/assets/plants/flytrapLevel3.png");
// const Wheat0 = getAssetUrl("/assets/plants/wheatLevel0.png");
// const Wheat1 = getAssetUrl("/assets/plants/wheatLevel1.png");
// const Wheat2 = getAssetUrl("/assets/plants/wheatLevel2.png");
// const Wheat3 = getAssetUrl("/assets/plants/wheatLevel3.png");
// const Blank = getAssetUrl("/assets/plants/blank.png");
// const tilemap = getAssetUrl("/assets/tilemap/Farm.png");
// const outline = getAssetUrl("/assets/outline.png");
// const textBox = getAssetUrl("/assets/DialogueBox.png");

import PlayerJson from "../util/json/player-walk-anims.json" with {
  type: "json",
};

import tilemapJSON from "../util/json/FarmTilemap.json" with {
  type: "json",
};

import scenario from "../util/gameLogic/scenario.json" with {
  type: "json",
};
import plantGrowth from "../util/gameLogic/plants.json" with {
  type: "json",
};

function getAssetUrl(path: string): string {
  return new URL(path, import.meta.url).href;
}

export default class Load extends Phaser.Scene {
  constructor() {
    super({ key: "loadScene" });
  }

  init() {}
  preload() {
    this.load.image("outline", outline);
    this.load.image("base-tileset", tilemap);
    this.load.tilemapTiledJSON("FarmTilemap", tilemapJSON);
    this.load.image("dBox", textBox);
    this.load.atlas("player", Player, PlayerJson);
    this.load.image("turnButton", TurnButton);
    this.load.image("reapButton", ReapButton);
    this.load.image("sowButton", SowButton);
    this.load.image("undoButton", UndoButton);
    this.load.image("redoButton", RedoButton);

    this.load.image("Aloe VeraLevel0", Aloe0);
    this.load.image("Aloe VeraLevel1", Aloe1);
    this.load.image("Aloe VeraLevel2", Aloe2);
    this.load.image("Aloe VeraLevel3", Aloe3);
    this.load.image("FlytrapLevel0", Flytrap0);
    this.load.image("FlytrapLevel1", Flytrap1);
    this.load.image("FlytrapLevel2", Flytrap2);
    this.load.image("FlytrapLevel3", Flytrap3);
    this.load.image("WheatLevel0", Wheat0);
    this.load.image("WheatLevel1", Wheat1);
    this.load.image("WheatLevel2", Wheat2);
    this.load.image("WheatLevel3", Wheat3);
    this.load.image("blank", Blank);

    this.load.json("scenario", scenario);
    this.load.json("plantGrowthReq", plantGrowth);
  }
  create() {
    this.anims.create({
      key: "player-walk-up",
      frames: this.anims.generateFrameNames("player", {
        prefix: "walking-up-",
        start: 1,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "player-walk-down",
      frames: this.anims.generateFrameNames("player", {
        prefix: "walking-down-",
        start: 1,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "player-walk-left",
      frames: this.anims.generateFrameNames("player", {
        prefix: "walking-left-",
        start: 1,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "player-walk-right",
      frames: this.anims.generateFrameNames("player", {
        prefix: "walking-right-",
        start: 1,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.scene.start("menuScene");
  }

  //deno-lint-ignore no-unused-vars
  override update(time: number, delta: number): void {
  }
}
