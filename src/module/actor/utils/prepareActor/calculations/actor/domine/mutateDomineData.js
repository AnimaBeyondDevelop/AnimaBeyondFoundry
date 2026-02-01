export const mutateDomineData = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;

  const { domine } = data;
  const KI_ACCUMULATIONS = [
    'strength',
    'agility',
    'dexterity',
    'constitution',
    'willPower',
    'power'
  ];

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
