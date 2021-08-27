import { ITEM_CONFIGURATIONS } from './constants';

export const prepareItems = (sheetData: ActorSheet.Data) => {
  for (const item of sheetData.items) {
    const configuration = ITEM_CONFIGURATIONS[item.type];

    if (configuration) {
      item.img = item.img || CONST.DEFAULT_TOKEN;

      const { data } = sheetData.actor.data;

      configuration.onAttach?.(data, item as any);
    } else {
      console.warn(`Item with ${item.type} unrecognized. Skipping...`, { item });
    }
  }

  return sheetData;
};
