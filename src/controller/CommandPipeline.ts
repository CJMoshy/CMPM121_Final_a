/**
 * @file CommandPipeline.ts
 * @purpose defines high level asbtraction to handle undo and redo with associated commands
 * @author CJ Moshy
 */

import Action from "./Action.ts";
import type GameManager from "./GameManager.ts";

export default class CommandPipeline {
  private actionStack!: Action[];
  private redoStack!: Action[];
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.loadFromLocalStorage();
    this.gameManager = gameManager;
  }

  addCommand(cmd: Action) {
    this.actionStack.push(cmd);
  }

  undo() {
    if (this.actionStack.length === 0) return;
    const action = this.actionStack.pop()!;

    const currentState = this.gameManager.getCurrentState(); // Get the current state of the game.
    this.redoStack.push(currentState);

    action.execute(this.gameManager);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const action = this.redoStack.pop()!;

    const currentState = this.gameManager.getCurrentState(); // Get the current state of the game.
    this.actionStack.push(currentState);

    action.execute(this.gameManager);
  }

  saveToLocalStorage() {
    const actionStackState = [];
    const redoStackState = [];
    for (const x of this.actionStack) {
      actionStackState.push(x.getState());
    }
    for (const y of this.redoStack) {
      redoStackState.push(y.getState());
    }
    console.log(actionStackState);
    localStorage.setItem(
      "cmd",
      JSON.stringify([actionStackState, redoStackState]),
    );
  }

  loadFromLocalStorage() {
    const cmd = localStorage.getItem("cmd");
    this.actionStack = [];
    this.redoStack = [];
    if (cmd) {
      const parsed = JSON.parse(cmd);
      console.log(parsed);
      for (const x of parsed[0]) {
        console.log(x);
        this.actionStack.push(new Action(x));
      }
      for (const y of parsed[1]) {
        this.redoStack.push(new Action(y));
      }
    }
  }
}

// private actionStack: CommandPipelineSave[];
// private redoStack: CommandPipelineSave[];
// private thisAlias: Phaser.Scene;
// constructor(scene: Phaser.Scene) {
//   this.thisAlias = scene;
//   this.actionStack = [];
//   this.redoStack = [];
// }
// saveToLocalStorage() {
//   const serialActionStack: CommandPipelineSave[] = [];
//   const serialRedoStack: CommandPipelineSave[] = [];
//   if (this.actionStack.length > 0) {
//     this.actionStack.forEach((element) => {
//       const aSingleCommand = [[element[0][0].toString(), element[0][1].toString()], [element[1][0].toString(), element[1][1].toString()]];
//       serialActionStack.push(aSingleCommand as CommandPipelineSave);
//     });
//   }
//   if (this.redoStack.length > 0) {
//     this.redoStack.forEach((element) => {
//       const aSingleCommand = [[element[0][0].toString(), element[0][1].toString()], [element[1][0].toString(), element[1][1].toString()]];
//       serialRedoStack.push(aSingleCommand as CommandPipelineSave);
//     });
//   }
//   localStorage.setItem("action", JSON.stringify(serialActionStack));
//   localStorage.setItem("redo", JSON.stringify(serialRedoStack));
// }

// loadFromLocalStorage() {
//   const _action = localStorage.getItem("action");
//   const _redo = localStorage.getItem("redo");

//   if (_action) {
//     const parsed: CommandPipelineSave[] = JSON.parse(_action);
//     if (parsed.length > 0) {
//       for (const abg of parsed) {
//         this.actionStack.push(abg);
//       }
//     }
//   }
//   if (_redo) {
//     const parsed: CommandPipelineSave[] = JSON.parse(_redo);
//     if (parsed.length > 0) {
//       for (const abg of parsed) {
//         this.redoStack.push(abg);
//       }
//     }
//   }
//   console.log(this.actionStack, this.redoStack);
// }

// public toAbstractGameCommand(arg: CommandPipelineSave, undo: boolean) {
//   const undoFuncStr = arg[0][1]; // The stringified undo function
//   const redoFuncStr = arg[1][1]; // The stringified redo function

//   function removeFunctionPrefix(funcStr: string): string {
//     // This regex will match both arrow functions and regular function declarations:
//     // Match: `() =>` or `function <name>()`
//     const regex =
//       /^\s*(?:\(\s*\)\s*=>\s*|function\s+[a-zA-Z0-9$_]+\s*\([^)]*\)\s*)/;
//     const bodyMatch = funcStr.replace(regex, "").trim();
//     const bodyStart = bodyMatch.indexOf("{");
//     const bodyEnd = bodyMatch.lastIndexOf("}");

//     if (bodyStart >= 0 && bodyEnd >= 0) {
//       return bodyMatch.slice(bodyStart, bodyEnd + 1).trim();
//     }
//     return "";
//   }
//   const regularUndoFuncStr = removeFunctionPrefix(undoFuncStr);
//   const regularRedoFuncStr = removeFunctionPrefix(redoFuncStr);

//   const undoFunc = new Function(regularUndoFuncStr);
//   const redoFunc = new Function(regularRedoFuncStr);

//   const boundUndoFunc = undoFunc!.bind(this.thisAlias);
//   const boundRedoFunc = redoFunc!.bind(this.thisAlias);

//   undo ? boundUndoFunc() : boundRedoFunc()
// }
