import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateRegenerationTypeFromConstitution } from './calculations/calculateRegenerationTypeFromConstitution';
import { calculateRegenerationFromRegenerationType } from './calculations/calculateRegenerationFromRegenerationType';

export const mutateRegenerationType = (data: ABFActorDataSourceData) => {

  const { regenerationType } = data.characteristics.secondaries;
 
  let baseRegen = calculateRegenerationTypeFromConstitution(
    data.characteristics.primaries.constitution.value
  );
  regenerationType.final.value =
    Math.max(0, regenerationType.mod.value + baseRegen);

  let [ resting, normal, recovery, esp ] = calculateRegenerationFromRegenerationType(regenerationType.final.value);
  data.characteristics.secondaries.regeneration.resting.value = resting;
  if (normal === "") normal = resting;
  data.characteristics.secondaries.regeneration.normal.value = normal;
  data.characteristics.secondaries.regeneration.recovery.value = recovery;
  data.characteristics.secondaries.regeneration.special.value = esp;

};
