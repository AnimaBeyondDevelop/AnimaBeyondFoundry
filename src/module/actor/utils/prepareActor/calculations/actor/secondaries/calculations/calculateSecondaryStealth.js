/**
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 * @returns {number}
 */
export const calculateSecondaryStealth = data =>
  data.secondaries.subterfuge.stealth.base.value +
  data.general.modifiers.allActions.final.value +
  data.general.modifiers.physicalActions.final.value +
  data.general.modifiers.naturalPenalty.final.value -
  Math.floor(data.general.modifiers.naturalPenalty.reduction.value / 2);
