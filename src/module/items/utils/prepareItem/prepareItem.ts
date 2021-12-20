import ABFItem from '../../ABFItem';
import { ABFItems } from '../../ABFItems';
import { ALL_ITEM_CONFIGURATIONS } from '../../../actor/utils/prepareItems/constants';

export const prepareItem = (item: ABFItem) => {
  if (item.type === ABFItems.WEAPON) {
    ALL_ITEM_CONFIGURATIONS[item.type]?.prepareItem?.(item);
  }
};
