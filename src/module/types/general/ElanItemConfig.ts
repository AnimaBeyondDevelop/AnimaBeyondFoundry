import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ElanPowerItemConfig } from './ElanPowerItemConfig';

export type ElanItemData = {
  level: { value: string };
};

export type ElanDataSource = ABFItemBaseDataSource<ABFItems.ELAN, ElanItemData>;

export type ElanChanges = ItemChanges<ElanItemData>;

export const ElanItemConfig: ABFItemConfig<ElanDataSource, ElanChanges> = {
  type: ABFItems.ELAN,
  isInternal: true,
  fieldPath: ['general', 'elan'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.elan as ElanChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-elan',
    containerSelector: '#elan-context-menu-container',
    rowSelector: '.elan-row .base'
  },
  contextMenuConfig: {
    buildExtraOptionsInContextMenu: actor => [
      {
        name: (game as Game).i18n.localize('contextualMenu.elan.options.addPower'),
        icon: '<i class="fa fa-plus" aria-hidden="true"></i>',
        callback: target => {
          const { itemId } = target[0].dataset;

          if (!itemId) throw new Error('elanId missing');

          ElanPowerItemConfig.onCreate(actor, itemId);
        }
      }
    ]
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.elan.content')
    });

    actor.createInnerItem({
      name,
      type: ABFItems.ELAN,
      data: {
        level: { value: 0 },
        powers: []
      }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      const elan = actor.getInnerItem(ABFItems.ELAN, id);

      actor.updateInnerItem({
        type: ABFItems.ELAN,
        id,
        name,
        data: { ...elan.data, ...data }
      });
    }
  },
  onAttach: (data, item) => {
    const items = data.general.elan as ElanDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.general.elan as ElanDataSource[]) = [item];
    }
  }
};
