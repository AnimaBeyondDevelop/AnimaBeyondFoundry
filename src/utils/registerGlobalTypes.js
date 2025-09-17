import { WeaponCritic, NoneWeaponCritic, WeaponShotType, DamageType } from '../module/types/combat/WeaponItemConfig';

export function registerGlobalTypes() {
  game.abf = game.abf || {};

  game.abf.weapon = {
    WeaponCritic,
    NoneWeaponCritic,
    WeaponShotType
    
  };

  game.abf.combat = {
    DamageType
  }
}