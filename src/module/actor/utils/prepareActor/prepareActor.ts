import { complementPrimaries } from './utils/complementPrimaries';
import { ABFActor } from '../../ABFActor';
import { prepareItems } from '../prepareItems/prepareItems';
import { calculateTotalArmor } from './utils/calculateTotalArmor';

const DERIVED_DATA_FUNCTIONS = [complementPrimaries, calculateTotalArmor];

export const prepareActor = (actor: ABFActor) => {
  prepareItems(actor);

  const { data } = actor.data;

  for (const fn of DERIVED_DATA_FUNCTIONS) {
    fn(data);
  }
};
