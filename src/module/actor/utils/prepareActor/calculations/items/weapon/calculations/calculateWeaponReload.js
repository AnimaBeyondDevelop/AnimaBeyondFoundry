/**
 * @param {import("../../../../../../../types/Items").WeaponDataSource} weapon
 * @param {import("../../../../../../../types/Actor").ABFActorDataSourceData} data
 */
export const calculateWeaponReload = (weapon, data) => {
  const sleightOfHand = data.secondaries.creative.sleightOfHand.final.value;
  const attack = data.combat.attack.final.value;

  return (
    weapon.system.reload.base.value - Math.floor(Math.max(attack, sleightOfHand) / 100)
  );
};
