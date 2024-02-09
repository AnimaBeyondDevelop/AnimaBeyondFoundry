/**
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 * @returns {number}
 */
export const calculateSecondaryStealth = data => {
  const { modifiers } = data.general;

  const stealthNaturalPenaltyReduction = Math.min(
    modifiers.naturalPenalty.reduction.value,
    Math.floor(-modifiers.naturalPenalty.unreduced.value / 2)
  );
  const unreducedNaturalPenalty =
    modifiers.naturalPenalty.final.value - modifiers.naturalPenalty.reduction.value;
  const stealthNaturalPenalty = unreducedNaturalPenalty + stealthNaturalPenaltyReduction;

  return (
    data.secondaries.subterfuge.stealth.base.value +
    modifiers.allActions.final.value +
    modifiers.physicalActions.final.value +
    stealthNaturalPenalty
  );
};
