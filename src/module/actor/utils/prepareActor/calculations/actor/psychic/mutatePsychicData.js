/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePsychicData = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;

  const { psychicProjection, psychicPotential } = data.psychic;

  psychicProjection.final.value = Math.max(
    psychicProjection.base.value + allActionsPenalty,
    0
  );
  psychicProjection.imbalance.offensive.final.value = Math.max(
    psychicProjection.imbalance.offensive.base.value +
    psychicProjection.imbalance.offensive.special.value +
    allActionsPenalty,
    0
  );
  psychicProjection.imbalance.defensive.final.value = Math.max(
    psychicProjection.imbalance.defensive.base.value +
    psychicProjection.imbalance.defensive.special.value +
    allActionsPenalty,
    0
  );

  psychicPotential.final.value = Math.max(
    psychicPotential.base.value + Math.min(allActionsPenalty, 0),
    0
  );
};
