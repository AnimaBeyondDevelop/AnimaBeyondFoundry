/** @type {(system: import("../mutateWeapon").WeaponItemData)} */
export const mutateWeaponStrength = system => {
  system.weaponStrength.final.value =
    system.weaponStrength.base.value + system.quality.value / 5;
};
