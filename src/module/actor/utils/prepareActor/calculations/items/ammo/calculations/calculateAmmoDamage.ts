import { AmmoDataSource } from '../../../../../../../types/combat/AmmoItemConfig';

export const calculateAmmoDamage = (ammo: AmmoDataSource) =>
  Math.max(ammo.data.damage.base.value + ammo.data.quality.value * 2, 0);
