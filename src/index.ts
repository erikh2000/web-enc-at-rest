/** @module API **/

import {generateCredentialKey, generateCredentialProof, matchOrCreateCredentialProof} from "./keyGen";
import {decryptAppData, encryptAppData} from "./appDataEncryption";
import {getCredentialProof, setCredentialProof, setDeriveKeySalt} from "./keyGenStore";
import WearContext from "./WearContext";
import {anyToBytes, bytesToAny, IReplacer, IReviver} from "./dataConvertUtil";
import {base64ToBytes, bytesToBase64} from "./base64Util";

/** Checks to see if a context was previously opened via open(). This can be useful
    to present appropriate UI in the app for either request existing credentials (e.g. "log in") or 
    accept new credentials (e.g. "create account").
 
    @return True if context was previously opened, or false if not. */
export function isInitialized():boolean {
  return getCredentialProof() !== null;
}

/** Clears any information used to verify credentials or generate credential keys. Read the warning below before calling this.
   
    WARNING: After this call, you won't be able to generate the same key from credentials. If you've got user data 
    encrypted with it, that data will be bricked. */
export function dangerouslyDeInitialize():void {
  setCredentialProof(null);
  setDeriveKeySalt(null);
}

/** Callback function to app-supplied re-encryption logic. In your implementation, you will want to 
    re-encrypt all data you previously encrypted and save it in persistent storage. If any part of this 
    fails, you should roll the data back to its previous state of being encrypted with the old context.
 
    @param  reEncryptor A function that will perform re-encryption on one data value, e.g. a single field in a database.
    @return             Promise resolving to true if you completed all re-encryption without failure, false if not. 
                        In the latter case, roll back any changes to persistent storage avoid bricking user data. */
interface IReEncryptCallback { (oldContext:WearContext, newContext:WearContext):Promise<boolean>; }

/** Returns a context derived from new credentials and calls a specified callback that will perform re-encryption.
    The function's logic is meant as a safeguard to avoid bricking user data when credentials change. If app code 
    follows implementation instructions, this function will succeed or fail atomically, leaving user data in an
    accessible state.

    @param oldContext  Context containing key under which data is currently encrypted. oldContext will be closed
                       and be unusable if this function returns successfully.
    @param newUserName New user name, which would commonly be the same as previous user name, but doesn't have to be.
    @param newPassword Along with new user name, this comprises the credentials from which a new key will be derived.
    @param onReEncrypt Callback to app-supplied function which will perform re-encryption of user data.
    @return            Promise resolving to new context generated from new credentials if everything was successful. */
export async function changeCredentialsAndReEncrypt(oldContext:WearContext, newUserName:string, newPassword:string, onReEncrypt:IReEncryptCallback):Promise<WearContext> {
  if (oldContext.isClear()) throw Error('oldContext is unusable because it was closed.');
  const newCredentialKey = await generateCredentialKey(newUserName, newPassword);
  const newContext = new WearContext(newCredentialKey);
  const newCredentialProof = await generateCredentialProof(newCredentialKey);
  
  if (!await onReEncrypt(oldContext, newContext)) throw Error('Re-encryption failed. The current context has not been changed.');  
  
  oldContext.clear();
  setCredentialProof(newCredentialProof);
  return newContext;
}

/** Returns a context that is needed for passing to other APIs or null if passed credentials are incorrect.

    A natural time to call this is right after user has entered credentials and you've successfully performed any
    authentication that your app requires. open() is idempotent and you can call it multiple times. 
   
    @param userName      Uniquely identifies user.
    @param password      Password for user.
    @returns             Promise resolving to context that can be passed to other APIs. Treat this opaquely. 
                         DO NOT store in any place but memory. */
export async function open(userName:string, password:string):Promise<WearContext | null> {
  const credentialKey = await generateCredentialKey(userName, password);
  if (!await matchOrCreateCredentialProof(credentialKey)) return null;
  return new WearContext(credentialKey);
}

/** Prevent any further encryption/decryption with the passed-in context. Useful for preventing attacks based on 
    physical access to the user's device, e.g. user leaves browser open on an unlocked, unattended laptop.

    A natural time to call this whenever a user logs out. If you generated multiple contexts that
    were stored in separate variables, then call close() on each. If the user closes the tab or browser before 
    you can call open(), there is no risk as the context is already cleared from memory. 
   
    @param context        From a previous call to open(). */
export function close(context:WearContext):void {
  context.clear();
}

/** Encrypts byte array to a string that you can use for writing to persistent storage.

 @param context        From a previous call to open().
 @param bytes          Value to encrypt.
 @return               Promise resolving to base64-encoded string of encrypted data. */
export async function encryptBytes(context:WearContext, bytes:Uint8Array):Promise<string> {
  if (context.isClear()) throw Error('Attempted to use a closed context.');
  const credentialKey = context.dangerouslyGetKey() as CryptoKey;
  return bytesToBase64(await encryptAppData(credentialKey, bytes));
}

/** Decrypts string to a byte array.

 @param context        From a previous call to open(). The credentials that generated the context must match
 credentials provided earlier in session where encryptedData was encrypted.
 @param encryptedData  Must have been generated with a previous call to `encryptBytes()`.
 @return               Promise resolving to Unencrypted data. */
export async function decryptBytes(context:WearContext, encryptedData:string):Promise<Uint8Array>{
  if ((context as any).isClear()) throw Error('Attempted to use a closed context.');
  const credentialKey = context.dangerouslyGetKey() as CryptoKey;
  const ciphertextBytes = base64ToBytes(encryptedData);
  return await decryptAppData(credentialKey, ciphertextBytes);
}

/** Encrypts object to a ciphertext string that you can use for writing to persistent storage.
 
 If the object is not entirely representable in JSON, you'll need to pass a replacer function to handle
 serialization, and pass a reviver function later to `decryptObject()` to symmetrically perform deserialization.
 To understand if your object is JSON-representable, call `JSON.parse(JSON.stringify(yourObject))` and see if it
 returns the same `yourObject` value.
 
 WEaR adds support for (de)serializing the following primitive values: null, undefined, Infinity, -Infinity, and NaN.

 @param context        From a previous call to open().
 @param object         Value to encrypt.
 @param replacer       Optional function to serialize values correctly. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter
 @return               Promise resolving to ciphertext string. */
export async function encryptObject(context:WearContext, object:any, replacer?:IReplacer):Promise<string> {
  const plainTextBytes = anyToBytes(object, replacer);
  return await encryptBytes(context, plainTextBytes);
}

/** Decrypts ciphertext string to an object.
 
 If the object is not entirely representable in JSON, you'll need to pass a reviver function to handle
 deserialization that matches a replacer function previously passed to `encryptObject()` for the same data.
 To understand if your object is JSON-representable, call `JSON.parse(JSON.stringify(yourObject))` and see if it
 returns the same `yourObject` value.

 WEaR adds support for (de)serializing the following primitive values: null, undefined, Infinity, -Infinity, and NaN.

 @param context        From a previous call to open(). The credentials that generated the context must match
 credentials provided earlier in session where encryptedData was encrypted.
 @param encryptedData  Must have been generated with a previous call to `encryptObject()`.
 @param reviver        Optional function to deserialize values correctly. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#using_the_reviver_parameter 
 @return               Promise resolving to Unencrypted data. */
export async function decryptObject(context:WearContext, encryptedData:string, reviver?:IReviver):Promise<any>{
  const plainTextBytes = await decryptBytes(context, encryptedData);
  return bytesToAny(plainTextBytes, reviver);
}