const mutateResistance = (resistance, presence, attribute) => {
  let baseValue = presence;
  baseValue = presence + attribute.mod.value;
  resistance.base.value = baseValue;
  resistance.final.value = baseValue + resistance.special.value;
};

// ── Individual base+final per resistance ──────────────────────────────────────

const makeResistanceMutator = (key, attrKey) => {
  const fnBase = data => {
    const presence = data.general.presence.final.value;
    const attr = data.characteristics.primaries[attrKey];
    const resistance = data.characteristics.secondaries.resistances[key];
    resistance.base.value = presence + attr.mod.value;
  };
  fnBase.abfFlow = {
    deps: [
      'system.general.presence.final.value',
      `system.characteristics.primaries.${attrKey}.final.value`
    ],
    mods: [`system.characteristics.secondaries.resistances.${key}.base.value`]
  };
  Object.defineProperty(fnBase, 'name', { value: `mutate${capitalize(key)}ResistanceBase` });

  const fnFinal = data => {
    const resistance = data.characteristics.secondaries.resistances[key];
    resistance.final.value = resistance.base.value + resistance.special.value;
  };
  fnFinal.abfFlow = {
    deps: [
      `system.characteristics.secondaries.resistances.${key}.base.value`,
      `system.characteristics.secondaries.resistances.${key}.special.value`
    ],
    mods: [`system.characteristics.secondaries.resistances.${key}.final.value`]
  };
  Object.defineProperty(fnFinal, 'name', { value: `mutate${capitalize(key)}ResistanceFinal` });

  return { fnBase, fnFinal };
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const physicalR = makeResistanceMutator('physical', 'constitution');
const diseaseR = makeResistanceMutator('disease', 'constitution');
const poisonR = makeResistanceMutator('poison', 'constitution');
const magicR = makeResistanceMutator('magic', 'power');
const psychicR = makeResistanceMutator('psychic', 'willPower');

export const mutatePhysicalResistanceBase = physicalR.fnBase;
export const mutatePhysicalResistanceFinal = physicalR.fnFinal;
export const mutateDiseaseResistanceBase = diseaseR.fnBase;
export const mutateDiseaseResistanceFinal = diseaseR.fnFinal;
export const mutatePoisonResistanceBase = poisonR.fnBase;
export const mutatePoisonResistanceFinal = poisonR.fnFinal;
export const mutateMagicResistanceBase = magicR.fnBase;
export const mutateMagicResistanceFinal = magicR.fnFinal;
export const mutatePsychicResistanceBase = psychicR.fnBase;
export const mutatePsychicResistanceFinal = psychicR.fnFinal;

/**
 * @deprecated Use individual mutate*Resistance* functions instead.
 * Kept for backwards compatibility.
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
