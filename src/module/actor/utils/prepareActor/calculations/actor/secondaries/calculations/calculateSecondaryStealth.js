/**
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 * @returns {number}
 */
export const calculateSecondaryStealth = data => {
  const { modifiers } = data.general;

  const stealthNaturalPenaltyReduction = Math.min(
    modifiers.naturalPenalty.reduction.value, //20
    Math.floor(-modifiers.naturalPenalty.unreduced.value / 2) //30 *0.5
  );
  //el final es el penalizador "real", restándole la reducción conseguimos el valor de penalizdor para los
  //casos normales (los que no tienen un máximo que reduce como sigilo o nadar)
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
