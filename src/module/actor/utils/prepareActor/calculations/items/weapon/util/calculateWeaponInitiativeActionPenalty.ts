import { ABFActorDataSourceData } from '../../../../../../../types/Actor';

export const calculateWeaponInitiativeActionPenalty = (data: ABFActorDataSourceData) => {
  return (
    Math.ceil(data.general.modifiers.physicalActions.value / 2) +
    data.general.modifiers.naturalPenalty.byArmors.value
  );
};
