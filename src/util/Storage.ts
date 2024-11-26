/**
 * @file Storage.ts
 * @purpose responsible for utility involving serialization
 * and deserializtion of objects for storage, as well as storage itself.
 * @author CJ Moshy
 */

export function saveGameState(state: GameState, slot: number) {
  const HASH = `gameState_${slot}`;
  localStorage.setItem(HASH, JSON.stringify(state));
}

export function loadGameState(
  slot: number,
): [number, number, ArrayBuffer] | false {
  const gameState = localStorage.getItem(`gameState_${slot}`);
  if (!gameState) {
    console.log("no game state saved");
    return false;
  }
  const parsed: GameState = JSON.parse(gameState);
  const toArrBuf = new Uint8Array(parsed.plantData).buffer;
  return [parsed.currentLevel, parsed.currentTurn, toArrBuf];
}
