import { ABFActorDataSourceData } from '../../../../../../../types/Actor';

export const calculateWeaponInitiativeActionPenalty = (data: ABFActorDataSourceData) => {
  return (
    Math.ceil(data.general.modifiers.allActions.value / 2) + Math.ceil(data.general.modifiers.physicalActions.value / 2)
  );
};
