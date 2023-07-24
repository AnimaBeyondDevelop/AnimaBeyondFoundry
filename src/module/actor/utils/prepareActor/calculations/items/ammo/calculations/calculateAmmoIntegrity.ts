import { AmmoDataSource } from "../../../../../../../types/Items";

export const calculateAmmoIntegrity = (ammo: AmmoDataSource) =>
  Math.max(ammo.system.integrity.base.value + ammo.system.quality.value * 2, 0);
