import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  private velocity: number;
  private moveStatus!: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame: number,
  ) {
    super(scene, x, y, texture, frame); // add texture

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setScale(4);
    this.setSize(10, 20);

    this.velocity = 150;

    this.keys = scene.input.keyboard
      ?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.keys.left.on("down", () => {
      this.anims.play("player-walk-left");
    });
    this.keys.right.on("down", () => {
      this.anims.play("player-walk-right");
    });
    this.keys.down.on("down", () => {
      this.anims.play("player-walk-down");
    });
    this.keys.up.on("down", () => {
      this.anims.play("player-walk-up");
    });
  }

  override update() {
    this.handleMovement();
  }

  //pulled from https://github.com/CJMoshy/Gemetic-Dungeon/blob/main/src/prefabs/Player.ts lines 36 to 63
  handleMovement() {
    // console.log("movew");
    const vector = new Phaser.Math.Vector2(0, 0);
    if (this.keys.down.isDown) {
      vector.y = 1;
      this.moveStatus = "down";
    }
    if (this.keys.up.isDown) {
      vector.y = -1;
      this.moveStatus = "up";
    }
    if (this.keys.left.isDown) {
      vector.x = -1;
      this.moveStatus = "left";
    }
    if (this.keys.right.isDown) {
      vector.x = 1;
      this.moveStatus = "right";
    }
    if (
      vector.x === 0 && vector.y === 0 && this.anims &&
      this.moveStatus !== "none"
    ) {
      this.anims.isPlaying = false;
      this.anims.stop();
      this.moveStatus = "none";
    }

    vector.normalize();
    this.setVelocity(this.velocity * vector.x, this.velocity * vector.y);
  }
}
