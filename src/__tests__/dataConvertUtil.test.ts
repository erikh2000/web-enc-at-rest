import { anyToBytes,  bytesToAny, bytesToString, stringToBytes } from "../dataConvertUtil";

// TODO move relevant tests to higher-level contracts after revising serialization.
describe('dataConvertUtil', () => {
  describe('bytesToString()', () => {
    it('returns empty string for empty byte array', () => {
      const array = new Uint8Array();
      const expected = '';
      const text = bytesToString(array);
      expect(text).toEqual(expected);
    });

    it('returns ascii characters', () => {
      const array = new Uint8Array([65, 66, 67]);
      const expected = 'ABC';
      const text = bytesToString(array);
      expect(text).toEqual(expected);
    });

    it('returns Unicode characters for UTF-8 encoding', () => {
      const array = new Uint8Array([194, 169]);
      const expected = '©';
      const text = bytesToString(array);
      expect(text).toEqual(expected);
    });
  });
  
  describe('stringToBytes()', () => {
    it('returns empty array for empty string', () => {
      const text = '';
      const expected = new Uint8Array();
      const array = stringToBytes(text);
      expect(array).toEqual(expected);
    });

    it('returns ascii characters', () => {
      const text = 'ABC';
      const expected = new Uint8Array([65, 66, 67]);
      const array = stringToBytes(text);
      expect(array).toEqual(expected);
    });

    it('returns UTF-8 encoding for Unicode characters', () => {
      const text = '©';
      const expected = new Uint8Array([194, 169]);
      const array = stringToBytes(text);
      expect(array).toEqual(expected);
    });
  });
  
  describe('anyToBytes() and bytesToAny()', () => {
    function _checkForEncodeDecodeMatch(value:any) {
      const bytes = anyToBytes(value);
      const decoded = bytesToAny(bytes);
      expect(decoded).toStrictEqual(value);
    }
    
    it('matches null', () => {
      _checkForEncodeDecodeMatch(null);
    });

    it('matches undefined', () => {
      _checkForEncodeDecodeMatch(undefined);
    });

    it('matches Infinity', () => {
      _checkForEncodeDecodeMatch(Infinity);
    });

    it('matches -Infinity', () => {
      _checkForEncodeDecodeMatch(-Infinity);
    });

    it('matches NaN', () => {
      _checkForEncodeDecodeMatch(NaN);
    });

    it('matches string value', () => {
      _checkForEncodeDecodeMatch('hello');
    });

    it('matches numeric value', () => {
      _checkForEncodeDecodeMatch(-37.5);
    });

    it('matches array value', () => {
      _checkForEncodeDecodeMatch(['a', 35, null, NaN, Infinity, -Infinity]);
    });
    
    it('matches object value', () => {
      _checkForEncodeDecodeMatch({ blah:35, bluh:{ duh:[23,76,null]} });
    });
  });
});