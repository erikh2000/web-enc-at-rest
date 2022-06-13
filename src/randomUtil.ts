import { findTampering } from './protectedCrypto';

export function randomBytes(byteLength:number):Uint8Array {
  if (findTampering()) throw Error('Crypto functions have been tampered with.');
  return global.crypto.getRandomValues(new Uint8Array(byteLength));
}