import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorMovementRestriction = (armor: ArmorDataSource) =>
  Math.min(armor.data.movementRestriction.base.value + Math.floor(armor.data.quality.value / 5), 0);
