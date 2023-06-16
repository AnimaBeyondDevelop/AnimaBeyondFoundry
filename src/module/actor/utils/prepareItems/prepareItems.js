import { ALL_ITEM_CONFIGURATIONS } from './constants';

export const prepareItems = async actor => {
  const items = actor.getAllItems();

  for (const item of items) {
    const configuration = ALL_ITEM_CONFIGURATIONS[item.type];

    if (configuration) {
      await configuration.onAttach?.(actor, item);

      configuration.prepareItem?.(item);
    } else {
      console.warn(`Item with ${item.type} unrecognized. Skipping...`, { item });
    }
  }
};
