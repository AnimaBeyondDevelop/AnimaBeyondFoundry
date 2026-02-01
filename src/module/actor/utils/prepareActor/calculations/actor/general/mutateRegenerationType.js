import { calculateRegenerationTypeFromConstitution } from './calculations/calculateRegenerationTypeFromConstitution';
import { calculateRegenerationFromRegenerationType } from './calculations/calculateRegenerationFromRegenerationType';

export const mutateRegenerationType = data => {
  const { regenerationType } = data.characteristics.secondaries;

  const baseRegen = calculateRegenerationTypeFromConstitution(
    data.characteristics.primaries.constitution.final.value
  );

  regenerationType.final.value = Math.max(0, regenerationType.mod.value + baseRegen);

  // eslint-disable-next-line prefer-const
  let [resting, normal, recovery] = calculateRegenerationFromRegenerationType(
    regenerationType.final.value
  );

  data.characteristics.secondaries.regeneration.resting = resting;
  if (normal === null) normal = resting;
  data.characteristics.secondaries.regeneration.normal = normal;
  data.characteristics.secondaries.regeneration.recovery = recovery;
};

mutateRegenerationType.abfFlow = {
  deps: [
    'system.characteristics.primaries.constitution.final.value',
    'system.characteristics.secondaries.regenerationType.mod.value'
  ],
  mods: [
    'system.characteristics.secondaries.regenerationType.final.value',
    'system.characteristics.secondaries.regeneration.resting',
    'system.characteristics.secondaries.regeneration.normal',
    'system.characteristics.secondaries.regeneration.recovery'
  ]
};
