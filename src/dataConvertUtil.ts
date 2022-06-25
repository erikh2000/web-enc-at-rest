const textEncoder = new TextEncoder();
export function stringToBytes(text:string):Uint8Array {
  return textEncoder.encode(text);
}

const textDecoder = new TextDecoder();
export function bytesToString(utf8Array:Uint8Array):string {
  return textDecoder.decode(utf8Array);
}

//  = an escaping prefix that is very unlikely to be part of the passed in data.
const replacementTable = [
  [undefined, 'undefined'],
  [Infinity, 'infinity'],
  [-Infinity, '-infinity'],
  [NaN, 'NaN']
];

function _replacer(key:string, value:any):string {
  if (Number.isNaN(value)) return 'NaN'; // === comparison below won't work.
  for(let i = 0; i < replacementTable.length; ++i) {
    if (replacementTable[i][0] === value) return replacementTable[i][1] as string;
  }
  return value;
}

function _reviver(key:string, value:string):any {
  for(let i = 0; i < replacementTable.length; ++i) {
    if (replacementTable[i][1] === value) return replacementTable[i][0];
  }
  return value;
}

export function anyToString(value:any):string {
  return JSON.stringify(value, _replacer);
}

export function anyToBytes(value:any):Uint8Array {
  const text = anyToString(value);
  return stringToBytes(anyToString(value));
}

export function bytesToAny(utf8Array:Uint8Array):any {
  const text = bytesToString(utf8Array);
  return JSON.parse(text, _reviver);
}