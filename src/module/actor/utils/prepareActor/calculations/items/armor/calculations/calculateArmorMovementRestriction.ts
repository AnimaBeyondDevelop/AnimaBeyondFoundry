import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorMovementRestriction = (armor: ArmorDataSource) =>
  Math.min(armor.system.movementRestriction.base.value + Math.floor(armor.system.quality.value / 5), 0);
