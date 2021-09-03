import { ABFActor } from '../../ABFActor';
import { prepareItems } from '../prepareItems/prepareItems';
import { calculateWeaponsData } from './calculations/items/weapon/calculateWeaponsData';
import { calculatePrimaryModifiers } from './calculations/actor/calculatePrimaryModifiers';
import { calculateTotalArmor } from './calculations/actor/calculateTotalArmor';
import { calculateAmmoData } from './calculations/items/ammo/calculateAmmoData';
import { calculateArmorsData } from './calculations/items/armor/calculateArmorsData';
import { calculateNaturalPenalty } from './calculations/actor/calculateNaturalPenalty';

// Be careful with order of this functions, some derived data functions could be dependent of another
const DERIVED_DATA_FUNCTIONS = [
  calculatePrimaryModifiers,
  calculateAmmoData,
  calculateWeaponsData,
  calculateArmorsData,
  calculateTotalArmor,
  calculateNaturalPenalty
];

export const prepareActor = (actor: ABFActor) => {
  prepareItems(actor);

  const { data } = actor.data;

  for (const fn of DERIVED_DATA_FUNCTIONS) {
    fn(data);
  }
};
