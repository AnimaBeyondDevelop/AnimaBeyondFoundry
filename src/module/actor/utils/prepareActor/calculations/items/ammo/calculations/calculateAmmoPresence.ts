import { AmmoDataSource } from '../../../../../../../types/combat/AmmoItemConfig';

export const calculateAmmoPresence = (ammo: AmmoDataSource) =>
  Math.max(ammo.data.presence.base.value + ammo.data.quality.value * 10, 0);
