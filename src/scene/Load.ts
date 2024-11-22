import Phaser from "phaser";

import Player from "../../assets/player/player.png";
import TurnButton from "../../assets/turnButton/turnButton.png";
import PlayerJson from "../../assets/player/player-walk-anims.json" with {
  type: "json",
};

import tilemap from "../../assets/tilemap/Farm.png";
import tilemapJSON from "../../assets/tilemap/FarmTilemap.json" with {
  type: "json",
};

import outline from "../../assets/outline.png";

import textBox from "../../assets/DialogueBox.png";

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
