import { areUint8ArraysEqual } from "../arrayUtil";

// Full tests.
describe('arrayUtil', () => {
  function _allPossibleValuesArray():Uint8Array {
    const array = new Uint8Array(256);
    for(let i = 0; i < 256; ++i) { array[i] = i; }
    return array;
  }
  
  describe('areUint8ArraysEqual()', () => {
    it('returns true for 2 empty arrays', () => {
      const a = new Uint8Array([]);
      const b = new Uint8Array([]);
      const expectedMatch = true;
      expect(areUint8ArraysEqual(a,b)).toEqual(expectedMatch);
    });

    it('returns false if first array has less elements than second', () => {
      const a = new Uint8Array([1,2]);
      const b = new Uint8Array([1,2,3]);
      const expectedMatch = false;
      expect(areUint8ArraysEqual(a,b)).toEqual(expectedMatch);
    });

    it('returns false if first array has more elements than second', () => {
      const a = new Uint8Array([1,2,3]);
      const b = new Uint8Array([1,2]);
      const expectedMatch = false;
      expect(areUint8ArraysEqual(a,b)).toEqual(expectedMatch);
    });

    it('returns true if array elements match', () => {
      const a = _allPossibleValuesArray();
      const b = _allPossibleValuesArray();
      const expectedMatch = true;
      expect(areUint8ArraysEqual(a,b)).toEqual(expectedMatch);
    });

    it('returns false if an array element does not match', () => {
      const a = _allPossibleValuesArray();
      const b = _allPossibleValuesArray();
      b[72] = 0;
      const expectedMatch = false;
      expect(areUint8ArraysEqual(a,b)).toEqual(expectedMatch);
    });
  });
});