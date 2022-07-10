/** @class WearContext 
 *  Encapsulates all state needed for API usage, including the credential-derived key used for encryption/decryption.
 *  Only keep this instance in memory. Or in other words, don't store it or data retrieved from the instance in any 
 *  form of persistent storage, e.g. LocalStorage, SessionStorage, WebSQL, IndexedDb, querystring params (browser history).
 */
class WearContext {
  private _key:CryptoKey|null;
  _preventSerialization:WearContext; // Did you call JSON.stringify()? I'm guessing you're trying to serialize the context, which implies some other uses that will be insecure.
  
  constructor(key:CryptoKey) {
    this._key = key;
    this._preventSerialization = this;
  }

  /** Method intended for internal usage only. If you retrieve the key for app usage, you should plan to think very 
   *  carefully about what vulnerabilities you'll be introducing.
   *  
   *  @return {CryptoKey} A CryptoKey usable for encryption/decryption or null if the context has been cleared.
   */
  dangerouslyGetKey():CryptoKey|null { return this._key; }
  
  /** Has this context been cleared?
   * 
   * @return {boolean} True, if it has. False, if not. */
  isClear():boolean { return this._key === null; }

  /** Clear all data in the context, which disables the context for use in calling WEaR APIs and prevents the
   *  context data from being accessed by Javascript.
   */
  clear():void { this._key = null; }
}

export default WearContext;