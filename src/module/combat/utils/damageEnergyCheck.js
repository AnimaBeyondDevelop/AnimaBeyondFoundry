import { ABFItems } from '../../items/ABFItems';
export const damageEnergyCheck = (item, dificulty) => {
  if (item?.type === ABFItems.WEAPON) {
    return item.system.damageEnergy
  };
  if (item?.type === ABFItems.SPELL) {
    return item.system.damageEnergy
  };
  if (item?.type === ABFItems.PSYCHIC_POWER) {
    return item.system.damageEnergy.value >= dificulty
  };
  return false
};
