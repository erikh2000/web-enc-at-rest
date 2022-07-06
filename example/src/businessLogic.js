import {
  close,
  decryptObject,
  open,
  encryptObject,
  dangerouslyDeInitialize,
  changeCredentialsAndReEncrypt
} from 'web-enc-at-rest';

const UNEXPECTED_ERROR_MESSAGE = 'An unexpected error occurred.';
const DEFAULT_SECRET_TEXT = 'I am terrified of clowns. Not all of them. Just the ones that disguise themselves as normal people.';
const SECRET_TEXT_KEY = 'WEAR_EXAMPLE_SECRET';
let context = null;

function _createValidationResult(failReasons) {
  return failReasons.length ? `Please correct the following: ${failReasons.join(', ')}.` : null;
}

function _validateCreateAccount(userName, password, confirmPassword) {
  const failReasons = [];
  if (!userName) failReasons.push('user name is missing');
  if (!password) failReasons.push('password is missing');
  if (!confirmPassword) failReasons.push('confirm password is missing');
  if (password && confirmPassword && password !== confirmPassword) failReasons.push('confirm password does not match');
  return _createValidationResult(failReasons);
}

function _validateChangePassword(userName, oldPassword, newPassword, confirmPassword) {
  const failReasons = [];
  if (!userName) failReasons.push('user name is missing');
  if (!oldPassword) failReasons.push('old password is missing');
  if (!newPassword) failReasons.push('new password is missing');
  if (!confirmPassword) failReasons.push('confirm password is missing');
  if (newPassword && confirmPassword && newPassword !== confirmPassword) failReasons.push('confirm password does not match');
  return _createValidationResult(failReasons);
}

async function _setSecretText(text) {
  const encrypted = await encryptObject(context, {text});
  localStorage.setItem(SECRET_TEXT_KEY, encrypted);
}

async function _getSecretText() {
  const encrypted = localStorage.getItem(SECRET_TEXT_KEY);
  if (encrypted === null) return DEFAULT_SECRET_TEXT;
  const { text } = await decryptObject(context, encrypted);
  return text;
}

function _deleteSecretText() {
  localStorage.removeItem(SECRET_TEXT_KEY);
}

export async function createAccount(userName, password, confirmPassword) {
  try {
    const message = _validateCreateAccount(userName, password, confirmPassword);
    if (message) return { success:false, message };
    context = await open(userName, password);
    if (!context) return { success:false, message:UNEXPECTED_ERROR_MESSAGE };
    const secretText = DEFAULT_SECRET_TEXT;
    await _setSecretText(secretText);
    return { success:true, secretText };
  } catch(e) {
    console.error(e);
    return { success:false, message:UNEXPECTED_ERROR_MESSAGE };
  }
}

function _validateLogin(userName, password) {
  const failReasons = [];
  if (!userName) failReasons.push('user name is missing');
  if (!password) failReasons.push('password is missing');
  return _createValidationResult(failReasons);
}

export async function login(userName, password) {
  try {
    const message = _validateLogin(userName, password);
    if (message) return { success:false, message };
    context = await open(userName, password);
    if (!context) return { success:false, message:'Credentials did not match previously-provided values.'};
    const secretText = await _getSecretText();
    return { success:true, secretText };
  } catch(e) {
    console.error(e);
    return { success:false, message:UNEXPECTED_ERROR_MESSAGE };
  }
}

export async function lock(secretText) {
  try {
    await _setSecretText(secretText);
    close(context);
    return { success:true };
  } catch(e) {
    console.error(e);
    return { success:false, message:UNEXPECTED_ERROR_MESSAGE };
  }
}

export async function reset() {
  _deleteSecretText();
  dangerouslyDeInitialize();
}

async function _onReEncrypt(oldContext, newContext) {
  const oldEncryptedSecret = localStorage.getItem(SECRET_TEXT_KEY);
  try {
    const plainTextSecret = await decryptObject(oldContext, oldEncryptedSecret);
    const newEncryptedSecret = await encryptObject(newContext, plainTextSecret);
    localStorage.setItem(SECRET_TEXT_KEY, newEncryptedSecret);
    return true;
  } catch(e) { // Roll back for errors.
    console.error(e);
    localStorage.setItem(SECRET_TEXT_KEY, oldEncryptedSecret);
    return false;
  }
}

export async function changePassword(userName, oldPassword, newPassword, confirmPassword) {
  try {
    const message = _validateChangePassword(userName, oldPassword, newPassword, confirmPassword);
    if (message) return { success:false, message };
    const oldContext = await open(userName, oldPassword); // Not needed for re-encryption, since I already have context. But this protects an attacker with physical access from changing a password.
    if (!oldContext) return { success:false, message:'Old password does not match previously-provided credentials.' };
    context = await changeCredentialsAndReEncrypt(oldContext, userName, newPassword, _onReEncrypt);
    if (context === null) return { success:false, message:'An error occurred during re-encryption. No changes have been made.'};
    return { success:true }
  } catch(e) {
    console.error(e);
    return { success:false, message:UNEXPECTED_ERROR_MESSAGE };
  }
}