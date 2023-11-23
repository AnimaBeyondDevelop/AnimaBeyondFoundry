import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateFatigue } from './calculations/calculateFatigue';

export const mutateAllActionsModifier = (data: ABFActorDataSourceData) => {
  data.general.modifiers.allActions.final.value = data.general.modifiers.allActions.base.value + data.general.modifiers.allActions.special.value 
  + (data.automationOptions.calculateFatigueModifier.value ? calculateFatigue(data) : 0);
};
