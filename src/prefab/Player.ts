import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  private velocity: number;
  private moveStatus!: string;
  private tileWidth: number;
  private isMoving: boolean;
  private parentScene: Phaser.Scene;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame: number,
    tileWidth: number,
  ) {
    super(scene, x, y, texture, frame); // add texture

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setScale(4);
    this.setSize(10, 20);

    this.parentScene = scene;
    this.velocity = 150;

    this.tileWidth = tileWidth;

    this.isMoving = false;

    this.keys = scene.input.keyboard
      ?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;

    this.keys.left.on("down", () => {
      this.anims.play("player-walk-left");
      this.handleMovement("left");
    });
    this.keys.right.on("down", () => {
      this.anims.play("player-walk-right");
      this.handleMovement("right");
    });
    this.keys.down.on("down", () => {
      this.anims.play("player-walk-down");
      this.handleMovement("up");
    });
    this.keys.up.on("down", () => {
      this.anims.play("player-walk-up");
      this.handleMovement("down");
    });
  }

  override update() {}

  handleMovement(direction: string) {
    if (this.isMoving) {
      return;
    }

    const vector = new Phaser.Math.Vector2(0, 0);
    this.isMoving = true;
    switch (direction) {
      case "left":
        vector.x = -1;
        break;
      case "right":
        vector.x = 1;
        break;
      case "down":
        vector.y = -1;
        break;
      case "up":
        vector.y = 1;
        break;
    }

    vector.normalize();
    this.setVelocity(this.velocity * vector.x, this.velocity * vector.y);

    this.parentScene.time.delayedCall(500, () => {
      this.setVelocity(0);
      this.anims.stop();
      this.isMoving = false;
    });
  }
}
