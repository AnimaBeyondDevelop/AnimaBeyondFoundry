import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorPresence = (armor: ArmorDataSource) =>
  Math.max(armor.system.presence.base.value + armor.system.quality.value * 10, 0);
