import { expect } from 'chai'
import WearContext from '../src/WearContext';

describe('WearContext', () => {
  describe('constructor()', () => {
    it('constructs', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      expect(context).not.equals(undefined);
    });

    it('throws if passed to JSON.stringify()', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      expect(() => JSON.stringify(context)).throws();
    });
  });
  
  describe('dangerouslyGetCredentialKey()', () => {
    it('returns passed-in key', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      expect((context as any).dangerouslyGetCredentialKey()).equals(credentialKey);
    });  
  });

  describe('getUserName()', () => {
    it('returns passed-in user name', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      expect((context as any).getUserName()).equals(userName);
    });
  });

  describe('clear()', () => {
    it('clears user name', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      (context as any).clear();
      expect((context as any).getUserName()).equals(null);
    });

    it('clears key', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      (context as any).clear();
      expect((context as any).dangerouslyGetCredentialKey()).equals(null);
    });
  });

  
});