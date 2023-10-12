import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateFatigue } from './calculations/calculateFatigue';

export const mutateAllActionsModifier = (data: ABFActorDataSourceData) => {
  data.general.modifiers.allActions.final.value = data.general.modifiers.allActions.base.value 
  + (data.automationOptiona.calculateFatigueModifier.value ? calculateFatigue(data) : 0);
};
