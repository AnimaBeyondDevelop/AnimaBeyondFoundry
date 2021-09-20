import { WeaponItemData } from '../../../../../types/combat/WeaponItemConfig';

export const mutateWeaponStrength = (data: WeaponItemData) => {
  data.weaponStrength.final.value = data.weaponStrength.base.value + data.quality.value / 5;
};
