import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateMovementInMetersFromMovementType } from './calculations/calculateMovementInMetersFromMovementType';
import { getEquippedArmors } from '../../../utils/getEquippedArmors';
import { calculateNaturalPenaltyWithoutWearArmor } from '../natural-penalty/calculations/calculateWearArmorNaturalPenalty';

const calculateArmorsMovementTypeModifier = (data) => {
  const armorsMovementRestrictions = getEquippedArmors(data).reduce(
    (prev, curr) => prev + curr.system.movementRestriction.final.value,
    0
  );

  const totalWearRequirement = calculateNaturalPenaltyWithoutWearArmor(data);
  const wearArmor = data.combat.wearArmor.value;

  const wearArmorModifier = Math.floor(Math.max(0, wearArmor - totalWearRequirement) / 50);

  return Math.min(0, wearArmorModifier + armorsMovementRestrictions);
};

export const mutateMovementType = (data) => {
  const armorsMovementRestrictions = calculateArmorsMovementTypeModifier(data);

  const { movementType } = data.characteristics.secondaries;

  movementType.final.value =
    movementType.mod.value +
    data.characteristics.primaries.agility.value +
    Math.min(0, Math.ceil(data.general.modifiers.allActions.base.value / 20)) +
    armorsMovementRestrictions;

  movementType.final.value = Math.max(0, movementType.final.value);

  data.characteristics.secondaries.movement.maximum.value = calculateMovementInMetersFromMovementType(
    movementType.final.value
  );
  data.characteristics.secondaries.movement.running.value = calculateMovementInMetersFromMovementType(
    Math.max(0, movementType.final.value - 2)
  );
};
