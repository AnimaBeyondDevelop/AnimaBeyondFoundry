export const psychicFatigueCheck = effect => {
  if (/Fatiga/.test(effect)) {
    return parseInt(effect.match(/\d+/)[0], 10) ?? 0;
  } else {
    return 0;
  }
};
