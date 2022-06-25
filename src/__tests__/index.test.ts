import { restoreMock as restoreCryptoMock } from '../__mocks__/mockCrypto';
import { restoreMock as restoreLocalStorageMock } from '../__mocks__/mockLocalStorage';
import {
  changeCredentialsAndReEncrypt,
  close,
  createReEncryptor,
  dangerouslyDeInitialize,
  decrypt,
  encrypt, IReEncryptFunction,
  isInitialized,
  open
} from '../index'
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
  
  describe('encrypt()', () => {
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
      const data = new Uint8Array(100);
      close(context);
      decrypt(context, data)
        .then(() => {
          expect(true).toBeFalsy();
        }, () => {
          done();
        });
    });
  });
  
  describe('createReEncryptor()', () => {
    let oldContext:WearContext, newContext:WearContext;

    beforeEach((done) => {
      open('bubba', 'oldpw')
      .then((context:WearContext|null) => {
        if (!context) throw Error('Unexpected');
        oldContext = context as WearContext;
        dangerouslyDeInitialize();
        return open('bubba', 'newpw');
      }).then((context:WearContext|null) => {
        if (!context) throw Error('Unexpected');
        newContext = context as WearContext;
        done();
      });
    });

    it('throws if old context is closed', () => {
      close(oldContext);
      expect(() => createReEncryptor(oldContext, newContext)).toThrow();
    });

    it('throws if new context is closed', () => {
      close(newContext);
      expect(() => createReEncryptor(oldContext, newContext)).toThrow();
    });
    
    it('re-encrypts data as expected', (done) => {
      const plaintext = 'hello';
      let cipherOld:Uint8Array, expected:Uint8Array;
      encrypt(oldContext, plaintext).then(encrypted => {
        cipherOld = encrypted;
        return encrypt(newContext, plaintext);
      }).then(encrypted => {
        expected = encrypted;
        const reEncrypt:IReEncryptFunction = createReEncryptor(oldContext, newContext);
        return reEncrypt(cipherOld);
      }).then((reEncrypted:Uint8Array) => {
        expect(reEncrypted).toEqual(expected);
        done();
      });
    });
  });
  
  describe('changeCredentialsAndReEncrypt()', () => {
    let oldContext:WearContext;
    let oldEncryptedData:Uint8Array;
    const OLD_USERNAME = 'bubba', OLD_PW = 'oldpw';
    const NEW_USERNAME = 'Sir Bubba', NEW_PW = 'newpw';
    const PLAINTEXT = 'some stupid data';

    beforeEach((done) => {
      open('bubba', 'oldpw')
      .then((context:WearContext|null) => {
        if (!context) throw Error('Unexpected');
        oldContext = context as WearContext;
        return encrypt(oldContext, PLAINTEXT);
      }).then((encrypted:Uint8Array) => {
        oldEncryptedData = encrypted;
        done();
      });
    });
    
    it('throws without re-encrypting if old context is closed', (done) => {
      close(oldContext);
      async function onReEncrypt(reEncryptor:IReEncryptFunction):Promise<boolean> {
        expect(true).toBeFalsy(); // Execution should not arrive here.
        return true;
      }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then(
        () => { expect(true).toBeFalsy(); }, // Execution should not arrive here.
        () => { done(); }
      );
    });
    
    it('throws if re-encryption callback returns false', (done) => {
      async function onReEncrypt(reEncryptor:IReEncryptFunction):Promise<boolean> { return false; }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then(
        () => { expect(true).toBeFalsy(); }, // Execution should not arrive here.
        () => { done(); }
      );
    });

    it('leaves old context open if re-encryption callback returns false', (done) => {
      async function onReEncrypt(reEncryptor:IReEncryptFunction):Promise<boolean> { return false; }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then(
        () => { expect(true).toBeFalsy(); }, // Execution should not arrive here.
        () => {
          expect(!oldContext.isClear());
          done(); 
        }
      );
    });

    it('re-encrypts', (done) => {
      let newEncryptedData:Uint8Array;
      async function onReEncrypt(reEncryptor:IReEncryptFunction):Promise<boolean> {
        newEncryptedData = await reEncryptor(oldEncryptedData);
        return true;
      }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then((newContext:WearContext) => {
        return encrypt(newContext, PLAINTEXT);
      }).then((expected:Uint8Array) => {
        expect(newEncryptedData).toEqual(expected);
        done();
      })
    });

    it('closes old context after successful return', (done) => {
      async function onReEncrypt(reEncryptor:IReEncryptFunction):Promise<boolean> { return true; }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then((newContext:WearContext) => {
        expect(oldContext.isClear());
        done();
      });
    });
    
    it('causes old credentials to not open after successful return', (done) => {
      async function onReEncrypt(reEncryptor:IReEncryptFunction):Promise<boolean> { return true; }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then((newContext:WearContext) => {
        return open(OLD_USERNAME, OLD_PW);
      }).then((attemptOldContext:WearContext|null) => {
        expect(attemptOldContext).toBeNull();
        done();
      });
    });

    it('causes new credentials to open after successful return', (done) => {
      async function onReEncrypt(reEncryptor:IReEncryptFunction):Promise<boolean> { return true; }
      changeCredentialsAndReEncrypt(oldContext, NEW_USERNAME, NEW_PW, onReEncrypt).then((newContext:WearContext) => {
        return open(NEW_USERNAME, NEW_PW);
      }).then((attemptNewContext:WearContext|null) => {
        expect(attemptNewContext).not.toBeNull();
        done();
      });
    });
  });
});