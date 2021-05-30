import { ABFActor } from '../../ABFActor';
import { prepareItems } from './prepareItems/prepareItems';

export const prepareSheet = (
  originalData: ActorSheet.Data<ABFActor>
): ActorSheet.Data<ABFActor> => {
  let newData: ActorSheet.Data<ABFActor> = JSON.parse(JSON.stringify(originalData));

  // Attach to the actor data the items like skills, free access spells, etc...
  // In resume, all items that are created dynamically in the actor
  newData = prepareItems(newData);

  // Synchronize sheet data with actor data
  newData.data = newData.actor.data;

  return newData;
};
