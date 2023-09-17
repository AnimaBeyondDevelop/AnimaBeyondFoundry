import { ArmorDataSource } from '../../../../../../../types/Items';

export const calculateArmorPresence = (armor: ArmorDataSource) =>
  Math.max(armor.system.presence.base.value + armor.system.quality.value * 10, 0);
