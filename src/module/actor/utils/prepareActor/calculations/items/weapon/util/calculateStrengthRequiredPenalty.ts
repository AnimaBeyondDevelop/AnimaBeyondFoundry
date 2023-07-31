import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { WeaponDataSource } from '../../../../../../../types/Items';
import { getStrengthRequirement } from './getStrengthRequirement';

export const calculateStrengthRequiredPenalty = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const actorStrength = data.characteristics.primaries.strength.value;

  const strengthDifference = getStrengthRequirement(weapon) - actorStrength;

  return strengthDifference > 0 ? -(strengthDifference * 10) : 0;
};
