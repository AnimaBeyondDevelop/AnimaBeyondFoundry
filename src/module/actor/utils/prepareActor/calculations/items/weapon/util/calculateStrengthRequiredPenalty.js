import { getStrengthRequirement } from './getStrengthRequirement';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const calculateStrengthRequiredPenalty = (weapon, data) => {
  const actorStrength = data.characteristics.primaries.strength.value;

  const strengthDifference = getStrengthRequirement(weapon) - actorStrength;

  return strengthDifference > 0 ? -(strengthDifference * 10) : 0;
};
