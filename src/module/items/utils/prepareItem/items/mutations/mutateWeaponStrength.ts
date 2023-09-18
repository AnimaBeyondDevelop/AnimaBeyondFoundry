import { WeaponItemData } from "../../../../../types/Items";

export const mutateWeaponStrength = (data: WeaponItemData) => {
  data.weaponStrength.final.value = data.weaponStrength.base.value + data.quality.value / 5;
};
