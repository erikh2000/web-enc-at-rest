class WearContext {
  private _key:CryptoKey|null;
  _preventSerialization:WearContext; // Did you call JSON.stringify()? I'm guessing you're trying to serialize the context, which implies some other uses that will be insecure.
  
  constructor(key:CryptoKey) {
    this._key = key;
    this._preventSerialization = this;
  }
  
  dangerouslyGetKey():CryptoKey|null { return this._key; }
  isClear():boolean { return this._key === null; }
  clear():void { this._key = null; }
}

export default WearContext;