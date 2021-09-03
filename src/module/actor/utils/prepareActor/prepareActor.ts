import { ABFActor } from '../../ABFActor';
import { prepareItems } from '../prepareItems/prepareItems';
import { calculateWeaponsData } from './calculations/items/weapon/calculateWeaponsData';
import { complementPrimaries } from './calculations/complementPrimaries';
import { calculateTotalArmor } from './calculations/calculateTotalArmor';

const DERIVED_DATA_FUNCTIONS = [complementPrimaries, calculateTotalArmor, calculateWeaponsData];

export const prepareActor = (actor: ABFActor) => {
  prepareItems(actor);

  const { data } = actor.data;

  for (const fn of DERIVED_DATA_FUNCTIONS) {
    fn(data);
  }
};
