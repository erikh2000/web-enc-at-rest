import {bytesToString, stringToBytes} from "./cryptoUtil";

const WEAR_PREFIX = 'wear_keygen_';
const DERIVE_KEY_SALT = `${WEAR_PREFIX}_deriveKeySalt`;
const CREDENTIAL_HASH = `${WEAR_PREFIX}_credentialHash`;

export function getDeriveKeySalt():Uint8Array|null {
  const value = localStorage.getItem(DERIVE_KEY_SALT);
  return value === null ? null : stringToBytes(value);
}

export function setDeriveKeySalt(deriveKeySalt:Uint8Array) {
  localStorage.setItem(DERIVE_KEY_SALT, bytesToString(deriveKeySalt));
}

export function getCredentialHash():Uint8Array|null {
  const value = localStorage.getItem(CREDENTIAL_HASH);
  return value === null ? null : stringToBytes(value);
}

export function setCredentialHash(credentialHash:Uint8Array) {
  localStorage.setItem(CREDENTIAL_HASH, bytesToString(credentialHash));
}