// Unflat a JSON converting it into an usable object
// More info here: https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
export const unflat = data => {
  if (Object(data) !== data || Array.isArray(data)) return data;
  const regex = /\.?([^.\[\]]+)|\[(\d+)\]/g;
  const resultholder = {};

  for (const p in data) {
    let cur = resultholder;
    let prop = '';
    let m;

    while ((m = regex.exec(p))) {
      cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  }
  return resultholder[''] || resultholder;
};
