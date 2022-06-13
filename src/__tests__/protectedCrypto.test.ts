import { restoreMock } from "../__mocks__/mockCrypto";
import { findTampering, getSubtle } from '../protectedCrypto';


describe('protectedCrypto', () => {
  beforeEach(() => restoreMock());
  
  describe('findTampering()', () => {
    it('returns false when no tampering occurs', () => {
      expect(findTampering()).toBeFalsy();
    });

    it('returns true when a protected function is replaced', () => {
      global.crypto.getRandomValues = () => null;
      expect(findTampering()).toBeTruthy();
    });
  });
  
  describe('getSubtle()', () => {
    it('throws if subtle is undefined', () => {
      (global.crypto as any).subtle = undefined;
      expect(() => getSubtle()).toThrow();
    });

    it('throws if an expected function is undefined', () => {
      (global.crypto as any).subtle.deriveKey = undefined;
      expect(() => getSubtle()).toThrow();
    });

    it('throws if a protected function is replaced', () => {
      (global.crypto as any).subtle.deriveKey = () => null;
      expect(() => getSubtle()).toThrow();
    });

    it('returns subtle object', () => {
      const subtle = getSubtle();
      expect(subtle).toBeDefined();
    });
  });
});