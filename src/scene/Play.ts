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

  constructor() {
    super({ key: "playScene" });
    this.plantableCells = [];
    this.UIWindowOpen = false;
  }

  init() {}
  preload() {}
  create() {
    const { width, height } = this.game.config;

    const map = this.add.tilemap("FarmTilemap");
    const tiles = map.addTilesetImage("FarmTileset", "base-tileset")!;

    map.createLayer(
      "Ground",
      tiles,
      width as number / 2 - 80,
      height as number / 2 - 80,
    );
    map.createLayer(
      "House",
      tiles,
      width as number / 2 - 80,
      height as number / 2 - 80,
    );
    const dirtLayer = map.createLayer(
      "Dirt",
      tiles,
      width as number / 2 - 80,
      height as number / 2 - 80,
    );
    dirtLayer?.setCollisionByProperty({ Interactable: true });
    map.setCollisionByProperty({ OpenWindow: true });

    const iterableDirt = map.getObjectLayer("Plantable")!;
    iterableDirt.objects.forEach((element) => {
      console.log(
        "making planterbox",
        Math.round(element.x as number),
        Math.round(element.y as number),
      );
      this.plantableCells.push({
        i: Math.round(element.x as number),
        j: Math.round(element.y as number),
        planterBox: {
          waterLevel: 0,
          sunLevel: 0,
          plant: {
            species: "something",
            growthLevel: plantGrowthLevel.seedling,
          },
        },
      });
    });

    this.player = new Player(this, 80, 80, "player", 0);
    this.initTimeElapsing();

    dirtLayer?.setInteractive().on("pointermove", () => {
      this.tileOutline?.destroy();
      const tile = dirtLayer?.getTileAtWorldXY(
        this.game.input.activePointer!.x,
        this.game.input.activePointer!.y,
      );
      if (tile?.properties.Interactable) {
        console.log("make outline", tile.pixelX, tile.pixelY);
        this.tileOutline = this.add.image(
          tile.pixelX + 8,
          tile.pixelY + 8,
          "outline",
        );
      }
    });

    dirtLayer?.on("pointerdown", () => {
      const tile = dirtLayer?.getTileAtWorldXY(
        this.game.input.activePointer!.x,
        this.game.input.activePointer!.y,
      );
      if (tile?.properties.Interactable) {
        console.log(this.plantableCells.find((e) => e.i === tile.pixelX + 1));
      }
    });

    this.physics.add.overlap(this.player, dirtLayer!, () => {
      const tile = dirtLayer?.getTileAtWorldXY(this.player.x, this.player.y);
      if (tile?.properties.OpenWindow === false && !this.UIWindowOpen) {
        this.UIWindowOpen = true;
        console.log("open window event");
        this.events.emit("openWindowEvent");
      } else if (!tile?.properties && this.UIWindowOpen) {
        this.UIWindowOpen = false;
        this.events.emit("closeWindowEvent");
        console.log("close window event");
      }
    });
  }

  //deno-lint-ignore no-unused-vars
  override update(time: number, delta: number): void {
    this.player.update();
  }

  initTimeElapsing() {
    const { timeStamps } = GAME_CONFIG.TIME;
    this.currentTimeEnum = 0; // in the future this will have to be init from local storage
    this.elapsedTimeText = this.add.text(
      GAME_CONFIG.UI.BORDER_PADDING,
      GAME_CONFIG.UI.BORDER_PADDING,
      timeStamps[this.currentTimeEnum],
    );
    // this.setTimeElapsing(this.elapsedTimeToggle)
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
}
