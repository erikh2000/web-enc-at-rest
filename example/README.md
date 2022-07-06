# "Precious Secrets" - An Example Web App

_Precious Secrets_ is a bit ridiculous. Please ignore my weird sense of humor if it doesn't entertain you. Think of this as a minimal web app that provides a plausible "real world" set of features. The app allows you to access and update some text that will be stored with encryption-at-rest. 

I took some extra care around making the login (unlock), create account, change password, and log out (lock) features reasonably close to what a user would expect so that I could find any edge cases for WEaR. 

## Installing

This directory is purposively omitted from the `web-enc-at-rest` NPM package. You can `git clone` the `web-enc-at-rest` repository from Github to retrieve the full source of WEaR that includes the _Precious Secrets_ example app.

Instructions:
1. Open your terminal and change your working directory to `~/` or someplace you want to install from.
2. `git clone git@github.com:erikh2000/web-enc-at-rest.git`
3. Change your working directory to `.../web-enc-at-rest/example`.
4. `npm install`
5. `npm run start`

The last command should launch your OS-default browser to the app served from a local web server. If it doesn't, then look for error messages in the console output.

## Tour of the App

There's just a handful of screens.

* *Create Account* - When you first launch the app, you can create a new "account", which is just a set of credentials used for encrypting and decrypting with WEaR.
* *Login* - When you launch the app after an account has already been created, you'll be prompted for credentials.
* *Forgot Credentials* - If you forget your username or password, you can use this screen to erase everything and start over.
* *Post-Login* - This screen lets you edit your secret data and save it.
* *Change Password* - You can change your password. This also re-encrypts your secret data.

## Tour of the Source

I wrote the most framework-agnostic code that I could. Here are the main files worth considering:

* `src/businessLogic.js` - Updates to data and other business logic is found here. This is probably the main file to consider.
* `dist/index.html` - All of the static UI is found here. The `main.js` link at the end binds event handlers and makes it interactive.
* `src/main.js` - The UI interaction code is here. E.g. Show this panel when user clicks on this button.
* `src/domUtil.js` - Just a handful of functions that lightly wrap common DOM manipulation functions. Basically, it's syntactic sugar for verbose vanilla JS code.

## Bug Reporting, Contributions, etc.

See text files the parent directory of this directory for more information about the overall project.