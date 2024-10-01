/**
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePsychicData = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;

  const { psychic } = data;

  psychic.psychicProjection.final.value = Math.max(
    psychic.psychicProjection.base.value + allActionsPenalty,
    0
  );
  psychic.psychicProjection.imbalance.offensive.final.value = Math.max(
    psychic.psychicProjection.imbalance.offensive.base.value + allActionsPenalty,
    0
  );
  psychic.psychicProjection.imbalance.defensive.final.value = Math.max(
    psychic.psychicProjection.imbalance.defensive.base.value + allActionsPenalty,
    0
  );

  psychic.psychicPotential.final.value = Math.max(
    psychic.psychicPotential.base.value + Math.min(allActionsPenalty, 0),
    0
  );
};
