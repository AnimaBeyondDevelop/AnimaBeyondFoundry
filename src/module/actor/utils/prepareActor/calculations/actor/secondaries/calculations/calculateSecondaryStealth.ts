import { ABFActorDataSourceData } from '../../../../../../../types/Actor';

export const calculateSecondaryStealth = (data: ABFActorDataSourceData): number => 
    data.secondaries.subterfuge.stealth.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.final.value +
    data.general.modifiers.naturalPenalty.final.value -
    Math.floor(data.general.modifiers.naturalPenalty.reduction.value/2);

