import { ABFActorDataSourceData } from '../../../../../../../types/Actor';

export const calculateSecondaryHide = (data: ABFActorDataSourceData): number => {
  return (
    data.secondaries.subterfuge.hide.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.naturalPenalty.byArmors.value
  );
};
