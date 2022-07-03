import { getSubtle } from './protectedCrypto';
import { randomBytes } from "./randomUtil";

const AES_GCM_IV_LENGTH = 12;
export async function encryptAppData(credentialKey:CryptoKey, data:Uint8Array):Promise<Uint8Array> {
  const subtle = getSubtle();
  const iv = randomBytes(AES_GCM_IV_LENGTH);
  const algorithmParams:AesGcmParams = {name: 'AES-GCM', iv };
  const cipherText = await subtle.encrypt(algorithmParams, credentialKey, data);
  const fullMessage:Uint8Array = new Uint8Array(AES_GCM_IV_LENGTH + cipherText.byteLength);
  fullMessage.set(iv);
  fullMessage.set(new Uint8Array(cipherText), AES_GCM_IV_LENGTH);
  return fullMessage;
}

export async function decryptAppData(credentialKey:CryptoKey, ivPlusEncryptedData:Uint8Array):Promise<any> {
  const subtle = getSubtle();
  const iv = ivPlusEncryptedData.slice(0, AES_GCM_IV_LENGTH);
  const cipherText = ivPlusEncryptedData.slice(AES_GCM_IV_LENGTH);
  const algorithmParams:AesGcmParams = {name: 'AES-GCM', iv};
  const plainText = await subtle.decrypt(algorithmParams, credentialKey, cipherText);
  return new Uint8Array(plainText);
}