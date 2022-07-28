export function randomBytes(byteLength:number):Uint8Array {
  return global.crypto.getRandomValues(new Uint8Array(byteLength));
}