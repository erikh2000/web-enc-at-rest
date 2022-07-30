import { getSubtle } from "./protectedCrypto";
import { randomBytes } from "./randomUtil";
import { stringToBytes } from "./dataConvertUtil";
import {getCredentialProof, getDeriveKeySalt, setCredentialProof, setDeriveKeySalt} from "./keyGenStore";
import {areUint8ArraysEqual} from "./arrayUtil";
import {decryptAppData, encryptAppData} from "./appDataEncryption";

/** Explanation of salt reuse:
 
 The salt returned by getOrCreateDeriveKeySalt() is used along with the password to derive a key. It's nearly always true 
 in cryptographic use cases that you would want to use a new salt value every time a value is encrypted. But in this 
 use case, we want the same credentials to consistently derive the same key across multiple derivations. Otherwise, 
 the key will always be a new key that is unusable for decrypting previously-encrypted app data.
 
 The derived key is only kept in-memory, which limits an attacker's ability to compare the derived key value against a
 matching value that could reveal credentials. An attacker could gain access to browser memory, e.g. the browser
 executable is patched with malware. But in this case, other attack vectors of greater opportunity will be available to
 the attacker.
 
 The app data itself is encrypted without reuse of salt/IV values.
 */
const PBKDF2_SALT_BYTE_LENGTH = 16;
export function getOrCreateDeriveKeySalt():Uint8Array {
  let deriveKeySalt = getDeriveKeySalt();
  if (!deriveKeySalt) {
    deriveKeySalt = randomBytes(PBKDF2_SALT_BYTE_LENGTH);
    setDeriveKeySalt(deriveKeySalt);
  }
  return deriveKeySalt;
}

function _addUserNameToSalt(userName:string, salt:Uint8Array) {
  let saltI = 0, saltLength = salt.length;
  for(let i = 0; i < userName.length; ++i) {
    salt[saltI] = (salt[saltI] + userName.charCodeAt(i)) % 256;
    if (++saltI === saltLength) saltI = 0;
  }
}

const DERIVE_KEY_ITERATIONS = 100000;
async function _generateCredentialKeyBytes(subtle:any, userName:string, password:string):Promise<Uint8Array> {
  const salt = getOrCreateDeriveKeySalt();
  _addUserNameToSalt(userName, salt);
  const passphraseUint8:Uint8Array = stringToBytes(password);
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

function _createCredentialProofPlainText():Uint8Array {
  const proof = new Uint8Array(256);
  for (let i = 0; i < 256; ++i) { proof[i] = i; }
  return proof;
}

const CREDENTIAL_PROOF_PLAINTEXT = _createCredentialProofPlainText();
export async function generateCredentialProof(credentialKey:CryptoKey):Promise<Uint8Array> {
  return encryptAppData(credentialKey, CREDENTIAL_PROOF_PLAINTEXT);
}

export async function matchOrCreateCredentialProof(credentialKey:CryptoKey):Promise<boolean> {
  const credentialProof = getCredentialProof();
  if (credentialProof === null) { // Store new proof if there isn't already one.
    const newCredentialProof = await generateCredentialProof(credentialKey);
    setCredentialProof(newCredentialProof);
    return true;
  }
  try { // Otherwise, need to verify the proof value can be decrypted.
    const credentialProofPlaintext = await decryptAppData(credentialKey, credentialProof);
    return areUint8ArraysEqual(credentialProofPlaintext, CREDENTIAL_PROOF_PLAINTEXT);
  } catch(ignored) { // If credentials are incorrect, decrypt will fail.
    return false;
  }
}