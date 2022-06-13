import { restoreMock as restoreCryptoMock } from '../__mocks__/mockCrypto';
import { restoreMock as restoreLocalStorageMock } from '../__mocks__/mockLocalStorage';
import { encryptAppData, decryptAppData } from "../appDataEncryption";
import { generateCredentialKey } from "../keyGen";

describe('appDataEncryption', () => {
  beforeEach(() => {
    restoreCryptoMock();
    restoreLocalStorageMock();
  });
  
  describe('decryptAppData() and encryptAppData()', () => {
    it('encrypts and decrypts data, matching the original value', (done) => {
      let credentialKey:CryptoKey = null;
      const value = { a:3, b:['apple', 95], c:{x:85} };
      generateCredentialKey('passphrase')
        .then((newCredentialKey:CryptoKey) => {
          credentialKey = newCredentialKey; 
          return encryptAppData(credentialKey, value);
        }).then((cipherText:Uint8Array) => {
          expect(cipherText).toBeDefined();
          return decryptAppData(credentialKey, cipherText);
        }).then((plaintext:any) => {
          expect(plaintext).toStrictEqual(value);
          done();
        });
    });
  });
});