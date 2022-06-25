import { getSubtle } from "./protectedCrypto";
import { randomBytes } from "./randomUtil";
import { stringToBytes } from "./dataConvertUtil";
import {getCredentialHash, getDeriveKeySalt, setCredentialHash, setDeriveKeySalt} from "./keyGenStore";
import {areUint8ArraysEqual} from "./arrayUtil";

const PBKDF2_SALT_BYTE_LENGTH = 16;
export function getOrCreateDeriveKeySalt():Uint8Array {
  let deriveKeySalt = getDeriveKeySalt();
  if (!deriveKeySalt) {
    deriveKeySalt = randomBytes(PBKDF2_SALT_BYTE_LENGTH);
    setDeriveKeySalt(deriveKeySalt);
  }
  return deriveKeySalt;
}

function _concatPassphraseFromCredentials(userName:string, password:string):string {
  return `${userName}\u0000${password}`;
}

const DERIVE_KEY_ITERATIONS = 1000000;
async function _generateCredentialKeyBytes(subtle:any, userName:string, password:string):Promise<Uint8Array> {
  const passphrase = _concatPassphraseFromCredentials(userName, password);
  const salt = getOrCreateDeriveKeySalt();
  const passphraseUint8:Uint8Array = stringToBytes(passphrase);
  const algorithmParams:Pbkdf2Params = { name: 'PBKDF2', hash: 'SHA-256', salt, iterations:DERIVE_KEY_ITERATIONS };
  const baseKey:CryptoKey = await subtle.importKey('raw', passphraseUint8, 'PBKDF2', false, ['deriveKey']);
  const derivedParams:AesKeyGenParams = { name: 'AES-GCM', length: 128 };
  const credentialKey = await subtle.deriveKey(algorithmParams, baseKey, derivedParams, true, ['decrypt', 'encrypt']);
  return new Uint8Array(await subtle.exportKey('raw', credentialKey));
}

export async function generateCredentialKey(userName:string, password:string):Promise<CryptoKey> {
  const subtle = getSubtle();
  const keyBytes = await _generateCredentialKeyBytes(subtle, userName, password);
  return await subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt', 'encrypt']);
}

const CREDENTIAL_HASH_BYTE_LENGTH = 64;
export async function generateCredentialHash(userName:string, password:string):Promise<Uint8Array> {
  // TODO
  const passphrase = _concatPassphraseFromCredentials(userName, password);
  return new Uint8Array(CREDENTIAL_HASH_BYTE_LENGTH);
}

export function matchOrCreateCredentialHash(credentialHash:Uint8Array):boolean {
  const against = getCredentialHash();
  if (against === null) {
    setCredentialHash(credentialHash);
    return true;
  }
  return areUint8ArraysEqual(credentialHash, against);
}