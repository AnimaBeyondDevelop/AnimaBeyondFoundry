import { WeaponCritic, NoneWeaponCritic, WeaponShotType } from '../module/types/combat/WeaponItemConfig';

export function registerGlobalTypes() {
  game.abf = game.abf || {};

  game.abf.weapon = {
    WeaponCritic,
    NoneWeaponCritic,
    WeaponShotType
  };
}