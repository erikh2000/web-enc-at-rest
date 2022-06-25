import { base64ToBytes, bytesToBase64 } from "./base64Util";

const WEAR_PREFIX = 'WEAR_keyGen_';
const DERIVE_KEY_SALT = `${WEAR_PREFIX}deriveKeySalt`;
const CREDENTIAL_HASH = `${WEAR_PREFIX}credentialHash`;

export function getDeriveKeySalt():Uint8Array|null {
  const value = global.localStorage.getItem(DERIVE_KEY_SALT);
  return value === null ? null : base64ToBytes(value);
}

export function setDeriveKeySalt(deriveKeySalt:Uint8Array|null) {
  if (deriveKeySalt === null) {
    global.localStorage.removeItem(DERIVE_KEY_SALT);
    return;
  }
  global.localStorage.setItem(DERIVE_KEY_SALT, bytesToBase64(deriveKeySalt));
}

export function getCredentialHash():Uint8Array|null {
  const value = global.localStorage.getItem(CREDENTIAL_HASH);
  return value === null ? null : base64ToBytes(value);
}

export function setCredentialHash(credentialHash:Uint8Array|null) {
  if (credentialHash === null) {
    global.localStorage.removeItem(CREDENTIAL_HASH);
    return;
  }
  global.localStorage.setItem(CREDENTIAL_HASH, bytesToBase64(credentialHash));
}