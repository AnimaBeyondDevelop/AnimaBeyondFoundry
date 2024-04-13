import { difficultyRange } from './difficultyAchieved';
export const shieldBaseValueCheck = (potential, effectsList) => {
  let index = difficultyRange.findIndex(e => e === potential);

  let effect = effectsList[difficultyRange[index]].value;

  effect = effect.replace('.', '');

  while (/Fatiga/i.test(effect)) {
    index++;
    effect = effectsList[difficultyRange[index]].value;
    if (/\d+ PV/i.test(effect)) {
      return parseInt(effect.match(/\d+ PV/i)[0].match(/\d+/)[0]) ?? 0;
    }
  }
  return 0
};
