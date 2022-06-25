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

    it('clears a value', () => {
      const salt = new Uint8Array([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
      setDeriveKeySalt(salt);
      setDeriveKeySalt(null);
      const retrieved = getDeriveKeySalt();
      expect(retrieved).toBeNull();
    });
  });

  describe('getCredentialHash()', () => {
    it('returns null for unset value', () => {
      const retrieved = getCredentialHash();
      expect(retrieved).toBeNull();
    });
  });

  describe('setCredentialHash()', () => {
    const HASH_VALUE = [235, 243, 64, 36, 187, 28, 93, 74, 94, 96, 245, 181, 82, 42, 201, 203, 223, 
      136, 38, 175, 255, 245, 153, 99, 162, 149, 173, 116, 216, 132, 36, 44];
    
    it('stores a value', () => {
      const hash = new Uint8Array(HASH_VALUE);
      setCredentialHash(hash);
      const retrieved = getCredentialHash();
      expect(retrieved).toStrictEqual(hash);
    });

    it('clears a value', () => {
      const hash = new Uint8Array(HASH_VALUE);
      setCredentialHash(hash);
      setCredentialHash(null);
      const retrieved = getCredentialHash();
      expect(retrieved).toBeNull();
    });
  });
});