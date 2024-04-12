import { calculateFatigue } from './calculations/calculateFatigue';

/**
 * @param { import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateAllActionsModifier = data => {
  const { penalties, allActions } = data.general.modifiers;

  penalties.fatigue.value = calculateFatigue(data);
  if (penalties.fatigue.value + penalties.pain.value === 0) { penalties.withstandPain.value = 0 };
  allActions.final.value = allActions.base.value + allActions.special.value + penalties.physicalDeficiency.value + Math.min(0, penalties.fatigue.value + penalties.pain.value + penalties.withstandPain.value);

};
