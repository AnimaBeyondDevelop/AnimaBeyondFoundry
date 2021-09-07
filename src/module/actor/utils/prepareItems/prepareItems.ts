import { ITEM_CONFIGURATIONS } from './constants';
import { ABFActor } from '../../ABFActor';

export const prepareItems = (actor: ABFActor) => {
  for (const item of actor.items.values()) {
    const configuration = ITEM_CONFIGURATIONS[item.type];

    if (configuration) {
      const { data } = actor.data;

      configuration.onAttach?.(data, item.data as any);
      configuration.prepareItem?.(item);
    } else {
      console.warn(`Item with ${item.type} unrecognized. Skipping...`, { item });
    }
  }
};
