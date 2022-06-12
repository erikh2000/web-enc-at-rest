import { findTampering } from './protectedCrypto';

export function randomBytes(byteLength:number):Uint8Array {
  if (findTampering()) throw Error('Crypto functions have been tampered with.');
  return window.crypto.getRandomValues(new Uint8Array(byteLength));
}

const textEncoder = new TextEncoder();
export function stringToBytes(text:string):Uint8Array {
  return textEncoder.encode(text);
}

const textDecoder = new TextDecoder();
export function bytesToString(utf8Array:Uint8Array):string {
  return textDecoder.decode(utf8Array);
}

function _encodeSpecialCase(value:any):string|null {
  if (value === undefined) return 'undefined';
  return null;
}

function _decodeSpecialCase(text:string):any {
  if (text === 'undefined') return undefined;
  return null;
}

export function anyToBytes(value:any):Uint8Array {
  const specialCaseEncoding = _encodeSpecialCase(value);
  const text = specialCaseEncoding || JSON.stringify(value);
  return stringToBytes(text);
}

export function bytesToAny(utf8Array:Uint8Array):any {
  const text = bytesToString(utf8Array);
  const specialCaseDecoding = _decodeSpecialCase(text);
  return specialCaseDecoding === null ? JSON.parse(text) : specialCaseDecoding;
}