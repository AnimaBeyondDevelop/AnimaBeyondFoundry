/**
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePsychicProjection = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const { psychic } = data;

  psychic.psychicProjection.final.value = Math.max(
    psychic.psychicProjection.base.value + allActionsPenalty,
    0
  );
};

mutatePsychicProjection.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.psychic.psychicProjection.base.value'
  ],
  mods: ['system.psychic.psychicProjection.final.value']
};

export const mutatePsychicProjectionOffensive = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const { psychic } = data;

  psychic.psychicProjection.imbalance.offensive.final.value = Math.max(
    psychic.psychicProjection.imbalance.offensive.base.value + allActionsPenalty,
    0
  );
};

mutatePsychicProjectionOffensive.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.psychic.psychicProjection.imbalance.offensive.base.value'
  ],
  mods: ['system.psychic.psychicProjection.imbalance.offensive.final.value']
};

export const mutatePsychicProjectionDefensive = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const { psychic } = data;

  psychic.psychicProjection.imbalance.defensive.final.value = Math.max(
    psychic.psychicProjection.imbalance.defensive.base.value + allActionsPenalty,
    0
  );
};

mutatePsychicProjectionDefensive.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.psychic.psychicProjection.imbalance.defensive.base.value'
  ],
  mods: ['system.psychic.psychicProjection.imbalance.defensive.final.value']
};

export const mutatePsychicPotential = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const { psychic } = data;

  psychic.psychicPotential.final.value = Math.max(
    psychic.psychicPotential.base.value + Math.min(allActionsPenalty, 0),
    0
  );
};

mutatePsychicPotential.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.psychic.psychicPotential.base.value'
  ],
  mods: ['system.psychic.psychicPotential.final.value']
};

/**
 * @deprecated Use mutatePsychicProjection, mutatePsychicProjectionOffensive,
 *   mutatePsychicProjectionDefensive and mutatePsychicPotential instead.
 * Kept for backwards compatibility.
 */
export const mutatePsychicData = data => {
  mutatePsychicProjection(data);
  mutatePsychicProjectionOffensive(data);
  mutatePsychicProjectionDefensive(data);
  mutatePsychicPotential(data);
};

mutatePsychicData.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.psychic.psychicProjection.base.value',
    'system.psychic.psychicProjection.imbalance.offensive.base.value',
    'system.psychic.psychicProjection.imbalance.defensive.base.value',
    'system.psychic.psychicPotential.base.value'
  ],
  mods: [
    'system.psychic.psychicProjection.final.value',
    'system.psychic.psychicProjection.imbalance.offensive.final.value',
    'system.psychic.psychicProjection.imbalance.defensive.final.value',
    'system.psychic.psychicPotential.final.value'
  ]
};
