/* Returns the crypto.subtle instance after verifying it has all methods needed. By design, this function will never 
   polyfill. The implementor of app code can choose to polyfill before this function is called, and great care is 
   recommending in choosing any polyfills. */
export function getSubtle():SubtleCrypto {
  const subtle = global.crypto && global.crypto.subtle;
  if (!subtle) throw Error('Browser does not implement Web Crypto.');
  if (!subtle.importKey || !subtle.deriveKey || !subtle.decrypt || !subtle.encrypt || !subtle.exportKey) throw Error('Web Crypto on this browser does not implement required APIs.');
  return subtle;
}