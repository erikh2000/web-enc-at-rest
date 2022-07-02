import '../__mocks__/mockCrypto';
import { randomBytes } from '../randomUtil';

// Minimal tests for code coverage.
describe('randomUtil', () => {
  describe('randomBytes()', () => {
    it('throws if crypto function tampered with', () => {
      global.crypto.getRandomValues = () => null;
      expect(() => randomBytes(1)).toThrow();
    })
  });
});