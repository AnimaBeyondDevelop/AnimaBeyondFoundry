import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorPresence = (armor: ArmorDataSource) =>
  Math.max(armor.data.presence.base.value + armor.data.quality.value * 10, 0);
