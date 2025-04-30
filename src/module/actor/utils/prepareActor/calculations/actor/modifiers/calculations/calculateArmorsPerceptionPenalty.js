import { ArmorLocation } from '@module/data/items/enums/ArmorEnums';

/**
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 * @returns {number}
 */
export const calculateArmorsPerceptionPenalty = data => {
  /** @type {{armors: import('../../../../../../../types/Items').ArmorDataSource[]}} */
  const combat = data.combat;

  const equippedArmors = combat.armors.filter(
    armor =>
      armor.system.equipped.value &&
      armor.system.localization.value === ArmorLocation.HEAD
  );

  return equippedArmors.reduce(
    (prev, curr) => prev + curr.system.perceptionPenalty.final.value,
    0
  );
};
