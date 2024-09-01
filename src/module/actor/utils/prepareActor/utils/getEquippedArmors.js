/**
 * @param {import("../../../../types/Actor").ABFActorDataSourceData} data
 * @returns {import("../../../../types/Items").ArmorDataSource[]}
 */
export const getEquippedArmors = data => {
  return data.combat.armors.filter(a => a.system.equipped.value);
};
