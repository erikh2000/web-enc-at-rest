import WearContext from '../WearContext';

describe('WearContext', () => {
  describe('constructor()', () => {
    it('constructs', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      expect(context).toBeDefined();
    });

    it('throws if passed to JSON.stringify()', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      expect(() => JSON.stringify(context)).toThrow();
    });
  });
  
  describe('dangerouslyGetCredentialKey()', () => {
    it('returns passed-in key', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      expect((context as any).dangerouslyGetCredentialKey()).toBe(credentialKey);
    });  
  });

  describe('getUserName()', () => {
    it('returns passed-in user name', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      expect((context as any).getUserName()).toEqual(userName);
    });
  });

  describe('clear()', () => {
    it('clears user name', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      (context as any).clear();
      expect((context as any).getUserName()).toBeNull();
    });

    it('clears key', () => {
      const credentialKey = {} as CryptoKey;
      const userName = 'bubba';
      const context = new WearContext(credentialKey, userName);
      (context as any).clear();
      expect((context as any).dangerouslyGetCredentialKey()).toBeNull();
    });
  });
  
});