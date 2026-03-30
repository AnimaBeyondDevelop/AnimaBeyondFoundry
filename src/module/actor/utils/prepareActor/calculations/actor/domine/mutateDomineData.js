const KI_ACCUMULATIONS = [
  'strength',
  'agility',
  'dexterity',
  'constitution',
  'willPower',
  'power'
];

const makeKiAccumulationMutator = accum => {
  const fn = data => {
    const allActionsPenalty = data.general.modifiers.allActions.final.value;
    data.domine.kiAccumulation[accum].final.value = Math.max(
      data.domine.kiAccumulation[accum].base.value +
        Math.min(Math.ceil(allActionsPenalty / 20), 0),
      0
    );
  };

  fn.abfFlow = {
    deps: [
      'system.general.modifiers.allActions.final.value',
      `system.domine.kiAccumulation.${accum}.base.value`
    ],
    mods: [`system.domine.kiAccumulation.${accum}.final.value`]
  };

  Object.defineProperty(fn, 'name', { value: `mutateKiAccumulation_${accum}` });

  return fn;
};

export const mutateKiAccumulationStrength = makeKiAccumulationMutator('strength');
export const mutateKiAccumulationAgility = makeKiAccumulationMutator('agility');
export const mutateKiAccumulationDexterity = makeKiAccumulationMutator('dexterity');
export const mutateKiAccumulationConstitution = makeKiAccumulationMutator('constitution');
export const mutateKiAccumulationWillPower = makeKiAccumulationMutator('willPower');
export const mutateKiAccumulationPower = makeKiAccumulationMutator('power');

/**
 * @deprecated Use individual mutateKiAccumulation* functions instead.
 * Kept for backwards compatibility.
 */
export const mutateDomineData = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;

  const { domine } = data;

  for (const accum of KI_ACCUMULATIONS) {
    domine.kiAccumulation[accum].final.value = Math.max(
      domine.kiAccumulation[accum].base.value +
        Math.min(Math.ceil(allActionsPenalty / 20), 0),
      0
    );
  }
};

mutateDomineData.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',

    'system.domine.kiAccumulation.strength.base.value',
    'system.domine.kiAccumulation.agility.base.value',
    'system.domine.kiAccumulation.dexterity.base.value',
    'system.domine.kiAccumulation.constitution.base.value',
    'system.domine.kiAccumulation.willPower.base.value',
    'system.domine.kiAccumulation.power.base.value'
  ],
  mods: [
    'system.domine.kiAccumulation.strength.final.value',
    'system.domine.kiAccumulation.agility.final.value',
    'system.domine.kiAccumulation.dexterity.final.value',
    'system.domine.kiAccumulation.constitution.final.value',
    'system.domine.kiAccumulation.willPower.final.value',
    'system.domine.kiAccumulation.power.final.value'
  ]
};
