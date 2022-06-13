import { restoreMock as restoreCryptoMock } from '../__mocks__/mockCrypto';
import { restoreMock as restoreLocalStorageMock } from '../__mocks__/mockLocalStorage';
import { generateCredentialKey } from '../keyGen';
import { setDeriveKeySalt} from "../keyGenStore";

describe('keyGen', () => {
  beforeEach(() => {
    restoreCryptoMock();
    restoreLocalStorageMock();
  });
  
  describe('generateCredentialKey()', () => {
    it('generates a key when no salt was previously stored', (done) => {
      const passphrase = 'anything';
      generateCredentialKey(passphrase).then((credentialKey:CryptoKey) => {
        expect(credentialKey).toBeDefined();
        done();
      });
    });

    it('generates a key when a salt was previously stored', (done) => {
      const passphrase = 'anything';
      const salt = new Uint8Array([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
      setDeriveKeySalt(salt);
      generateCredentialKey(passphrase).then((credentialKey:CryptoKey) => {
        expect(credentialKey).toBeDefined();
        done();
      });
    });
  });
});