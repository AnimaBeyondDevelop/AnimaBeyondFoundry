import { AmmoDataSource } from '../../../../../../../types/combat/AmmoItemConfig';

export const calculateAmmoPresence = (ammo: AmmoDataSource) =>
  Math.max(ammo.system.presence.base.value + ammo.system.quality.value * 10, 0);
