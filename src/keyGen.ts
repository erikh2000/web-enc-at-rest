import { getSubtle } from "./protectedCrypto";
import { randomBytes } from "./randomUtil";
import { stringToBytes } from "./dataConvertUtil";
import { getDeriveKeySalt, setDeriveKeySalt } from "./keyGenStore";

function _getOrCreateDeriveKeySalt() {
  let deriveKeySalt = getDeriveKeySalt();
  if (!deriveKeySalt) {
    const PBKDF2_SALT_BYTE_LENGTH = 16;
    deriveKeySalt = randomBytes(PBKDF2_SALT_BYTE_LENGTH);
    setDeriveKeySalt(deriveKeySalt);
  }
  return deriveKeySalt;
}

const DERIVE_KEY_ITERATIONS = 1000000;
export async function generateCredentialKey(passphrase:string):Promise<CryptoKey> {
  const subtle = getSubtle();
  const salt = _getOrCreateDeriveKeySalt();
  const passphraseUint8:Uint8Array = stringToBytes(passphrase);
  const algorithmParams:Pbkdf2Params = { name: 'PBKDF2', hash: 'SHA-256', salt, iterations:DERIVE_KEY_ITERATIONS };
  const baseKey:CryptoKey = await subtle.importKey('raw', passphraseUint8, 'PBKDF2', false, ['deriveKey']);
  const derivedParams:AesKeyGenParams = { name: 'AES-GCM', length: 128 };
  return await subtle.deriveKey(algorithmParams, baseKey, derivedParams, false, ['decrypt', 'encrypt']);
}
