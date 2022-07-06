import { isInitialized, open } from "web-enc-at-rest";
import {bindOnClick, hideElement, setInnerText, setValue, showElement, valueOf} from "./domUtil";
import { changePassword, createAccount, lock, login, reset } from "./businessLogic";

const LOGIN = 0, FORGOT = 1, CREATE_ACCOUNT = 2, CHANGE_PW = 3, POST_LOGIN = 4;
const panels = ['loginPanel', 'forgotPanel', 'createAccountPanel', 'changePasswordPanel', 'postLoginPanel'];
let lastUserName;

function _showCurrentPanel(showPanelNo) {
  for(let panelNo = 0; panelNo < panels.length; ++panelNo) {
    const panelId = panels[panelNo];
    if (panelNo === showPanelNo) {
      showElement(panelId);
    } else {
      hideElement(panelId);
    }
  }
}

function _showStatusMessage(message) { setInnerText('statusMessage', message); }

function _clearStatusMessage() { _showStatusMessage(''); }

function _clearUserNameAndPassword() {
  setValue('loginUserName', '');
  setValue('loginPassword', '');
  setValue('createAccountUserName', '');
  setValue('createAccountPassword', '');
  setValue('createAccountPassword2', '');
  setValue('oldPassword', '');
  setValue('newPassword', '');
  setValue('newPassword2', '');
}

function _onCreateAccountButtonClick() {
  _clearStatusMessage();
  lastUserName = valueOf('createAccountUserName');
  createAccount(lastUserName, valueOf('createAccountPassword'), valueOf('createAccountPassword2'))
    .then(result => {
      if (!result.success) { _showStatusMessage(result.message); return; }
      setValue('preciousSecretsText', result.secretText);
      _clearUserNameAndPassword();
      _showCurrentPanel(POST_LOGIN);
    });
}

function _onLoginButtonClick() {
  _clearStatusMessage();
  lastUserName = valueOf('loginUserName');
  login(lastUserName, valueOf('loginPassword'))
    .then(result => {
      if (!result.success) { _showStatusMessage(result.message); return; }
      setValue('preciousSecretsText', result.secretText);
      _clearUserNameAndPassword();
      _showCurrentPanel(POST_LOGIN);
    });
}

function _onLockButtonClick() {
  _clearStatusMessage();
  lock(valueOf('preciousSecretsText'))
    .then(result => {
      if (!result.success) { _showStatusMessage(result.message); return; }
      setValue('preciousSecretsText', '');
      _showCurrentPanel(LOGIN);
    });
}

function _onResetButtonClick() {
  _clearStatusMessage();
  reset().then(() => {
    _showStatusMessage('Account successfully reset.');
    _showCurrentPanel(CREATE_ACCOUNT);
  });
}

function _onResetCancelButtonClick() {
  _clearStatusMessage();
  _showCurrentPanel(LOGIN);
}

function _onForgotButtonClick() {
  _clearStatusMessage();
  _showCurrentPanel(FORGOT);
}

function _onChangePasswordClick() {
  _clearStatusMessage();
  setValue('oldUsername', lastUserName);
  _showCurrentPanel(CHANGE_PW);
}

function _onConfirmChangePasswordClick() {
  _clearStatusMessage();
  changePassword(lastUserName, valueOf('oldPassword'), valueOf('newPassword'), valueOf('newPassword2'))
    .then(result => {
      if (!result.success) { _showStatusMessage(result.message); return; }
      _clearUserNameAndPassword();
      _showStatusMessage('Password successfully changed.');
      _showCurrentPanel(POST_LOGIN);
    });
}

function _onCancelChangePasswordClick() {
  _clearStatusMessage();
  _clearUserNameAndPassword();
  _showCurrentPanel(POST_LOGIN);
}

function _bindEvents() {
  bindOnClick('createAccountButton', _onCreateAccountButtonClick);
  bindOnClick('loginButton', _onLoginButtonClick);
  bindOnClick('lockButton', _onLockButtonClick);
  bindOnClick('forgotButton', _onForgotButtonClick);
  bindOnClick('resetButton', _onResetButtonClick);
  bindOnClick('resetCancelButton', _onResetCancelButtonClick);
  bindOnClick('changePasswordButton', _onChangePasswordClick);
  bindOnClick('confirmChangePasswordButton', _onConfirmChangePasswordClick);
  bindOnClick('cancelChangePasswordButton', _onCancelChangePasswordClick);
}

function _init() {
  _bindEvents();
  const showPanelNo = isInitialized() ? LOGIN : CREATE_ACCOUNT;
  _showCurrentPanel(showPanelNo);
}

_init();