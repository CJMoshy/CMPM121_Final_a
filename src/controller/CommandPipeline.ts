/**
 * @file CommandPipeline.ts
 * @purpose defines high level asbtraction to handle undo and redo with associated commands
 * @author CJ Moshy
 */

export default class CommandPipeline {
  private actionStack: AbstractGameCommand[];
  private redoStack: AbstractGameCommand[];
  constructor() {
    this.actionStack = [];
    this.redoStack = [];
  }

  addCommand(cmd: AbstractGameCommand) {
    this.actionStack.push(cmd);
  }

  undo() {
    if (this.actionStack.length === 0) return;
    const action = this.actionStack.pop()!;
    action.executeUndo();
    this.redoStack.push(action);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const action = this.redoStack.pop()!;
    action.executeRedo();
    this.actionStack.push(action);
  }

  saveToLocalStorage() {
    const serialActionStack: [string, string][] = [];
    const serialRedoStack: [string, string][] = [];
    this.actionStack.forEach((element) => {
      for (const [key, value] of Object.entries(element)) {
        serialActionStack.push([key.toString(), value.toString()]);
      }
    });
    this.redoStack.forEach((element) => {
      for (const [key, value] of Object.entries(element)) {
        serialRedoStack.push([key.toString(), value.toString()]);
      }
    });

    localStorage.setItem("action", JSON.stringify(serialActionStack));
    localStorage.setItem("redo", JSON.stringify(serialRedoStack));
  }

  loadFromLocalStorage() {
    const _action = localStorage.getItem("action");
    const _redo = localStorage.getItem("redo");

    if (_action) {
      console.log(_action);
      this.actionStack = JSON.parse(_action);
      console.log(this.actionStack);
    }
    if (_redo) {
      this.redoStack = JSON.parse(_redo);
      console.log(this.redoStack);
    }
  }
}
