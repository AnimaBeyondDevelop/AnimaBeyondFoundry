import { ABFActorDataSourceData } from '../../../../../../../types/Actor';

export const calculateSecondarySwim = (data: ABFActorDataSourceData): number => 
    data.secondaries.athletics.swim.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.final.value +
    data.general.modifiers.naturalPenalty.final.value -
    data.general.modifiers.naturalPenalty.reduction.value;
