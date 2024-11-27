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
    this.isMoving = true;

    const finalPos = {
      x: this.x,
      y: this.y,
    };
    const TILE_SIZE = 64;

    switch (direction) {
      case "left":
        finalPos.x -= TILE_SIZE;
        break;
      case "right":
        finalPos.x += TILE_SIZE;
        break;
      case "down":
        finalPos.y -= TILE_SIZE;
        break;
      case "up":
        finalPos.y += TILE_SIZE;
        break;
    }

    this.parentScene.add.tween({
      targets: this,
      x: finalPos.x,
      y: finalPos.y,
      duration: 750,
      onComplete: () => {
        this.setPosition(finalPos.x, finalPos.y);
        this.isMoving = false;
        this.anims.stop();
      },
    });
  }
}
