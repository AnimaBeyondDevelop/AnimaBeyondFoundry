import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateMovementInMetersFromMovementType } from './calculations/calculateMovementInMetersFromMovementType';
import { ArmorDataSource } from '../../../../../../types/combat/ArmorItemConfig';

export const mutateMovementType = (data: ABFActorDataSourceData) => {
  const armors = data.combat.armors as ArmorDataSource[];

  const armorsMovementRestrictions = armors.reduce((prev, curr) => prev + curr.data.movementRestriction.final.value, 0);

  const { movementType } = data.characteristics.secondaries;

  movementType.final.value =
    movementType.mod.value +
    data.characteristics.primaries.agility.value +
    Math.min(0, data.general.modifiers.allActions.base.value) +
    armorsMovementRestrictions;

  movementType.final.value = Math.max(0, movementType.final.value);

  data.characteristics.secondaries.movement.maximum.value = calculateMovementInMetersFromMovementType(
    movementType.final.value
  );
  data.characteristics.secondaries.movement.running.value = calculateMovementInMetersFromMovementType(
    Math.max(0, movementType.final.value - 2)
  );
};
