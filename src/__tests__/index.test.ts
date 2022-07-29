import { restoreMock as restoreCryptoMock } from '../__mocks__/mockCrypto';
import { restoreMock as restoreLocalStorageMock } from '../__mocks__/mockLocalStorage';
import { restoreMock as restoreBase64 } from '../__mocks__/mockBase64';

import {
  changeCredentialsAndReEncrypt,
  close,
  dangerouslyDeInitialize,
  decryptBytes,
  decryptObject,
  encryptBytes,
  encryptObject,
  isInitialized,
  open
} from '../index'
import WearContext from "../WearContext";
import {IReplacer, IReviver} from "../dataConvertUtil";
import DoneCallback = jest.DoneCallback;
import {base64ToBytes, bytesToBase64} from "../base64Util";

describe('API', () => {
  beforeEach(() => {
    restoreCryptoMock();
    restoreLocalStorageMock();
    restoreBase64();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  describe('open()', () => {
    it('returns a context', (done) => {
      open('bubba', 'unguessable')
      .then((context:WearContext|null) => {
        expect(context).not.toBeNull();
        done();
      });
    });
    
    it('returns null when credentials don\'t match', (done) => {
      open('bubba', 'unguessable')
      .then((context:WearContext|null) => {
        if (!context) { throw Error('Unexpected'); }
        close(context);
        return open('bubba', 'badguess');
      }).then((context2:WearContext|null) => {
        expect(context2).toBeNull();
        done();
      });
    });
    
    it('opens with new credentials after dangerouslyDeInitialize() is called', (done) => {
      open('bubba', 'unguessable')
      .then((context:WearContext|null) => {
        if (!context) { throw Error('Unexpected'); }
        close(context);
        dangerouslyDeInitialize();
        return open('bubba', 'badguess');
      }).then((context2:WearContext|null) => {
        expect(context2).toBeDefined();
        done();
      });
    });
    
    it('opens with same credentials as used on a prior call', (done) => {
      open('bubba', 'unguessable')
      .then(() => {
        return open('bubba', 'unguessable');
      }).then((context:WearContext|null) => {
        expect(context).not.toBeNull();
        done();
      });
    });
  });
  
  describe('isInitialized()', () => {
    it('returns false if open() has not been called', () => {
      expect(isInitialized()).toBeFalsy();
    });

    it('returns true after open() is called', (done) => {
      open('bubba', 'unguessable')
      .then(() => {
        expect(isInitialized()).toBeTruthy();
        done();
      });
    });

    it('returns false after dangerouslyDeInitialize() is called', (done) => {
      open('bubba', 'unguessable')
        .then(() => {
          dangerouslyDeInitialize();
          expect(isInitialized()).toBeFalsy();
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
  
  describe('encryptObject()', () => {
    let context:WearContext;
    
    beforeEach((done) => {
      open('bubba', 'unguessable')
      .then((newContext:WearContext|null) => {
        if (!newContext) throw Error('Unexpected');
        context = newContext as WearContext;
        done();
      });
    });

    it('encrypts data that matches original value after decryption', (done) => {
      const value = { a:3, b:['apple', 95], c:{x:85} };
      encryptObject(context, value)
      .then((cipherText:string) => {
        return decryptObject(context, cipherText);
      }).then((plaintext:any) => {
        expect(plaintext).toStrictEqual(value);
        done();
      });
    });

    it('throws if context has been cleared', (done) => {
      const value = { a:3, b:['apple', 95], c:{x:85} };
      close(context);
      encryptObject(context, value)
      .then(() => {
        expect(true).toBeFalsy();
      }, () => {
        done();
      });
    });
    
    it('encrypts the same value uniquely in two calls', (done) => {
      const value = { a:3, b:['apple', 95], c:{x:85} };
      let firstCiphertext:string;
      encryptObject(context, value)
      .then((encrypted) => {
        firstCiphertext = encrypted;
        return encryptObject(context, value);
      }).then((secondCiphertext) => {
        expect(firstCiphertext).not.toEqual(secondCiphertext);
        done();
      });
    });
  });

  describe('decryptObject()', () => {
    let context:WearContext;

    beforeEach((done) => {
      open('bubba', 'unguessable')
        .then((newContext:WearContext|null) => {
          if (!newContext) throw Error('Unexpected');
          context = newContext as WearContext;
          done();
        });
    });

    it('throws if context has been cleared', (done) => {
      const data = '';
      close(context);
      decryptObject(context, data)
        .then(() => {
          expect(true).toBeFalsy();
        }, () => {
          done();
        });
    });
  });

  describe('encryptBytes()', () => {
    let context:WearContext;

    beforeEach((done) => {
      open('bubba', 'unguessable')
        .then((newContext:WearContext|null) => {
          if (!newContext) throw Error('Unexpected');
          context = newContext as WearContext;
          done();
        });
    });

    it('encrypts data that matches original value after decryption', (done) => {
      const value = new Uint8Array([0,1,2,3,4,5,6]);
      encryptBytes(context, value)
        .then((cipherText:string) => {
          return decryptBytes(context, cipherText);
        }).then((plaintext:any) => {
        expect(plaintext).toStrictEqual(value);
        done();
      });
    });

    it('throws if context has been cleared', (done) => {
      const value = new Uint8Array([0,1,2,3,4,5,6]);
      close(context);
      encryptBytes(context, value)
        .then(() => {
          expect(true).toBeFalsy();
        }, () => {
          done();
        });
    });

    it('encrypts the same value uniquely in two calls', (done) => {
      const value = new Uint8Array([0,1,2,3,4,5,6]);
      let firstCiphertext:string;
      encryptBytes(context, value)
        .then((encrypted) => {
          firstCiphertext = encrypted;
          return encryptBytes(context, value);
        }).then((secondCiphertext) => {
        expect(firstCiphertext).not.toEqual(secondCiphertext);
        done();
      });
    });
  });

  describe('decryptBytes()', () => {
    let context:WearContext;

    beforeEach((done) => {
      open('bubba', 'unguessable')
        .then((newContext:WearContext|null) => {
          if (!newContext) throw Error('Unexpected');
          context = newContext as WearContext;
          done();
        });
    });

    it('throws if context has been cleared', (done) => {
      const data = '';
      close(context);
      decryptBytes(context, data)
        .then(() => {
          expect(true).toBeFalsy();
        }, () => {
          done();
        });
    });
  });
  
  describe('serialization', () => {
    function _expectMatch(value:any, done:DoneCallback, replacer?:IReplacer, reviver?:IReviver) {
      let context:WearContext;
      open('bubba', 'unguessable')
      .then((newContext:WearContext|null) => {
        if (!newContext) throw Error('Unexpected');
        context = newContext;
        return encryptObject(context, value, replacer);
      }).then((encrypted:string) => {
        return decryptObject(context, encrypted, reviver);   
      }).then((decrypted:any) => {
        expect(decrypted).toStrictEqual(value);
        done();
      });
    }
    
    it('matches empty object', (done) => {
      _expectMatch({}, done);
    });

    it('matches special primitive values', (done) => {
      _expectMatch({a:null, c:Infinity, d:-Infinity, e:NaN}, done);
    });

    it('matches empty string', (done) => {
      _expectMatch({ a:'' }, done);
    });

    it('matches ASCII characters', (done) => {
      _expectMatch({ a:'abcABC012!@#$%^&*()_=+' }, done);
    });

    it('matches Unicode character', (done) => {
      _expectMatch({ a:'©' }, done);
    });
    
    it('matches nested object', (done) => {
      _expectMatch({ a:{ b:{ c:3, d:'a'}, e:[1,2,3] } }, done);
    });
    
    it('matches object with replacer/reviver', (done) => {
      function _replacer(key:string, value:any):any {
        return (key === 'special') ? bytesToBase64(value) : value;
      }
      function _reviver(key:string, value:string):any {
        return (key === 'special') ? new Uint8Array(base64ToBytes(value)) : value;
      }
      const special = new Uint8Array([0,1,2,3,4,5]);
      _expectMatch({special}, done, _replacer, _reviver);
    });
  });
  
  describe('changeCredentialsAndReEncrypt()', () => {
    let oldContext:WearContext;
    let oldEncryptedData:string;
    const OLD_USERNAME = 'bubba', OLD_PW = 'oldpw';
    const NEW_USERNAME = 'Sir Bubba', NEW_PW = 'newpw';
    const PLAINTEXT = 'some stupid data';

    beforeEach((done) => {
      open('bubba', 'oldpw')
      .then((context:WearContext|null) => {
        if (!context) throw Error('Unexpected');
        oldContext = context as WearContext;
        return encryptObject(oldContext, PLAINTEXT);
      }).then((encrypted:string) => {
        oldEncryptedData = encrypted;
        done();
      });
    });
    
    it('throws without re-encrypting if old context is closed', (done) => {
      close(oldContext);
      async function onReEncrypt(oldContext2:WearContext, _:WearContext):Promise<boolean> {
        expect(true).toBeFalsy(); // Execution should not arrive here.
        return true;
      }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then(
        () => { expect(true).toBeFalsy(); }, // Execution should not arrive here.
        () => { done(); }
      );
    });
    
    it('throws if re-encryption callback returns false', (done) => {
      async function onReEncrypt(_oldContext:WearContext, _newContext:WearContext):Promise<boolean> { return false; }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then(
        () => { expect(true).toBeFalsy(); }, // Execution should not arrive here.
        () => { done(); }
      );
    });

    it('leaves old context open if re-encryption callback returns false', (done) => {
      async function onReEncrypt(_oldContext:WearContext, _newContext:WearContext):Promise<boolean> { return false; }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then(
        () => { expect(true).toBeFalsy(); }, // Execution should not arrive here.
        () => {
          expect(!oldContext.isClear());
          done(); 
        }
      );
    });

    it('re-encrypts', (done) => {
      let newEncryptedData:string;
      async function onReEncrypt(oldContext2:WearContext, newContext:WearContext):Promise<boolean> {
        newEncryptedData = await encryptObject(newContext, await decryptObject(oldContext2, oldEncryptedData));
        return true;
      }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then((newContext:WearContext) => {
        return decryptObject(newContext, newEncryptedData);
      }).then((expected:string) => {
        expect(expected).toEqual(PLAINTEXT);
        done();
      })
    });

    it('closes old context after successful return', (done) => {
      async function onReEncrypt(_oldContext2:WearContext, _newContext:WearContext):Promise<boolean> { return true; }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then((_newContext:WearContext) => {
        expect(oldContext.isClear());
        done();
      });
    });
    
    it('causes old credentials to not open after successful return', (done) => {
      async function onReEncrypt(_oldContext:WearContext, _newContext:WearContext):Promise<boolean> { return true; }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then((_newContext2:WearContext) => {
        return open(OLD_USERNAME, OLD_PW);
      }).then((attemptOldContext:WearContext|null) => {
        expect(attemptOldContext).toBeNull();
        done();
      });
    });

    it('causes new credentials to open after successful return', (done) => {
      async function onReEncrypt(_oldContext:WearContext, _newContext:WearContext):Promise<boolean> { return true; }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then((_newContext2:WearContext) => {
        return open(NEW_USERNAME, NEW_PW);
      }).then((attemptNewContext:WearContext|null) => {
        expect(attemptNewContext).not.toBeNull();
        done();
      });
    });
  });
});