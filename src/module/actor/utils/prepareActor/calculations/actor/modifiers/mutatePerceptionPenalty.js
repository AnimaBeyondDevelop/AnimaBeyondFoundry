import { calculateArmorsPerceptionPenalty } from './calculations/calculateArmorsPerceptionPenalty';

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePerceptionPenalty = data => {
  let armorsPerceptionPenalty = calculateArmorsPerceptionPenalty(data);

  data.general.modifiers.perceptionPenalty.final.value =
    data.general.modifiers.perceptionPenalty.base.value +
    data.general.modifiers.perceptionPenalty.special.value +
    Math.min(0, armorsPerceptionPenalty);
};

mutatePerceptionPenalty.abfFlow = {
  deps: [
    'system.general.modifiers.perceptionPenalty.base.value',
    'system.general.modifiers.perceptionPenalty.special.value',

    // Reads combat.armors[*].system.equipped.value
    // Reads combat.armors[*].system.localization.value
    // Reads combat.armors[*].system.perceptionPenalty.final.value
    'system.combat.armors'
  ],
  mods: ['system.general.modifiers.perceptionPenalty.final.value']
};
