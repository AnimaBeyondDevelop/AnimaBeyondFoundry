const calculatePresenceByLevel = (level, calculatePresence) => {
  if (calculatePresence) {
    switch (level) {
      case 0:
        return 20;
      default:
        return 25 + level * 5;
    }
  } else return 0
}
/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePresence = (data) => {
  const { automationOptions, general: { presence, levels } } = data;

  const totalLevel = levels.map(lvl => lvl.system.level).reduce((prev, curr) => prev + curr, 0)
  presence.final.value = presence.base.value + presence.special.value + calculatePresenceByLevel(totalLevel, automationOptions.calculatePresence)

};