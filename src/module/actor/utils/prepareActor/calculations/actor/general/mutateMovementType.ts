import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateMovement } from './calculations/calculateMovement';
import { ArmorDataSource } from '../../../../../../types/combat/ArmorItemConfig';

export const mutateMovementType = (data: ABFActorDataSourceData) => {
  const armors = data.combat.armors as ArmorDataSource[];

  const armorsMovementRestrictions = armors.reduce((prev, curr) => prev + curr.data.movementRestriction.final.value, 0);

  data.characteristics.secondaries.movementType.final.value =
    data.characteristics.secondaries.movementType.mod.value +
    data.characteristics.primaries.agility.value +
    Math.min(0, data.general.modifiers.allActions.base.value) +
    armorsMovementRestrictions;

  data.characteristics.secondaries.movementType.final.value = Math.max(
    0,
    data.characteristics.secondaries.movementType.final.value
  );

  data.characteristics.secondaries.movement.value = calculateMovement(data);
};
