/**
 * Adds to primary characteristics object without modifiers its modifiers,
 * calculated based on its value
 * @param {import('../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateTotalLevel = data => {
  const { level, levels } = data.general;
  let totalLevel = 0;
  if (levels) {
    totalLevel = levels.reduce(
      (accum, current) => accum + Number(current.system.level),
      0
    );
  }
  level.value = totalLevel;
};
