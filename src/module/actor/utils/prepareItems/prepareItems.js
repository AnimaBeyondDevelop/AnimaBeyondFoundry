import { ALL_ITEM_CONFIGURATIONS } from './constants';

export const prepareItems = actor => {
  for (const itemType in ALL_ITEM_CONFIGURATIONS) {
    if (ALL_ITEM_CONFIGURATIONS.hasOwnProperty(itemType)) {
      const config = ALL_ITEM_CONFIGURATIONS[itemType];
      config.resetFieldPath(actor);
    }
  }
};
