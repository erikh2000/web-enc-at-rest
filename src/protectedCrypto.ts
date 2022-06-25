const trusted = {
  decrypt: global.crypto?.subtle?.decrypt,
  deriveKey: global.crypto?.subtle?.deriveKey,
  encrypt: global.crypto?.subtle?.encrypt,
  exportKey: global.crypto?.subtle?.exportKey,
  importKey: global.crypto?.subtle?.importKey,
  getRandomValues: global.crypto?.getRandomValues
};

/* Returns true if any Web Crypto functions used by this app have been replaced, probably by malicious code
   in an imported NPM package.

   This is a small but useful defense against supply chain attacks. Note it can still be circumvented and doesn't
   eliminate the need to monitor for dependency package vulnerabilities via `npm audit` and other means. 

   It works best if you can import *before* any other module. Function values above will be considered a trusted 
   snapshot to compare against. So if a malicious package swaps out functions *before* this code runs, then the 
   trusted functions will be of the malicious package's functions and that tampering won't be detected. */
export function findTampering():boolean {
  return global.crypto?.subtle?.decrypt !== trusted.decrypt ||
    global.crypto?.subtle?.deriveKey !== trusted.deriveKey ||
    global.crypto?.subtle?.encrypt !== trusted.encrypt ||
    global.crypto?.subtle?.importKey !== trusted.importKey ||
    global.crypto?.subtle?.exportKey !== trusted.exportKey ||
    global.crypto?.getRandomValues !== trusted.getRandomValues;
}

export function getSubtle():SubtleCrypto {
  const subtle = global.crypto && global.crypto.subtle;
  if (!subtle) throw Error('Browser does not implement Web Crypto.');
  if (!subtle.importKey || !subtle.deriveKey || !subtle.decrypt || !subtle.encrypt) throw Error('Web Crypto on this browser does not implement required APIs.');
  if (findTampering()) throw Error('Crypto functions have been tampered with.');
  return subtle;
}