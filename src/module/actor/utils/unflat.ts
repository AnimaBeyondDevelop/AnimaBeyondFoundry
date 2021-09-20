// Unflat a JSON converting it into an usable object
// More info here: https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
export const unflat = data => {
  if (Object(data) !== data || Array.isArray(data)) return data;
  // eslint-disable-next-line no-useless-escape
  const regex = /\.?([^.\[\]]+)|\[(\d+)\]/g;
  const resultholder = {};

  // eslint-disable-next-line guard-for-in
  for (const p in data) {
    let cur = resultholder;
    let prop = '';
    // eslint-disable-next-line no-var,vars-on-top
    let m;

    // eslint-disable-next-line no-cond-assign
    while ((m = regex.exec(p))) {
      cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  }
  return resultholder[''] || resultholder;
};
