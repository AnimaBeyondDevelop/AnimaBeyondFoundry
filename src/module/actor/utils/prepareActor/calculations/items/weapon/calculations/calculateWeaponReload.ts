import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { WeaponDataSource } from '../../../../../../../types/Items';

export const calculateWeaponReload = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const sleightOfHand = data.secondaries.creative.sleightOfHand.final.value;
  const attack = data.combat.attack.final.value;

  return weapon.system.reload.base.value - Math.floor(Math.max(attack, sleightOfHand) / 100);
};
