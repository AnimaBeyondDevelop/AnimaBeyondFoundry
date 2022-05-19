import { ABFSettingsKeys } from '../../../utils/registerSettings';

export const calculateAbsorption = (attack: number, defense: number, at: number, halved: boolean = false) => {
  const useCombatTable = (game as Game).settings.get('animabf', ABFSettingsKeys.USE_DAMAGE_TABLE);
  let diference = attack - defense;
  if (useCombatTable) {
    let finalAt = at;
    if (halved) finalAt = Math.floor(at/2);
    if (diference < 30) return 0;
    else if (diference < 50 && finalAt <= 1) {
      if (diference < 40 && finalAt == 0) return 10;
      else return Math.floor((diference - (finalAt * 10 + 10)) / 10) * 10;
    }
    else return Math.floor((diference - (finalAt * 10)) / 10) * 10;
  }
  else {
    let abs = at * 10 + 20;
    if (halved) abs = abs/2;
    return Math.floor((diference - abs) / 10) * 10;
  }
};