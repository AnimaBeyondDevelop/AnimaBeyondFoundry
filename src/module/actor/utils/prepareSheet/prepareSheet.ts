import { prepareItems } from './prepareItems/prepareItems';
import { complementPrimaries } from '../prepareActor/utils/complementPrimaries';
import { calculateTotalArmor } from '../prepareActor/utils/calculateTotalArmor';

export const prepareSheet = (sheetData: ActorSheet.Data): ActorSheet.Data => {
  // Attach to the actor data the items like skills, free access spells, etc...
  // In resume, all items that are created dynamically in the actor
  sheetData = prepareItems(sheetData);

  const actorData = sheetData.actor.data;

  actorData.data.characteristics.primaries = complementPrimaries(actorData.data.characteristics.primaries);

  actorData.data.combat.totalArmor = calculateTotalArmor(actorData.data);

  // Synchronize sheet data with actor data
  sheetData.data.data = actorData.data;

  return sheetData;
};
