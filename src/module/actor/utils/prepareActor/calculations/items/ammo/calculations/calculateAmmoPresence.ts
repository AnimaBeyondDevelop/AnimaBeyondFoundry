import { AmmoDataSource } from "../../../../../../../types/Items";

export const calculateAmmoPresence = (ammo: AmmoDataSource) =>
  Math.max(ammo.system.presence.base.value + ammo.system.quality.value * 10, 0);
