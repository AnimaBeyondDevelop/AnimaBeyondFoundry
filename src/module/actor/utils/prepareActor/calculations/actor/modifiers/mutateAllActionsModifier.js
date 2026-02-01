import { calculateFatigue } from './calculations/calculateFatigue';

/**
 * @param { import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateAllActionsModifier = data => {
  data.general.modifiers.allActions.final.value =
    data.general.modifiers.allActions.base.value +
    data.general.modifiers.allActions.special.value +
    calculateFatigue(data);
};

mutateAllActionsModifier.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.base.value',
    'system.general.modifiers.allActions.special.value',
    'system.automationOptions.calculateFatigueModifier.value',
    'system.characteristics.secondaries.fatigue.value',
    'system.characteristics.secondaries.fatigue.max'
  ],
  mods: ['system.general.modifiers.allActions.final.value']
};
