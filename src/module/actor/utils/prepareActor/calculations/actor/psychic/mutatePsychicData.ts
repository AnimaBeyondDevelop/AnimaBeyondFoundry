import { ABFActorDataSourceData } from '../../../../../../types/Actor';

export const mutatePsychicData = (data: ABFActorDataSourceData) => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const psychicProjectionMod = data.general.modifiers.psychicProjectionMod.value;

  const { psychic } = data;

  psychic.psychicProjection.final.value = Math.max(
    psychic.psychicProjection.base.value + allActionsPenalty + psychicProjectionMod,
    0
  );
  psychic.psychicProjection.imbalance.offensive.final.value = Math.max(
    psychic.psychicProjection.imbalance.offensive.base.value +
      allActionsPenalty +
      psychicProjectionMod,
    0
  );
  psychic.psychicProjection.imbalance.defensive.final.value = Math.max(
    psychic.psychicProjection.imbalance.defensive.base.value +
      allActionsPenalty +
      psychicProjectionMod,
    0
  );

  psychic.psychicPotential.final.value = Math.max(
    psychic.psychicPotential.base.value + Math.min(allActionsPenalty, 0),
    0
  );
};
