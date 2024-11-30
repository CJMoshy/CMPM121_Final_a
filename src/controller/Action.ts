import type GameManager from "./GameManager.ts";

export default class Action {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  execute(manager: GameManager) {
    manager.plantManager.setPlantableCellBuffer(
      new Uint8Array(this.state.plantData).buffer,
    );
    manager.turnCounter = this.state.currentTurn;
    manager.UIManager.setTurnText(this.state.currentTurn.toString());
  }
}
