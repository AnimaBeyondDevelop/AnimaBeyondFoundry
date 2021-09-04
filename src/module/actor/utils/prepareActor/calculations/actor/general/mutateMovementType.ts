import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateMovement } from './calculations/calculateMovement';

export const mutateMovementType = (data: ABFActorDataSourceData) => {
  data.characteristics.secondaries.movementType.value = data.characteristics.primaries.agility.value;

  if (data.secondaries.athletics.athleticism.final.value >= 180) {
    data.characteristics.secondaries.movementType.value += 1;
  }

  if (data.secondaries.athletics.athleticism.final.value >= 280) {
    data.characteristics.secondaries.movementType.value += 1;
  }

  data.characteristics.secondaries.movement.value = calculateMovement(data);
};
