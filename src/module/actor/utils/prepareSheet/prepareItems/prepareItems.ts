import { VALID_ITEM_TYPES } from './constants';
import { attachItemToData } from './util/attachItemToData';

export const prepareItems = (sheetData: ActorSheet.Data) => {
  for (const item of sheetData.items) {
    if (VALID_ITEM_TYPES.includes(item.type)) {
      item.img = item.img || CONST.DEFAULT_TOKEN;

      const { data } = sheetData.actor.data;

      attachItemToData(item, data);
    } else {
      console.warn(`Item with ${item.type} unrecognized. Skipping...`, { item });
    }
  }

  return sheetData;
};
