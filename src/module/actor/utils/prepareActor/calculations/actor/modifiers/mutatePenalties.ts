import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateFatigue } from './calculations/calculateFatigue';

export const mutatePenalties = (data: ABFActorDataSourceData) => {
  data.general.modifiers.allActions.final.value = data.general.modifiers.allActions.base.value + calculateFatigue(data);
};
