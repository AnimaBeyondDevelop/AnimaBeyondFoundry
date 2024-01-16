import { calculateArmorsPerceptionPenalty } from './calculations/calculateArmorsPerceptionPenalty';

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePerceptionPenalty = data => {
  let armorsPerceptionPenalty = calculateArmorsPerceptionPenalty(data);

  let basePerceptionPenalty = Math.min(0, armorsPerceptionPenalty);
  data.general.modifiers.perceptionPenalty.base.value = basePerceptionPenalty;
  data.general.modifiers.perceptionPenalty.final.value =
    basePerceptionPenalty + data.general.modifiers.perceptionPenalty.special.value;
};

