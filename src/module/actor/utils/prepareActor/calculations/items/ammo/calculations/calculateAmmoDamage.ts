import { AmmoDataSource } from '../../../../../../../types/combat/AmmoItemConfig';

export const calculateAmmoDamage = (ammo: AmmoDataSource) =>
  Math.max(ammo.system.damage.base.value + ammo.system.quality.value * 2, 0);
