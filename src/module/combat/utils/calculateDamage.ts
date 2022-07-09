import { ABFSettingsKeys } from '../../../utils/registerSettings';

export const calculateDamage = (attack: number, defense: number, at: number, damage: number, halvedAbs: boolean = false) => {
  const useCombatTable = (game as Game).settings.get('animabf', ABFSettingsKeys.USE_DAMAGE_TABLE);
  let diference = attack - defense;
  let percent = 0
  if (useCombatTable) {
    let finalAt = at;
    if (halvedAbs) finalAt = Math.floor(at/2);
    if (diference < 30) percent = 0;
    else if (diference < 50 && finalAt <= 1) {
      if (diference < 40 && finalAt == 0) percent = 10;
      else percent = Math.floor((diference - (finalAt * 10 + 10)) / 10) * 10;
    }
    else percent = Math.floor((diference - (finalAt * 10)) / 10) * 10;
  }
  else {
    let abs = at * 10 + 20;
    if (halvedAbs) abs = abs/2;
    percent = Math.floor((diference - abs) / 10) * 10;
  }

  const damageRoundedToCeil10Multiplier = Math.ceil(damage / 10) * 10;

  const dealDamage = (damageRoundedToCeil10Multiplier * percent) / 100;

  return Math.max(dealDamage, 0);
};