import { calculateFatigue } from './calculations/calculateFatigue';

/**
 * @param { import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateAllActionsModifier = data => {
  data.general.modifiers.allActions.final.value =
    data.general.modifiers.allActions.base.value +
    (data.automationOptiona.calculateFatigueModifier.value ? calculateFatigue(data) : 0);
};
