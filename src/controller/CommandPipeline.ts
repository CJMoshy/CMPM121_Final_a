/**
 * @file CommandPipeline.ts
 * @purpose defines high level asbtraction to handle undo and redo with associated commands
 * @author CJ Moshy
 */

export default class CommandPipeline implements ICommandPipeline {
  private actionStack: AbstractGameCommand[];
  private redoStack: AbstractGameCommand[];
  constructor() {
    this.actionStack = [];
    this.redoStack = [];
  }

  preformAction(action: AbstractGameCommand) {
    this.actionStack.push(action);
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
}
