import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateHelmetArmorsNaturalPenalty } from '../../natural-penalty/calculations/calculateHelmetArmorsNaturalPenalty';

export const calculateSecondaryNotice = (data: ABFActorDataSourceData): number => {
  let value = data.secondaries.perception.notice.base.value + data.general.modifiers.allActions.final.value;

  value += calculateHelmetArmorsNaturalPenalty(data);

  return value;
};
