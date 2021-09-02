import { complementPrimaries } from './utils/complementPrimaries';
import { ABFActor } from '../../ABFActor';
import { prepareItems } from '../prepareSheet/prepareItems/prepareItems';
import { calculateTotalArmor } from './utils/calculateTotalArmor';

export const prepareActor = (actor: ABFActor) => {
  prepareItems(actor);

  const { data } = actor.data;

  data.characteristics.primaries = complementPrimaries(data.characteristics.primaries);

  data.combat.totalArmor = calculateTotalArmor(data);
};
