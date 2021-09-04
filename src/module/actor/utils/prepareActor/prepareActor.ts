import { ABFActor } from '../../ABFActor';
import { prepareItems } from '../prepareItems/prepareItems';
import { calculateWeaponsData } from './calculations/items/weapon/calculateWeaponsData';
import { calculatePrimaryModifiers } from './calculations/actor/calculatePrimaryModifiers';
import { calculateTotalArmor } from './calculations/actor/calculateTotalArmor';
import { calculateAmmoData } from './calculations/items/ammo/calculateAmmoData';
import { calculateArmorsData } from './calculations/items/armor/calculateArmorsData';
import { calculateNaturalPenalty } from './calculations/actor/natural-penalty/calculateNaturalPenalty';
import { calculateSecondariesData } from './calculations/actor/secondaries/calculateSecondariesData';
import { calculatePenalties } from './calculations/actor/modifiers/calculatePenalties';
import { calculateCombatData } from './calculations/actor/combat/calculateCombatData';
import { ABFActorDataSourceData } from '../../../types/Actor';

// Be careful with order of this functions, some derived data functions could be dependent of another
const DERIVED_DATA_FUNCTIONS: ((data: ABFActorDataSourceData) => void)[] = [
  calculatePrimaryModifiers,
  calculatePenalties,
  calculateCombatData,
  calculateArmorsData,
  calculateTotalArmor,
  calculateNaturalPenalty,
  calculateSecondariesData,
  calculateAmmoData,
  calculateWeaponsData
];

export const prepareActor = (actor: ABFActor) => {
  prepareItems(actor);

  const { data } = actor.data;

  for (const fn of DERIVED_DATA_FUNCTIONS) {
    fn(data);
  }
};
