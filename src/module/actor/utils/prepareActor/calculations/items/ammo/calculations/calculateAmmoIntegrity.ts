import { AmmoDataSource } from '../../../../../../../types/combat/AmmoItemConfig';

export const calculateAmmoIntegrity = (ammo: AmmoDataSource) =>
  Math.max(ammo.data.integrity.base.value + ammo.data.quality.value * 2, 0);
