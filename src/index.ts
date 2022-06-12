import WearContext, { IWearContext } from "./WearContext";
import {generateCredentialKey} from "./keygen";
import {decryptAppData, encryptAppData} from "./appDataEncryption";

/* Returns a context that is needed for passing to other APIs or null if passed credentials are incorrect..

   A natural time to call this is right after user has entered credentials and you've successfully performed any
   authentication that your app requires. unlock() is idempotent and you can call it multiple times. 
   
   @param userName      Uniquely identifies user.
   @param password      Password for user.
   @returns             Context that can be passed to other APIs. Treat this opaquely. DO NOT store in any place 
                        but memory. Further explanation in WearContext.ts. */
export async function unlock(userName:string, password:string):Promise<IWearContext> {
  const passphrase = `${userName}\u0000${password}`;
  const credentialKey = await generateCredentialKey(passphrase);
  return new WearContext(credentialKey, userName);
}

/* Prevent any further encryption/decryption with the passed-in context. Useful for preventing attacks based on 
   physical access to the user's device, e.g. user leaves browser open on an unlocked, unattended laptop.

   A natural time to call this whenever a user logs out. If the user closes the tab or browser before you can call
   lock(), there is no risk as the context is cleared from memory. No matter how many times unlock() was called,
   just one call to lock() is needed (no reference counting). 
   
   @param context        From a previous call to unlock(). */
export function lock(context:IWearContext):void {
  (context as any).clear();
}

/* Returns encrypted app data that you can use for writing to persistent storage.
   
   @param context        From a previous call to unlock().
   @param value          Nearly any JS type should work. The serialization is essentially JSON.stringify().
   @return               Byte array of encrypted data. */
export async function encrypt(context:IWearContext, value:any):Promise<Uint8Array> {
  const credentialKey = (context as any).dangerouslyGetCredentialKey();
  return await encryptAppData(credentialKey, value);
}

/* Returns decrypted app data that you can keep in memory for the app to use.
   
   @param context        From a previous call to unlock(). The credentials that generated the context must match 
                         credentials provided earlier in session where encryptedData was encrypted.
   @param encryptedData  Byte array of encrypted data..
   @return               Unencrypted data. */
export async function decrypt(context:IWearContext, encryptedData:Uint8Array):Promise<any> {
  const credentialKey = (context as any).dangerouslyGetCredentialKey();
  return await decryptAppData(credentialKey, encryptedData);
}