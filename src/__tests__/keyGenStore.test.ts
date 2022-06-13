import { restoreMock } from '../__mocks__/mockLocalStorage';
import { getDeriveKeySalt, setDeriveKeySalt, getCredentialHash, setCredentialHash} from "../keyGenStore";

describe('keyGenStore', () => {
  beforeEach(() => restoreMock());

  describe('getDeriveKeySalt()', () => {
    it('returns null for unset value', () => {
      const retrieved = getDeriveKeySalt();
      expect(retrieved).toBeNull();
    });
  });
  
  describe('setDeriveKeySalt()', () => {
    it('stores a value', () => {
      const salt = new Uint8Array([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
      setDeriveKeySalt(salt);
      const retrieved = getDeriveKeySalt();
      expect(retrieved).toStrictEqual(salt);
    });
  });

  describe('getCredentialHash()', () => {
    it('returns null for unset value', () => {
      const retrieved = getCredentialHash();
      expect(retrieved).toBeNull();
    });
  });

  describe('setCredentialHash()', () => {
    it('stores a value', () => {
      const hash = new Uint8Array([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
      setCredentialHash(hash);
      const retrieved = getCredentialHash();
      expect(retrieved).toStrictEqual(hash);
    });
  });
});