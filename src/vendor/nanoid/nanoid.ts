/* eslint-disable */

// Due Foundry cant let us to import external npm dependencies I need to clone it as a vendor
// https://github.com/ai/nanoid
// file: https://github.com/ai/nanoid/blob/main/nanoid.js
export const nanoid = (t = 21) => {
  let e = '';
  const r = crypto.getRandomValues(new Uint8Array(t));
  for (; t--; ) {
    const n = 63 & r[t];
    e +=
      n < 36
        ? n.toString(36)
        : n < 62
        ? (n - 26).toString(36).toUpperCase()
        : n < 63
        ? '_'
        : '-';
  }
  return e;
};
