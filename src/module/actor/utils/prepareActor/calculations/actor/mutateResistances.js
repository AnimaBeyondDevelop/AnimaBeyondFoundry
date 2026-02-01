const mutateResistance = (resistance, presence, attribute) => {
  let baseValue = presence;
  baseValue = presence + attribute.mod.value;
  resistance.base.value = baseValue;
  resistance.final.value = baseValue + resistance.special.value;
};

/**
 * Adds to primary characteristics object without modifiers its modifiers,
 * calculated based on its value
 * @param {import('../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateResistances = data => {
  const presence = data.general.presence.final.value;
  mutateResistance(
    data.characteristics.secondaries.resistances.physical,
    presence,
    data.characteristics.primaries.constitution
  );
  mutateResistance(
    data.characteristics.secondaries.resistances.disease,
    presence,
    data.characteristics.primaries.constitution
  );
  mutateResistance(
    data.characteristics.secondaries.resistances.poison,
    presence,
    data.characteristics.primaries.constitution
  );
  mutateResistance(
    data.characteristics.secondaries.resistances.magic,
    presence,
    data.characteristics.primaries.power
  );
  mutateResistance(
    data.characteristics.secondaries.resistances.psychic,
    presence,
    data.characteristics.primaries.willPower
  );
};

mutateResistances.abfFlow = {
  deps: [
    'system.general.presence.final.value',
    'system.characteristics.primaries.constitution.final.value',
    'system.characteristics.primaries.power.final.value',
    'system.characteristics.primaries.willPower.final.value',
    'system.characteristics.secondaries.resistances.physical.special.value',
    'system.characteristics.secondaries.resistances.disease.special.value',
    'system.characteristics.secondaries.resistances.poison.special.value',
    'system.characteristics.secondaries.resistances.magic.special.value',
    'system.characteristics.secondaries.resistances.psychic.special.value'
  ],
  mods: [
    'system.characteristics.secondaries.resistances.physical.base.value',
    'system.characteristics.secondaries.resistances.physical.final.value',
    'system.characteristics.secondaries.resistances.disease.base.value',
    'system.characteristics.secondaries.resistances.disease.final.value',
    'system.characteristics.secondaries.resistances.poison.base.value',
    'system.characteristics.secondaries.resistances.poison.final.value',
    'system.characteristics.secondaries.resistances.magic.base.value',
    'system.characteristics.secondaries.resistances.magic.final.value',
    'system.characteristics.secondaries.resistances.psychic.base.value',
    'system.characteristics.secondaries.resistances.psychic.final.value'
  ]
};
