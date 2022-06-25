/* Import this file before protectedCrypto.ts to avoid from throwing due to tampering.
   This is mostly a polyfill to use Node's version of Crypto for unit testing with a bit of mocking. 
 */

const { subtle } = require('node:crypto').webcrypto;

// For consistent test results, it's better to return a not-random value.
function getRandomValues(array:Uint8Array) {
  for(let i = 0; i < array.length; ++i) {
    array[i] = i % 256;
  }
  return array; 
}

async function decrypt(algorithmParams:AesGcmParams, key:CryptoKey, data:ArrayBuffer):Promise<ArrayBuffer> {
  return subtle.decrypt(algorithmParams, key, data);
}

async function deriveKey(algorithm:Pbkdf2Params, baseKey:CryptoKey, derivedKeyType:Pbkdf2Params, 
                         extractable:boolean, keyUsages:string[]):Promise<CryptoKey> {
  return subtle.deriveKey(algorithm, baseKey, derivedKeyType, extractable, keyUsages);
}

async function digest(algorithm:string, data:ArrayBuffer):Promise<ArrayBuffer> {
  return subtle.digest(algorithm, data);
}

async function encrypt(algorithmParams:AesGcmParams, key:CryptoKey, data:ArrayBuffer):Promise<ArrayBuffer> {
  return subtle.encrypt(algorithmParams, key, data);
}

async function exportKey(format:string, keyData:BufferSource, algorithm:string, extractable:boolean,
                         keyUsages:string[]):Promise<CryptoKey> {
  return subtle.exportKey(format, keyData, algorithm, extractable, keyUsages);
}

async function importKey(format:string, keyData:BufferSource, algorithm:string, extractable:boolean, 
                   keyUsages:string[]):Promise<CryptoKey> { 
  return subtle.importKey(format, keyData, algorithm, extractable, keyUsages);
}

function _mock() {
  (global as any).crypto = { 
    getRandomValues,
    subtle: {
      decrypt,
      deriveKey,
      digest,
      encrypt,
      exportKey,
      importKey
    }
  };
}

export function restoreMock() { _mock(); }

_mock();