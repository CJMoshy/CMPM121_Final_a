/**
 * @file Storage.ts
 * @purpose responsible for utility involving serialization
 * and deserializtion of objects for storage, as well as storage itself.
 * @author CJ Moshy
 */

// export function serializeObj<T>(arg: T) {
//   return JSON.stringify(arg);
// }

// export function deSerializeObj(arg: string) {
//   return JSON.parse(arg);
// }

export function saveGameState(state: GameState, slot: number) {
  const HASH = `gameState_${slot}`;
  localStorage.setItem(HASH, JSON.stringify(state));
}

export function loadGameState(slot: number): [number, number, Cell[] | []] {
  const gameState = localStorage.getItem(`gameState_${slot}`);
  if (!gameState) {
    console.log("no game state saved");
    return [1, 1, []];
  }
  const parsed: GameState = JSON.parse(gameState);
  return [parsed.currentLevel, parsed.currentTurn, parsed.plantData];
}
