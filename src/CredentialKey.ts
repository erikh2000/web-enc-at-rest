/* SAFE USE OF CREDENTIAL KEY
 
1. Just pass the CredentialKey instance to APIs without accessing its members.

2. Only keep the CredentialKey instance in memory. 
   (Never put it in querystring params, cookies, SessionStorage, LocalStorage, IndexedDb, or any form of persistent 
   storage.)
    
3. If you don't follow these rules, you really must understand the potential vulnerabilities thoroughly. And that is 
   a research project unless you're already skilled in using cryptographic primitives.

You may find that you are losing a generated Credential Key when you reload your DOM, e.g. travel between web pages. 
And this may tempt you to put the Credential Key someplace where it won't be lost. But this will open up attack 
vectors for malicious code or an attacker to collect the key from disk and use it to decrypt the app data.

SOME OPTIONS TO SOLVING THE LOST CREDENTIAL KEY PROBLEM

1. Prompt the user again for credentials and regenerate the Credential Key. OR…
2. Use an auth web service to request the Credential Key when you need it. OR…
3. Use a container page that loads SPA web apps into it without reloading the DOM.

*/

export interface ICredentialKey {
  function (key:CryptoKey):void;
}

function CredentialKey(key:CryptoKey) {
  let cryptoKey:CryptoKey = key;
  
  this._getKey = function(awareOfDangers?:boolean):any {
    if (!awareOfDangers) throw Error('This looks dangerous. See source comments in CredentialKey.ts.');
    return cryptoKey;
  }
  
  this._preventSerialization = this; // Did you call JSON.stringify()? That smells like serialization. Please, read warning at top of file.
}

export default CredentialKey;