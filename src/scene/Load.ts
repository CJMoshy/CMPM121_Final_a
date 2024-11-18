import Phaser from "phaser";

export default class Load extends Phaser.Scene {
    constructor() {
        super({ key: "loadScene" });
    }

    init() {}
    preload() {}
    create() {}

    //deno-lint-ignore no-unused-vars
    override update(time: number, delta: number): void {
    }
}
