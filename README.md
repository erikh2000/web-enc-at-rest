# Web Encryption-at-Rest (WEaR)

This library has a small set of features to support encryption-at-rest in web apps. Encryption-at-rest for a web app means that sensitive app data is encrypted before it is written to disk or other persistent storage. And when your web app needs to use that same data, it is decrypted and kept in memory.

WEaR's API is decidedly *just* a library rather than a framework. How you store and retrieve data in persistent storage, e.g. IndexedDb, is up to you. This library will allow you to encrypt and decrypt that data based on user-provided credentials.

WEaR can also be used as an offline-only means of authentication for a single user on one browser. So if you want to authenticate users before allowing access to sensitive data without relying on an authentication web service, WeAR may be a good solution.

WARNING: This library is in a period of peer review. I do not recommend it for production use until the peer review has completed, at which point, I will remove this warning. For more information, see "Peer Review Status" below.

## Design and Maintenance Goals

* _Low-risk_
  * Does not invent new algorithms or protocols, but rather adapts PKCS #5 (recommendations for password-based encryption) to web-encryption-at-rest use cases.
  * Does not aim to grow into a large codebase with many contributors. Small is good for crypto.
  * APIs are designed to limit opportunities for misuse.
  * 100% test coverage with integration tests that use cryptographic functionality rather than mocks.
  * Zero run-time dependencies (other than the browser-provided native APIs) to reduces risk of supply-chain attacks
  * Tamper check on Web Crypto functions further lowers risk of supply-chain attacks.
* _Lightweight_
  * Features are minimal to what is needed for encryption-at-rest use cases. You can build beyond this within your app
  * Any features beyond the above will be offered in separate, optional NPM packages
  * Uses native Web Crypto for all cryptographic primitives
* _Understandable_
  * Transparent coding style with aim of communicating intent, rather than being clever or concise
  * TypeScript and naming conventions show function signatures clearly
  * Lots of source comments that aim to teach or invite useful criticism

Performance is a consideration, but any potential improvement to performance that compromises the primary goals above will be rejected.

## Peer Review Status

With cryptography, it's fairly easy to make mistakes in implementation. I've put time into research, stuck to standards, and avoided inventing new protocols, primitives, or algorithms. So my humble solution has a good chance of being free of vulnerabilities.

But I want to get more eyes on the project. When I feel reasonably confident of my implementation, I'll set the NPM package version to 1.x, remove the "not for production use" console warnings, and update this README to reflect a "ready" status.

I am appreciative of well-considered and specific criticism of the project. You can file an issue on Github ( https://github.com/erikh2000/web-enc-at-rest/issues ).

## Usage

All the APIs are found in /src/index.ts with documentation around their usage. But I'll describe the use cases your web app will need to support for encryption-at-rest and how to handle them.

### Logging In

When the user provides credentials to log in to your app, call `open()` passing the username and password. You can include this call in your already-existing login flow, or if you are creating a web app that does not authenticate against a web service, the call to `open()` can serve as a local-only authentication. `open()` will return a context instance that can be passed to the other APIs.

```javascript
  import { open } from 'web-enc-at-rest'
  ...
  const context = await open(userName, password);
  // Store the context in memory for use during the session.
```

IMPORTANT: You must never store the context instance or its contents in anything but memory. Storing it in cookies, localStorage, sessionStorage, querystring params, IndexedDb or any form of persistent storage will compromise the security of your user's data.

### Logging Out

When the user logs out, call `close()` on the context instance to prevent an attacker with physical access to an unattended and unlocked device from accessing encrypted data. If the user closes your web app's tab or the browser before you call `close()`, it's fine because the sensitive data will have been removed from memory by the browser.

```javascript
  import { close } from 'web-enc-at-rest'
  ...
  close(context);
```

### Writing Encrypted Data

You will encrypt sensitive data before storing it on disk or other persistent storage. When your web app needs to store sensitive data, call `encrypt()` on the plaintext value and store the returned ciphertext to persistent storage, e.g. an IndexedDb store.

```javascript
  import { encrypt } from 'web-enc-at-rest';
  ...

  const invoice = { amount:250.43, created:'1/1/23', due:'2/1/23' };
  const encryptedInvoice = await encrypt(context, invoice);
  localStorage.setItem('lastInvoice', encryptedInvoice); // Just an example. Use whatever storage API suits you.
```

### Reading Encrypted Data

When your web app needs to retrieve and use encrypted data from persistent storage, retrieve the data through your own implementation, and then call `decrypt()` to return the original plaintext value.

```javascript
  import { decrypt } from 'web-enc-at-rest';
  ...
  const encryptedInvoice = localStorage.getItem('lastInvoice');
  const invoice = await decrypt(context, encryptedInvoice);
```

### Changing Password or Username

You have to re-encrypt your app data with the new password. You'll call `decrypt()` on all of the app data using a context instance returned from the `open()` where the current credentials were passed. Then call `open()` again with the new credentials (changed username and/or password). With the second context instance, call `encrypt()` on all the app data and store it.

```javascript
  import { open, encrypt, decrypt } from 'web-enc-at-rest';

  ...
  const encryptedInvoice = localStorage.getItem('lastInvoice');
  const invoice = await decrypt(context, encryptedInvoice);
  const newContext = await open(userName, newPassword);
  const reencryptedInvoice = await encrypt(context, newContext);
  localStorage.getItem('lastInvoice', reencryptedInvoice);
```

You have to do this re-encryption for the user to continue accessing it after their credentials changed. There are some alternative architectures you can pursue that add safeguarding by storing context information on a server.

### Protecting against Supply Chain Attacks

There is a supply chain attack where some code in an imported dependency or transitive dependency can swap out built-in functions in the JS execution environment. To protect against this, you can import WEaR before any other imports. 

```javascript
  import 'web-enc-at-rest'; // This import should precede all others.
  import { perfectlySafeFunction } from 'happycolorsforeverybody';
  import { innocentFunction } from 'very-popular-logging-library';
```

This will not protect against every possible supply chain attack. Some other precautions you may want to take:

* address vulnerabilities with `npm audit`.
* put your build-time-only dependencies (test frameworks, linting, etc.) under `devDependencies` in `package.json`, so that `npm audit` will be more meaningful when it complains about vulnerabilities under the `dependencies` section.
* minimize your use of dependencies
* configure your production web server with CSP directives to disallow all cross-domain service requests regardless of CORS allowances on the external server. This nearly guarantees that malicious code running from within the browser can't send user data to an attacker's server. 