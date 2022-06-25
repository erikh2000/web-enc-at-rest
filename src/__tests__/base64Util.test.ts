import { bytesToBase64, base64ToBytes } from "../base64Util";

describe('base64Util', () => {
  describe('bytesToBase64() and base64ToBytes()', () => {
    function _checkEncodeDecode(bytes:Uint8Array) {
      const base64 = bytesToBase64(bytes);
      const decoded = base64ToBytes(base64);
      expect(decoded).toEqual(bytes);
    }
    
    it('decodes an empty array from an encoding', () => {
      _checkEncodeDecode(new Uint8Array(0));
    });

    it('decodes a 1-byte array from an encoding', () => {
      _checkEncodeDecode(new Uint8Array([50]));
    });

    it('decodes a 2-byte array from an encoding', () => {
      _checkEncodeDecode(new Uint8Array([10, 20]));
    });

    it('decodes a 3-byte array from an encoding', () => {
      _checkEncodeDecode(new Uint8Array([10, 20, 30]));
    });

    it('decodes an array with every possible byte value from an encoding', () => {
      const ASCII_COUNT = 256;
      const bytes = new Uint8Array(ASCII_COUNT);
      for(let i = 0; i < ASCII_COUNT; ++i) { bytes[i] = i; }
      _checkEncodeDecode(bytes);
    });
    
  });
  
  
});