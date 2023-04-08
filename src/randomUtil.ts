export function randomBytes(byteLength:number):Uint8Array {
  return globalThis.crypto.getRandomValues(new Uint8Array(byteLength));
}