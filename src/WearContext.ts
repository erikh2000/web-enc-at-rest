import { getSubtle } from 'protectedCrypto';

class WearContext {
  private _key:CryptoKey|null;
  private _isRemoteKey:boolean;
  private _importKeyPromise:Promise<CryptoKey>|null;
  _preventSerialization:WearContext; // Did you call JSON.stringify()? I'm guessing you're trying to serialize the context, which implies some other uses that will be insecure.
  
  constructor(keyBytes:Uint8Array, isRemoteKey:boolean) {
    this._key = null;
    this._preventSerialization = this;
    this._isRemoteKey = isRemoteKey;
    this._importKeyPromise = getSubtle().importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt', 'encrypt']);
    this._importKeyPromise.then((importedKey:CryptoKey) => {
      this._key = importedKey;
      this._importKeyPromise = null;
    });
  }
  
  async dangerouslyGetKey():Promise<CryptoKey|null> {
    if (this._importKeyPromise === null) return this._key;
    return await this._importKeyPromise;
  }
  
  isRemoteKey():boolean { return this._isRemoteKey; }
  isClear():boolean { return this._key === null; }
  clear():void { this._key = null; }
}

export default WearContext;