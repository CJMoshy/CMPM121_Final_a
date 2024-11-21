/**
 * @file Storage.ts
 * @purpose responsible for utility involving serialization
 * and deserializtion of objects for storage, as well as storage itself.
 * @author CJ Moshy
 */

export function serializeObj<T>(arg: T) {
  return JSON.stringify(arg);
}

export function deSerializeObj(arg: string) {
  return JSON.parse(arg);
}

// TODO...

// export function saveGameState() {
// }
// export function loadGameState() {
// }
