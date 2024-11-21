import "./style.css";
import Phaser from "phaser";
import Load from "./scene/Load.ts";
import Menu from "./scene/Menu.ts";
import Credit from "./scene/Credits.ts";
import Play from "./scene/Play.ts";

const CONFIG = {
  type: Phaser.CANVAS,
  parent: "phaser-game",
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    size: Phaser.Scale.FIT,
  },
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
    },
  },
  scene: [Load, Menu, Credit, Play],
};

document.addEventListener("DOMContentLoaded", () => {
  new Phaser.Game(CONFIG);
});
