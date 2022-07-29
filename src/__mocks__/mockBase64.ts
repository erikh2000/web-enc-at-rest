// Node dropped b2a() and a2b(). Web still has these APIs. This function will polyfill b2a() and a2b() for the unit tests to run.

function b2a(binaryString:string):string {
  return Buffer.from(binaryString).toString('base64');
}

function a2b(base64string:string):string {
  return Buffer.from(base64string, 'base64').toString('ascii');
}

function _mock() {
  (global as any).b2a = b2a;
  (global as any).a2b = a2b;
}

export function restoreMock() {
  _mock();
}

_mock();