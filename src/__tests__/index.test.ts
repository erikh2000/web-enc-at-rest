import { restoreMock as restoreCryptoMock } from '../__mocks__/mockCrypto';
import { restoreMock as restoreLocalStorageMock } from '../__mocks__/mockLocalStorage';

import { open, close, encrypt, decrypt }  from '../index'
import WearContext from "../WearContext";

describe('API', () => {
  beforeEach(() => {
    restoreCryptoMock();
    restoreLocalStorageMock();
  });
  
  describe('open()', () => {
    it('returns a context', (done) => {
      open('bubba', 'unguessable')
      .then((context:WearContext|null) => {
        expect(context).toBeDefined();
        done();
      });
    });
  });

  describe('close()', () => {
    it('clears passed-in context', (done) => {
      open('bubba', 'unguessable')
      .then((context:WearContext|null) => {
        if(!context) { done(); return; }
        expect(context.isClear()).toBeFalsy();
        close(context);
        expect(context.isClear()).toBeTruthy();
        done();
      });
    });
  });
  
  describe('encrypt()', () => {
    let context:WearContext|null = null;
    
    beforeEach((done) => {
      open('bubba', 'unguessable')
      .then((newContext:WearContext|null) => {
        context = newContext;
        done();
      });
    });

    it('encrypts data that matches original value after decryption', (done) => {
      const value = { a:3, b:['apple', 95], c:{x:85} };
      if(!context) { done(); return; }
      encrypt(context, value)
      .then((cipherText:Uint8Array) => {
        if(!context) { done(); return; }
        return decrypt(context, cipherText);
      }).then((plaintext:any) => {
        expect(plaintext).toStrictEqual(value);
        done();
      });
    });

    it('throws if context has been cleared', (done) => {
      const value = { a:3, b:['apple', 95], c:{x:85} };
      if(!context) { done(); return; }
      close(context);
      encrypt(context, value)
      .then(() => {
        expect(true).toBeFalsy();
      }, () => {
        done();
      });
    });
  });

  describe('decrypt()', () => {
    let context:WearContext|null = null;

    beforeEach((done) => {
      open('bubba', 'unguessable')
        .then((newContext:WearContext|null) => {
          context = newContext;
          done();
        });
    });

    it('throws if context has been cleared', (done) => {
      const data = new Uint8Array(100);
      if(!context) { done(); return; }
      close(context);
      decrypt(context, data)
        .then(() => {
          expect(true).toBeFalsy();
        }, () => {
          done();
        });
    });
  });
});