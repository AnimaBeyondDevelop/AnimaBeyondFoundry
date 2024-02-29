import { calculateArmorsPerceptionPenalty } from './calculations/calculateArmorsPerceptionPenalty';

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePerceptionPenalty = data => {
  let armorsPerceptionPenalty = calculateArmorsPerceptionPenalty(data);

  data.general.modifiers.perceptionPenalty.final.value =
    data.general.modifiers.perceptionPenalty.base.value + data.general.modifiers.perceptionPenalty.special.value + Math.min(0, armorsPerceptionPenalty);
};

