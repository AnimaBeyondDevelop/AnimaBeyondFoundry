import { calculateFatigue } from './calculations/calculateFatigue';

/**
 * @param { import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateAllActionsModifier = data => {
  const { automationOptions, general: { modifiers: { pain, allActions } } } = data;

  if (automationOptions.calculateFatigueModifier) { pain.fatigue.value = calculateFatigue(data); };

  if (pain.fatigue.value + pain.physical.value === 0) { pain.withstandPain.value = 0 };

  allActions.final.value = allActions.base.value + allActions.special.value + pain.incapacitation.value + Math.min(0, pain.fatigue.value + pain.physical.value + pain.withstandPain.value);

};
