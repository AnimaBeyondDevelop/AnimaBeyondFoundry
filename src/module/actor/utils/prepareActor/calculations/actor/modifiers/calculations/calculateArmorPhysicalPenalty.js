import { getEquippedArmors } from '../../../../utils/getEquippedArmors';

/**
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 * @returns {number}
 */
export const calculateEquippedArmorsRequirement = data => {
  return getEquippedArmors(data).reduce(
    (prev, curr) => prev + curr.system.wearArmorRequirement.final.value,
    0
  );
};

/**
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 * @returns {number}
 */
export const calculateArmorPhysicalPenalty = data => {
  const totalWearRequirement = calculateEquippedArmorsRequirement(data);

  if (getEquippedArmors(data).length === 0) return 0;

  return Math.min(0, data.combat.wearArmor.value - totalWearRequirement);
};
