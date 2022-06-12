import CredentialKey, { ICredentialKey } from './CredentialKey';

export enum DbType {
  Detached,       // You will call encrypt/decrypt() and handle accessing app data from persistent storage.
  IndexedDb       // You will call WEAR APIs that access app data from IndexedDb. (Requires "web-enc-at-rest-idb" package.)
}

interface IUnlockOptions {
  dbType:DbType  
}

interface IWearContext {
  wearDb:IDBDatabase|null;
  userName:string;
  credentialKey:ICredentialKey|null
}

export function unlock(userName:string, password:string, options?:IUnlockOptions):IWearContext {
  return { // TODO
    wearDb:null,
    userName,
    credentialKey:new CredentialKey(null)
  }
}

export function lock(context:IWearContext) {
  context.wearDb = null;
  context.userName = null;
  context.credentialKey = null;
}

export function encrypt(context:IWearContext, value:any):Uint8Array {
  // TODO
  return new Uint8Array(0);
}

export function decrypt(context:IWearContext, encryptedData:Uint8Array):any {
  // TODO
  return null;
}