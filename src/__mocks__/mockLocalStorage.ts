let fakeStore = {};

function getItem(key:string) { return fakeStore[key] === undefined ? null : fakeStore[key]; } 
function setItem(key:string, value:string) { fakeStore[key] = value; }

function _mock() {
  (global as any).localStorage = { getItem, setItem };
}

export function restoreMock() {
  fakeStore = {};
  _mock(); 
}

_mock();