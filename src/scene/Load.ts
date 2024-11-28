import Phaser from "phaser";

import Player from "../../assets/player/player.png";
import TurnButton from "../../assets/turnButton/turnButton.png";
import ReapButton from "../../assets/turnButton/reapButton.png";
import SowButton from "../../assets/turnButton/sowButton.png";
import Undobutton from "../../assets/turnButton/undoButton.png";
import RedoButton from "../../assets/turnButton/redoButton.png";
import Aloe0 from "../../assets/plants/aloeLevel0.png";
import Aloe1 from "../../assets/plants/aloeLevel1.png";
import Aloe3 from "../../assets/plants/aloeLevel3.png";
import Flytrap0 from "../../assets/plants/flytrapLevel0.png";
import Flytrap1 from "../../assets/plants/flytrapLevel1.png";
import Flytrap3 from "../../assets/plants/flytrapLevel3.png";
import Wheat0 from "../../assets/plants/wheatLevel0.png";
import Wheat1 from "../../assets/plants/wheatLevel1.png";
import Wheat3 from "../../assets/plants/wheatLevel3.png";

import Blank from "../../assets/plants/blank.png";
import PlayerJson from "../../assets/player/player-walk-anims.json" with {
  type: "json",
};

import tilemap from "../../assets/tilemap/Farm.png";
import tilemapJSON from "../../assets/tilemap/FarmTilemap.json" with {
  type: "json",
};

import outline from "../../assets/outline.png";

import textBox from "../../assets/DialogueBox.png";

import scenario from "../util/gameLogic/scenario.json" with {
  type: "json",
};
import plantGrowth from "../util/gameLogic/plants.json" with {
  type: "json",
};

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
    this.load.image("undoButton", Undobutton);
    this.load.image("redoButton", RedoButton);

    this.load.image("Aloe VeraLevel0", Aloe0);
    this.load.image("Aloe VeraLevel1", Aloe1);
    this.load.image("Aloe VeraLevel2", Aloe3);
    this.load.image("FlytrapLevel0", Flytrap0);
    this.load.image("FlytrapLevel1", Flytrap1);
    this.load.image("FlytrapLevel2", Flytrap3);
    this.load.image("WheatLevel0", Wheat0);
    this.load.image("WheatLevel1", Wheat1);
    this.load.image("WheatLevel2", Wheat3);
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
