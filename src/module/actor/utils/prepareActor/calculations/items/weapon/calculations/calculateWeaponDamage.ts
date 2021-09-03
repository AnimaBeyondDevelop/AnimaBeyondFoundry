import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponBaseDamage } from '../util/getWeaponBaseDamage';
import { calculateWeaponStrengthModifier } from '../util/calculateWeaponStrengthModifier';

export const calculateWeaponDamage = (weapon: WeaponDataSource, data: ABFActorDataSourceData) =>
  getWeaponBaseDamage(weapon) + calculateWeaponStrengthModifier(weapon, data) + weapon.data.quality.value * 2;
