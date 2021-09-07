import { ABFActorDataSourceData } from '../../../../../../types/Actor';

export const mutatePsychicData = (data: ABFActorDataSourceData) => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;

  const { psychic } = data;

  psychic.psychicProjection.final.value = Math.max(psychic.psychicProjection.base.value + allActionsPenalty, 0);

  psychic.psychicPotential.final.value = Math.max(psychic.psychicPotential.base.value + allActionsPenalty, 0);
};
