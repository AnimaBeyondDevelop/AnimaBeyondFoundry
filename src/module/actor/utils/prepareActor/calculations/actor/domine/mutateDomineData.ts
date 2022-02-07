import { ABFActorDataSourceData } from '../../../../../../types/Actor';

export const mutateDomineData = (data: ABFActorDataSourceData) => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;

  const { domine } = data;
  const KI_ACCUMULATIONS = [
    "strength",
    "agility",
    "dexterity",
    "constitution",
    "willPower",
    "power"
  ];

  for (const accum of KI_ACCUMULATIONS) {
    domine.kiAccumulation[accum].final.value = Math.max(domine.kiAccumulation[accum].base.value + Math.floor(allActionsPenalty / 20), 0);
  }

};
