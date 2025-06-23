/**
 * Adds to primary characteristics object without modifiers its modifiers,
 * calculated based on its value
 * @param {import('../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePresence = data => {
  const { presence, level } = data.general;

  presence.base.value =  level.value <= 0 ? 20 : (25 + (level.value * 5));
  presence.final.value = presence.base.value + presence.special.value;
};