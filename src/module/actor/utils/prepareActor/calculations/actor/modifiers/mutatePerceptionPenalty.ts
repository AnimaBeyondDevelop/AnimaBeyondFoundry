import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateArmorsPerceptionPenalty } from './calculations/calculateArmorsPerceptionPenalty';
import { calculateEquippedArmorsRequirement } from './calculations/calculateArmorPhysicalPenalty';

export const mutatePerceptionPenalty = (data: ABFActorDataSourceData) => {
    let armorsPerceptionPenalty = calculateArmorsPerceptionPenalty(data);
  
    let basePerceptionPenalty = Math.min(0, armorsPerceptionPenalty);
    data.general.modifiers.perceptionPenalty.base.value = basePerceptionPenalty;
    data.general.modifiers.perceptionPenalty.final.value = basePerceptionPenalty + data.general.modifiers.perceptionPenalty.special.value;
};