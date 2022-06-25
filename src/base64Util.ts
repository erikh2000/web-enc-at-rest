/*  Why would I include Base64 functions, when JS has btoa() and atob()? Those functions are present in web, but are
    deprecated in Node, where the unit tests run. I could use the Node Buffer implementation for unit tests, but it adds 
    complexity that I'd rather avoid in maintaining a wrapper that calls into either implementation. I could import a 
    polyfill, but this project is committed to avoiding run-time dependencies or any unneeded dependencies. */

const CHAR_TO_INDEX = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const PAD = '='

// Decode a base64 string to a byte array..
export function base64ToBytes(base64:string):Uint8Array {
  const byteValues:number[] = [];
  for (let i=0; i < base64.length-3; i+=4) {
    const a = CHAR_TO_INDEX.indexOf(base64[i]);
    const b = CHAR_TO_INDEX.indexOf(base64[i+1]);
    const c = CHAR_TO_INDEX.indexOf(base64[i+2]);
    const d = CHAR_TO_INDEX.indexOf(base64[i+3]);
    byteValues.push((a << 2) | (b >>> 4));
    if (base64.charAt(i+2) != PAD) byteValues.push(((b << 4) & 0xF0) | ((c >>> 2) & 0x0F));
    if (base64.charAt(i+3) != PAD) byteValues.push(((c << 6) & 0xC0) | d);
  }

  return new Uint8Array(byteValues);
}

// Encode a byte array to a base64 string.
export function bytesToBase64(bytes:Uint8Array):string {
  let base64 = "", i;
  for (i=0; i <= bytes.length-3; i+=3) {
    base64 += CHAR_TO_INDEX[ bytes[i] >>> 2 ];
    base64 += CHAR_TO_INDEX[ ((bytes[i] & 3) << 4) | (bytes[i+1] >>> 4) ];
    base64 += CHAR_TO_INDEX[ ((bytes[i+1] & 15) << 2) | (bytes[i+2] >>> 6) ];
    base64 += CHAR_TO_INDEX[ bytes[i+2] & 63 ];
  }

  const tripletRemainder = (bytes.length % 3);
  if (tripletRemainder === 2) {
    base64 += CHAR_TO_INDEX[ bytes[i] >>> 2 ];
    base64 += CHAR_TO_INDEX[ ((bytes[i] & 3) << 4) | (bytes[i+1] >>> 4) ];
    base64 += CHAR_TO_INDEX[ ((bytes[i+1] & 15) << 2) ];
    base64 += PAD;
  } else if (tripletRemainder == 1) {
    base64 += CHAR_TO_INDEX[ bytes[i] >>> 2 ];
    base64 += CHAR_TO_INDEX[ ((bytes[i] & 3) << 4) ];
    base64 += PAD;
    base64 += PAD;
  }

  return base64;
}