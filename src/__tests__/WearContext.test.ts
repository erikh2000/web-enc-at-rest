import WearContext from '../WearContext';

describe('WearContext', () => {
  describe('constructor()', () => {
    it('constructs', () => {
      const credentialKey = {} as CryptoKey;
      const context = new WearContext(credentialKey);
      expect(context).toBeDefined();
    });

    it('throws if passed to JSON.stringify()', () => {
      const credentialKey = {} as CryptoKey;
      const context = new WearContext(credentialKey);
      expect(() => JSON.stringify(context)).toThrow();
    });
  });
  
  describe('dangerouslyGetCredentialKey()', () => {
    it('returns passed-in key', () => {
      const credentialKey = {} as CryptoKey;
      const context = new WearContext(credentialKey);
      expect(context.dangerouslyGetKey()).toBe(credentialKey);
    });  
  });

  describe('clear()', () => {
    it('clears key', () => {
      const credentialKey = {} as CryptoKey;
      const context = new WearContext(credentialKey);
      expect(context.isClear()).toBeFalsy();
      context.clear();
      expect((context as any).isClear()).toBeTruthy();
      expect(context.dangerouslyGetKey()).toBeNull();
    });
  });
  
});