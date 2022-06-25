let fakeStore:any = {};

function getItem(key:string) { return fakeStore[key] === undefined ? null : fakeStore[key]; } 
function setItem(key:string, value:string) { fakeStore[key] = value; }
function removeItem(key:string) { delete fakeStore[key]; }

function _mock() {
  (global as any).localStorage = { getItem, removeItem, setItem };
}

export function restoreMock() {
  fakeStore = {};
  _mock(); 
}

_mock();