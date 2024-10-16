/**
 *
 * @param {import("../../../../types/Actor").ABFActorDataSourceData} data
 * @returns {import("../../../../types/Items").WeaponDataSource[]}
 */
export const getEquippedWeapons = data => {
  const combat = data.combat;

  return combat.weapons.filter(a => a.system.equipped.value);
};
