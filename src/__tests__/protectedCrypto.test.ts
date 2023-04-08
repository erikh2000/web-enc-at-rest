import { restoreMock } from "../__mocks__/mockCrypto";
import { getSubtle } from '../protectedCrypto';

// Minimal tests for code coverage.
describe('protectedCrypto', () => {
  beforeEach(() => restoreMock());
  
  describe('getSubtle()', () => {
    it('throws if subtle is undefined', () => {
      (globalThis.crypto as any).subtle = undefined;
      expect(() => getSubtle()).toThrow();
    });

    it('throws if an expected function is undefined', () => {
      (globalThis.crypto as any).subtle.deriveKey = undefined;
      expect(() => getSubtle()).toThrow();
    });
  });
});