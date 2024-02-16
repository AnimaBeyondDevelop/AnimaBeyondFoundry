const mutateResistance = (resistance, presence, attribute) => {
  resistance.final.value = resistance.base.value + resistance.special.value + presence + attribute.mod;
}
/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateResistances = (data) => {
  const { automationOptions, characteristics, general: { presence } } = data;
  if (automationOptions.calculateResistances) {
    mutateResistance(characteristics.secondaries.resistances.physical, presence.final.value, characteristics.primaries.constitution);
    mutateResistance(characteristics.secondaries.resistances.disease, presence.final.value, characteristics.primaries.constitution);
    mutateResistance(characteristics.secondaries.resistances.poison, presence.final.value, characteristics.primaries.constitution);
    mutateResistance(characteristics.secondaries.resistances.magic, presence.final.value, characteristics.primaries.power);
    mutateResistance(characteristics.secondaries.resistances.psychic, presence.final.value, characteristics.primaries.willPower);
  }
};