import "./style.css";
import Phaser from "phaser";
import Load from "./scene/Load.ts";
import Menu from "./scene/Menu.ts";
import Credit from "./scene/Credits.ts";
import Play from "./scene/Play.ts";

const PHASER_CONFIG = {
  type: Phaser.CANVAS,
  parent: "phaser-game",
  width: 640,
  height: 640,
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
    },
  },
  // zoom: 4,
  scene: [Load, Menu, Credit, Play],
};

document.addEventListener("DOMContentLoaded", () => {
  new Phaser.Game(PHASER_CONFIG);
});
