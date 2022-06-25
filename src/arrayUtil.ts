export function areUint8ArraysEqual(a:Uint8Array, b:Uint8Array):boolean {
  if (a.length != b.length) return false;
  for(let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function combineUint8Arrays(arrays:Uint8Array[]):Uint8Array {
  const byteCount = arrays.reduce((sum:number, array:Uint8Array) => { return sum + array.byteLength}, 0);
  const combinedArray = new Uint8Array(byteCount);
  let offset = 0;
  arrays.forEach(array => {
    combinedArray.set(array, offset);
    offset += array.length;
  });
  return combinedArray;
}

export function splitUint8ArrayAtOffsets(combinedArray:Uint8Array, offsets:number[]) {
  const splitOffsets = [...offsets, combinedArray.length];
  const arrays:Uint8Array[] = [];
  let fromOffset = 0;
  for(let offsetI = 0; offsetI < splitOffsets.length; ++offsetI) {
    const array = new Uint8Array(splitOffsets[offsetI] - fromOffset);
    array.set(combinedArray.slice(fromOffset, fromOffset + array.length));
    arrays.push(array);
  }
  return arrays;
}