import { calculateMovementInMetersFromMovementType } from './calculations/calculateMovementInMetersFromMovementType';
import { getEquippedArmors } from '../../../utils/getEquippedArmors';
import { calculateEquippedArmorsRequirement } from '../modifiers/calculations/calculateArmorPhysicalPenalty';

const calculateArmorsMovementTypeModifier = data => {
  const armorsMovementRestrictions = getEquippedArmors(data).reduce(
    (prev, curr) => prev + curr.system.movementRestriction.final.value,
    0
  );

  const totalWearRequirement = calculateEquippedArmorsRequirement(data);
  const wearArmor = data.combat.wearArmor.final.value;

  const wearArmorModifier = Math.floor(
    Math.max(0, wearArmor - totalWearRequirement) / 50
  );

  return Math.min(0, wearArmorModifier + armorsMovementRestrictions);
};

export const mutateMovementType = data => {
  const armorsMovementRestrictions = calculateArmorsMovementTypeModifier(data);

  const { movementType } = data.characteristics.secondaries;

  movementType.final.value =
    movementType.mod.value +
    data.characteristics.primaries.agility.final.value +
    Math.min(0, Math.ceil(data.general.modifiers.allActions.final.value / 20)) +
    armorsMovementRestrictions;

  movementType.final.value = Math.max(0, movementType.final.value);

  data.characteristics.secondaries.movement.maximum.value =
    calculateMovementInMetersFromMovementType(movementType.final.value);
  data.characteristics.secondaries.movement.running.value =
    calculateMovementInMetersFromMovementType(Math.max(0, movementType.final.value - 2));
};

mutateMovementType.abfFlow = {
  deps: [
    'system.characteristics.secondaries.movementType.mod.value',
    'system.characteristics.primaries.agility.final.value',
    'system.general.modifiers.allActions.final.value',

    // armor penalty (calculateArmorPhysicalPenalty)
    'system.combat.wearArmor.final.value',
    'system.combat.armors'
  ],
  mods: [
    'system.characteristics.secondaries.movementType.final.value',
    'system.characteristics.secondaries.movement.maximum.value',
    'system.characteristics.secondaries.movement.running.value'
  ]
};
