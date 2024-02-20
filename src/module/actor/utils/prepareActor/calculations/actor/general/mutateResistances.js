const mutateResistance = (resistance, presence, attribute, automate) => {

  resistance.final.value = resistance.base.value + resistance.special.value;
  if (automate) {
    resistance.final.value += presence + attribute.mod
  }
}
/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateResistances = (data) => {
  const { automationOptions, characteristics, general: { presence } } = data;

  mutateResistance(characteristics.secondaries.resistances.physical, presence.final.value, characteristics.primaries.constitution, automationOptions.calculateResistances);
  mutateResistance(characteristics.secondaries.resistances.disease, presence.final.value, characteristics.primaries.constitution, automationOptions.calculateResistances);
  mutateResistance(characteristics.secondaries.resistances.poison, presence.final.value, characteristics.primaries.constitution, automationOptions.calculateResistances);
  mutateResistance(characteristics.secondaries.resistances.magic, presence.final.value, characteristics.primaries.power, automationOptions.calculateResistances);
  mutateResistance(characteristics.secondaries.resistances.psychic, presence.final.value, characteristics.primaries.willPower, automationOptions.calculateResistances);

};