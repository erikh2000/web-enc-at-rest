import { expect } from 'chai'
import CredentialKey from '../src/CredentialKey'

describe('CredentialKey', () => {
  it('constructs with a passed-in key', () => {
    const fakeKey = {} as CryptoKey;
    const credentialKey = new CredentialKey(fakeKey);
  });

  it('returns passed-in key', () => {
    const fakeKey = {} as CryptoKey;
    const credentialKey = new CredentialKey(fakeKey);
    expect(credentialKey._getKey(true)).equals(fakeKey);
  });

  it('throws if awareOfDangers param omitted', () => {
    const fakeKey = {} as CryptoKey;
    const credentialKey = new CredentialKey(fakeKey);
    expect(() => credentialKey._getKey()).throws();
  });

  it('throws if passed to JSON.stringify()', () => {
    const fakeKey = {} as CryptoKey;
    const credentialKey = new CredentialKey(fakeKey);
    expect(() => JSON.stringify(credentialKey)).throws();
  });
});