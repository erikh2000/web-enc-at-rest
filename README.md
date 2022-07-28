# Web Encryption at Rest (WEaR)

This library has a small set of features to support encryption-at-rest in web apps. Encryption-at-rest for a web app means that sensitive app data is encrypted before it is written to disk or other persistent storage. And when your web app needs to use that same data, it is decrypted and kept in memory.

WEaR's API is decidedly *just* a library rather than a framework. How you store and retrieve data in persistent storage, e.g. IndexedDb, is up to you. This library will allow you to encrypt and decrypt that data based on user-provided credentials.

WEaR can also be used as an offline-only means of authentication for a single user on one browser. So if you want to authenticate users before allowing access to sensitive data without relying on an authentication web service, WeAR may be a good solution.

WARNING: This library is in a period of peer review. I do not recommend it for production use until the peer review has completed, at which point, I will remove this warning and set the package version number to 1.*.

## Design and Maintenance Goals

* _Low-risk_
  * Does not invent new algorithms or protocols, but rather adapts PKCS #5 (recommendations for password-based encryption) to web-encryption-at-rest use cases
  * Does not aim to grow into a large codebase with many contributors
  * APIs are designed to limit opportunities for misuse
  * 100% test coverage with integration tests that use cryptographic functionality rather than mocks
  * Zero run-time dependencies (other than the browser-provided native APIs) to reduce risk of supply-chain attacks
* _Lightweight_
  * Features are minimal to what is needed for encryption-at-rest use cases. You can build beyond this within your app
  * Any features beyond the above will be offered in separate, optional NPM packages
  * Uses native Web Crypto for all cryptographic primitives
* _Understandable_
  * Transparent coding style with aim of communicating intent, rather than being clever or concise
  * TypeScript and naming conventions show function signatures clearly
  * Lots of source comments that aim to teach or invite useful criticism

Performance is a consideration, but any potential improvement to performance that compromises the primary goals above will be rejected.

## Usage

