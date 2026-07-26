/**
 * Raw physical-deficiency penalty from negative life points (before special / multiplier).
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 * @returns {number}
 */
export const calculateNegativeLifePoints = data => {
  const lifePoints = Number(data.characteristics.secondaries.lifePoints.value) || 0;
  if (lifePoints >= 0) return 0;
  return lifePoints;
};
