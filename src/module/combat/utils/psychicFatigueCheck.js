export const psychicFatigueCheck = effect => {
  if (/Fatiga/i.test(effect)) {
    return parseInt(effect.match(/\d+/)[0]) ?? 0;
  } else {
    return 0;
  }
};
