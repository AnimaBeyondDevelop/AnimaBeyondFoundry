import { prepareItems } from './prepareItems/prepareItems';

export const prepareSheet = (sheetData: ActorSheet.Data): ActorSheet.Data => {
  // Attach to the actor data the items like skills, free access spells, etc...
  // In resume, all items that are created dynamically in the actor
  sheetData = prepareItems(sheetData);

  // Synchronize sheet data with actor data
  sheetData.data.data = sheetData.actor.data.data;

  return sheetData;
};
