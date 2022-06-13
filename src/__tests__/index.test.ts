import { restoreMock as restoreCryptoMock } from '../__mocks__/mockCrypto';
import { restoreMock as restoreLocalStorageMock } from '../__mocks__/mockLocalStorage';

import { unlock, lock, encrypt, decrypt }  from '../index'
import { IWearContext } from "../WearContext";
import {generateCredentialKey} from "../keyGen";
import {decryptAppData, encryptAppData} from "../appDataEncryption";

describe('API', () => {
  beforeEach(() => {
    restoreCryptoMock();
    restoreLocalStorageMock();
  });
  
  describe('unlock()', () => {
    it('returns a context', (done) => {
      unlock('bubba', 'unguessable')
      .then((context:IWearContext) => {
        expect(context).toBeDefined();
        done();
      });
    });
  });

  describe('lock()', () => {
    it('clears passed-in context', (done) => {
      unlock('bubba', 'unguessable')
      .then((context:IWearContext) => {
        expect((context as any).isClear()).toBeFalsy();
        lock(context);
        expect((context as any).isClear()).toBeTruthy();
        done();
      });
    });
  });
  
  describe('encrypt()', () => {
    let context:IWearContext = null;
    
    beforeEach((done) => {
      unlock('bubba', 'unguessable')
      .then((newContext:IWearContext) => {
        context = newContext;
        done();
      });
    });

    it('encrypts data that matches original value after decryption', (done) => {
      const value = { a:3, b:['apple', 95], c:{x:85} };
      encrypt(context, value)
      .then((cipherText:Uint8Array) => {
        return decrypt(context, cipherText);
      }).then((plaintext:any) => {
        expect(plaintext).toStrictEqual(value);
        done();
      });
    });

    it('throws if context has been cleared', (done) => {
      const value = { a:3, b:['apple', 95], c:{x:85} };
      lock(context);
      encrypt(context, value)
      .then(() => {
        expect(true).toBeFalsy();
      }, () => {
        done();
      });
    });
  });

  describe('decrypt()', () => {
    let context:IWearContext = null;

    beforeEach((done) => {
      unlock('bubba', 'unguessable')
        .then((newContext:IWearContext) => {
          context = newContext;
          done();
        });
    });

    it('throws if context has been cleared', (done) => {
      const data = new Uint8Array(100);
      lock(context);
      decrypt(context, data)
        .then(() => {
          expect(true).toBeFalsy();
        }, () => {
          done();
        });
    });
  });
});