All the APIs are found in /src/index.ts with documentation around their usage, which you can also access from the [WEaR API Reference on my website](https://seespacelabs.com/wear-api-reference/). But I'll describe the use cases your web app will need to support for encryption-at-rest and how to handle them.

### Quick Example

The code below shows a minimal set of code to request credentials from a user, read in some encrypted data, and update changed data. WEaR is agnostic to UI and persistent storage choices, and you can implement differently.

```javascript
  import { isInitialized, open, encrypt, decrypt } from 'web-enc-at-rest';

  function promptForCredentials(isNewAccount) {
    const activity = isNewAccount ? 'Creating New Account' : 'Logging In';
    const userName = prompt(activity, 'user name');
    const password = prompt(activity, 'password');
    return { userName, password };
  }  
  
  async function updateYourSensitiveData() {
    const isNewAccount = !isInitialized();
    const { userName, password } = promptForCredentials(isNewAccount);
    const context = open(userName, password);
    
    const currentEncryptedData = localStorage.getItem('YOUR_SENSITIVE_DATA') ?? {text:''};
    const currentData = await decryptObject(context, currentEncryptedData);
    const text = prompt('Update sensitive data:', currentData.text);
    if (text !== currentData.text) {
      const updatedEncryptedData = await encryptObject(context, {text});
      localStorage.setItem('YOUR_SENSITIVE_DATA', updatedEncryptedData);
    }
    close(context);
  }
  
  updateYourSensitiveData();
```

An unnatural aspect of the previous code example is how all the calls to WEaR APIs are together. You'd more likely call `open()` around a login UI, and then immediately load all encrypted data into an in-memory store with multiple calls to `decryptObject()`. Then later, when a user changes data within the app, pass the changed data to `encryptObject()` and write the new encrypted value to persistent storage. Finally, when the user logs out, call `close()` on the context returned earlier to increase security on the user's workstation.

Each of these use cases and more will be explained below.

### Creating an Account

When the user provides initial credentials to create their account, call `open()` passing the username and password. You can include this call in your already-existing account creation flow. Or, if you are creating a web app that doesn't authenticate against a web service, the call to `open()` can serve to initialize local-only authentication. `open()` will return a context instance that can be passed to other APIs.

```javascript
  import { open } from 'web-enc-at-rest';
  ...
  const context = await open(userName, password);
  // Store the context in memory for use during the session.
```

IMPORTANT: You must never store the context instance or its contents in anything but memory. Storing it in cookies, localStorage, sessionStorage, querystring params, IndexedDb or any form of persistent storage will compromise the security of your users' data.

### Logging In

When the user provides credentials to log in to your app, call `open()` passing the username and password. You can include this call in your already-existing login flow, or if you are creating a web app that does not authenticate against a web service, the call to `open()` can serve as a local-only authentication. `open()` will return a context instance that can be passed to the other APIs.

```javascript
  import { open } from 'web-enc-at-rest';
  ...
  const context = await open(userName, password);
  // Store the context in memory for use during the session.
```

You might have noticed that the code for creating a new account or logging in is exactly the same. `open()` will initialize for new credentials or confirm against existing credentials as appropriate. Your app may want to show different UI for creating a new account versus logging in. You can check which state applies with code that calls `isInitialized()`.

```javascript
  import { isInitialized } from 'web-enc-at-rest';
  ...
  if (isInitialized()) {
    console.log('Authenticating against previously provided credentials.');
  } else {
    console.log('Initializing with newly provided credentials.');
  }
  const context = open(userName, password);
```

### Logging Out

When the user logs out, call `close()` on the context instance to prevent an attacker with physical access to an unattended and unlocked device from accessing encrypted data. If the user closes your web app's tab or the browser before you call `close()`, it's fine because the sensitive data will have been removed from memory by the browser.

```javascript
  import { close } from 'web-enc-at-rest';
  ...
  close(context);
```

### Writing Encrypted Data

You will encrypt sensitive data before storing it on disk or other persistent storage. When your web app needs to store sensitive data, call `encryptObject()` on the plaintext value and store the returned ciphertext to persistent storage, e.g. an IndexedDb store.

```javascript
  import { encrypt } from 'web-enc-at-rest';
  ...

  const invoice = { amount:250.43, created:'1/1/23', due:'2/1/23' };
  const encryptedInvoice = await encryptObject(context, invoice);
  localStorage.setItem('lastInvoice', encryptedInvoice);
```

You need not use `localStorage` in for persisting user data. It's just easier to show example code with `localStorage` than with more complex APIs like `IndexedDb`. 

### Reading Encrypted Data

When your web app needs to retrieve and use encrypted data from persistent storage, retrieve the data through your own implementation, and then call `decryptObject()` to return the original plaintext value.

```javascript
  import { decrypt } from 'web-enc-at-rest';
  ...
  const encryptedInvoice = localStorage.getItem('lastInvoice');
  const invoice = await decryptObject(context, encryptedInvoice);
```

### Changing Password or Username

You need to re-encrypt your app data with the new credentials. If you don't, the user won't be able to access their data with the new credentials, effectively bricking it. To re-encrypt, you write a re-encryption function that reads all of your encrypted data from persistent storage, and rewrites it back, encrypted using the new credentials. Pass this function to `changeCredentialsAndReEncrypt()` and it will handle the changes in an atomic way to protect integrity of data and persisted state.

```javascript
  import { changeCredentialsAndReEncrypt } from 'web-enc-at-rest';
  ...

  async function onReEncrypt(oldContext, newContext) {
    try {
      const encryptedInvoice = localStorage.getItem('lastInvoice');
      const decryptedInvoice = await decryptObject(oldContext, encryptedInvoice);
      const reEncryptedInvoice = await encryptObject(newContext, decryptedInvoice);
      localStorage.setItem('lastInvoice', reEncryptedInvoice);    
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }
  
  ...
  context = await changeCredentialsAndReEncrypt(context, newUserName, newPassword, onReEncrypt); 
  
```

### Additional API Info ###

All APIs are documented in the [WEaR API Reference](https://seespacelabs.com/wear-api-reference/)

### Protecting Against Supply Chain Attacks

It is possible for some code in an imported dependency or transitive dependency to swap out built-in functions in the JS execution environment. For example, the Web Crypto `encrypt()` function could be replaced with a function that returns plaintext instead of ciphertext. Some other precautions you may want to take:

* address vulnerabilities with `npm audit`.
* put your build-time-only dependencies (test frameworks, linting, etc.) under `devDependencies` in `package.json`, so that `npm audit` will be more meaningful when it complains about vulnerabilities under the `dependencies` section.
* minimize your use of dependencies
* configure your production web server with CSP directives to disallow all cross-domain service requests regardless of CORS allowances on the external server. This nearly guarantees that malicious code running from within the browser can't send user data to an attacker's server.

### Protecting Against User Data Loss

You want some way to deal with losing key generation data which is accessed via `localStorage` or app data which is accessed according to your implementation. What can cause this?

* The user chooses an action like "Clear Browser Data" that clears localStorage.
* The user's system is low on disk space in a way that initiates data eviction.
* Something more anomalous, e.g. disk corruption, bad file system writes, bug in browser updating, malware.

There's basically two solutions:

* Just accept the data loss and start over with new data. OR...
* Use an online backup/synchronization service and restore from it.

Accepting the data loss is the easiest thing, of course. You'll have to decide if it will work for users of your app.

### One-User/Multiple-Devices and Remote Credentials Not Yet Supported

If a user initializes WEaR with their credentials from one browser, and then uses your app on a different browser, this library doesn't provide any facility to recreate the initialization on the second browser. This limitation causes some use cases like changing credentials or synchronizing app data between devices to fail. I'm interested in adding features to support these use cases, but they aren't here yet.

If you want to forge ahead, I'll give you a few ideas on how you can handle these use cases.

#### Remote Key Approach

1. Generate the key from a random number generator instead of from credentials. The random number generator needs to be cryptographically secure.
2. Store the key on a remote server tied to a user account.
3. When the user logs in with an auth web service, fetch the key from the remote server, e.g. return in the auth web service response.

By decoupling the key from credentials, a single key can be used from multiple devices, and changing credentials won't require re-encrypting data. However, you will have another attack vector to defend against - a breach of your remote server would give an attacker keys that can be used to decrypt data. And it won't be possible to authenticate users without being online.

#### Recreate App Data from Remote Server Approach

Here's another approach to multiple-device encryption-at-rest:

1. Authenticate the user against a web service.
2. If the web service auth succeeds, but the call to `open()` with same credentials fails, then:
3. Call `dangerouslyDeInitialize()` and make a second call to `open()`, which will now succeed. Your encrypted app data is now bricked.
4. Fetch all sensitive data from web services. It will be in plaintext.
5. Encrypt the sensitive data and overwrite it in browser persistent storage.

#### Synchronized App Data Approach

And another way that I thought of while I was sipping my coffee this morning...

If you want to enable multiple-device authentication, you almost certainly want some way to synchronize app data between multiple devices as well. And a path to doing that is synchronizing the local app data with a remote database. You could use something like PouchDb to do that. So with the prerequisite of app data synchronization being a solved problem, the following approach should work:

1. Authenticate the user against a web service.
2. Complete a synchronization of the local app data against a remote server.
3. Call `open()` with same credentials. If it fails, then:
4. Call `dangerouslyDeInitialize()` and make a second call to `open()` with the same credentials, which will now succeed.

### One-Browser/Multiple-Users Probably Won't Ever Be Supported

WEaR is intentionally limited to support just one user account per browser instance. I figure that if you care enough about your users' app data to encrypt it, then you won't want the additional attack vectors that a "hot seat" style of web app adds. Note that a device that allows for multiple users via O/S-level log in will give you per-user data provisioning, e.g. launching Chrome after switching to a different O/S user account, will show browser data (bookmarks, downloads, localStorage, IndexedDb) for the second user instead of the first.

### Contact Info

Here is my LinkedIn profile. You can use it to message me. 
https://www.linkedin.com/in/erikhermansen/

I generally accept connections on LinkedIn from strangers, particularly if we have a shared interest, like Offline-First or encryption-at-rest. Just please don't pitch me on a product or service. And it helps my mental sorting if you mention you have an interest in WEaR.