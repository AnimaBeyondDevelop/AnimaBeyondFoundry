import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';

export const calculateWeaponReload = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const sleightOfHand = data.secondaries.creative.sleightOfHand.value;
  const attack = data.combat.attack.value;

  return weapon.data.reload.base.value - Math.floor(Math.max(attack, sleightOfHand) / 100);
};
