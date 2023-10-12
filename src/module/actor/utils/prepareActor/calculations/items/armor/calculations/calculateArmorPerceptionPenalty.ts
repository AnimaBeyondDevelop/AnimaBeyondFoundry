import { ArmorDataSource } from '../../../../../../../types/Items';
import { ArmorLocation } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorPerceptionPenalty = (armor: ArmorDataSource) =>{
    if(armor.system.localization.value !== ArmorLocation.HEAD) return 0;
    return Math.min(armor.system.perceptionPenalty.base.value, 0);
};