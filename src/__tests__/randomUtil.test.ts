import '../__mocks__/mockCrypto';
import { randomBytes } from '../randomUtil';

describe('randomUtil', () => {
  describe('randomBytes()', () => {
    it('returns a byte array of specified length', () => {
      const value = randomBytes(1);
      expect(value.length).toEqual(1);
    });
    
    it('throws if crypto function tampered with', () => {
      global.crypto.getRandomValues = () => null;
      expect(() => randomBytes(1)).toThrow();
    })
  });
});