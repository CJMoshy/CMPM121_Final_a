import Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  constructor() {
    super({ key: "menuScene" });
  }

  init() {}
  preload() {}
  create() {
    this.scene.start("playScene");
  }

  //deno-lint-ignore no-unused-vars
  override update(time: number, delta: number): void {
  }
}
