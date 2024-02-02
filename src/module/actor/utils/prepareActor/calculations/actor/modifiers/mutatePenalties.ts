import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateFatigue } from './calculations/calculateFatigue';

export const mutatePenalties = (data: ABFActorDataSourceData) => {
  const { pain, allActions } = data.general.modifiers;
  pain.fatigue.value = calculateFatigue(data);
  if (pain.fatigue.value + pain.physical.value === 0) { pain.withstandPain.value = 0 };
  allActions.final.value = allActions.base.value + pain.incapacitation.value + Math.min(0, pain.fatigue.value + pain.physical.value + pain.withstandPain.value);
};
