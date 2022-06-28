/** @module API **/

import {generateCredentialHash, generateCredentialKey, matchOrCreateCredentialHash} from "./keyGen";
import {decryptAppData, encryptAppData} from "./appDataEncryption";
import {getCredentialHash, setCredentialHash, setDeriveKeySalt} from "./keyGenStore";
import WearContext from "./WearContext";

/** Checks to see if a context was previously opened via open(). This can be useful
    to present appropriate UI in the app for either request existing credentials (e.g. "log in") or 
    accept new credentials (e.g. "create account").
 
    @return True if context was previously opened, or false if not. */
export function isInitialized():boolean {
  return getCredentialHash() !== null;
}

/** Clears any information used to verify credentials or generate credential keys. Read the warning below before calling this.
   
    WARNING: After this call, you won't be able to generate the same key from credentials. If you've got user data 
    encrypted with it, that data will be bricked. */
export function dangerouslyDeInitialize():void {
  setCredentialHash(null);
  setDeriveKeySalt(null);
}

/** A function that can be used to re-encrypt data. It performs 1. decrypt with key from old context and then 
    2. encrypt with key from new context. The old and new context will be available to the function via closure when
    this function is returned from `createReEncryptor()`.
 
    @param encryptedData  An array of bytes encrypted with the key from the old context.
    @return               Promise resolving to same data re-encrypted with the key from the new context. */
export interface IReEncryptFunction { (encryptedData:Uint8Array):Promise<Uint8Array> }

/** Returns a function that can be used by caller to re-encrypt data so it's accessible via a new context. This is
    essentially syntactic sugar for a few calls to decrypt() and encrypt().

    @param oldContext Context containing key under which data is currently encrypted.
    @param newContext Context containing key under which data should be re-encrypted.
    @return           Function in form of 
                      `async function reEncrypt(oldEncryptedData:Uint8Array):Promise<Uint8Array>`. */
export function createReEncryptor(oldContext:WearContext, newContext:WearContext):IReEncryptFunction {
  if (oldContext.isClear()) throw Error('oldContext is unusable because it was closed.');
  if (newContext.isClear()) throw Error('newContext is unusable because it was closed.');
  async function _reEncrypt(encryptedData:Uint8Array) {
    const plaintext = await decrypt(oldContext, encryptedData);
    return await encrypt(newContext, plaintext);
  }
  return _reEncrypt;
}

/** Callback function to app-supplied re-encryption logic. In your implementation, you will want to 
    re-encrypt all data you previously encrypted and save it in persistent storage. If any part of this 
    fails, you should roll the data back to its previous state.
 
    @param  reEncryptor A function that will perform re-encryption on one data value, e.g. a single field in a database.
    @return             Promise resolving to true if you completed all re-encryption without failure, false if not. 
                        In the latter case, roll back any changes to persistent storage avoid bricking user data. */
interface IReEncryptCallback { (reEncryptor:IReEncryptFunction):Promise<boolean>; }

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
  const newContext = new WearContext(await generateCredentialKey(newUserName, newPassword));
  const newCredentialHash = await generateCredentialHash(newUserName, newPassword);
  
  const _reEncrypt = createReEncryptor(oldContext, newContext);
  if (!await onReEncrypt(_reEncrypt)) throw Error('Re-encryption failed. The current context has not been changed.');  
  
  oldContext.clear();
  setCredentialHash(newCredentialHash);
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
  const credentialHash = await generateCredentialHash(userName, password);
  if (!matchOrCreateCredentialHash(credentialHash)) return null;
  const credentialKeyBytes = await generateCredentialKey(userName, password);
  return new WearContext(credentialKeyBytes);
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

/** Returns encrypted app data that you can use for writing to persistent storage.
   
    @param context        From a previous call to open().
    @param value          Nearly any JS type should work. The serialization is essentially JSON.stringify().
    @return               Promise resolving to Byte array of encrypted data. */
export async function encrypt(context:WearContext, value:any):Promise<Uint8Array> {
  if (context.isClear()) throw Error('Attempted to use a closed context.');
  const credentialKey = (await context.dangerouslyGetKey()) as CryptoKey;
  return await encryptAppData(credentialKey, value);
}

/** Returns decrypted app data that you can keep in memory for the app to use.
   
    @param context        From a previous call to open(). The credentials that generated the context must match 
                         credentials provided earlier in session where encryptedData was encrypted.
    @param encryptedData  Byte array of encrypted data..
    @return               Promise resolving to Unencrypted data. */
export async function decrypt(context:WearContext, encryptedData:Uint8Array):Promise<any> {
  if ((context as any).isClear()) throw Error('Attempted to use a closed context.');
  const credentialKey = (await context.dangerouslyGetKey()) as CryptoKey;
  return await decryptAppData(credentialKey, encryptedData);
}