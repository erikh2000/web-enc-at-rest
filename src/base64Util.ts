export function bytesToBase64(array:Uint8Array):string {
  return btoa(String.fromCharCode(...array));
}
export function base64ToBytes(base64:string):Uint8Array {
  const asciiString = atob(base64);
  return new Uint8Array([...asciiString].map(char => char.charCodeAt(0)));
}