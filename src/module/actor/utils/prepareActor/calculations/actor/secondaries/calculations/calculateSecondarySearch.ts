import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateHelmetArmorsNaturalPenalty } from '../../natural-penalty/calculations/calculateHelmetArmorsNaturalPenalty';

export const calculateSecondarySearch = (data: ABFActorDataSourceData): number => {
  let value = data.secondaries.perception.search.base.value + data.general.modifiers.allActions.final.value;

  value += calculateHelmetArmorsNaturalPenalty(data);

  return value;
};
