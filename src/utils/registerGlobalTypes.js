import {
  WeaponCritic,
  NoneWeaponCritic,
  WeaponShotType,
  DamageType
} from '../module/types/combat/WeaponItemConfig';

export function registerGlobalTypes() {
  game.animabf = game.animabf || {};

  game.animabf.weapon = {
    WeaponCritic,
    NoneWeaponCritic,
    WeaponShotType
  };

  game.animabf.combat = {
    DamageType
  };
}
