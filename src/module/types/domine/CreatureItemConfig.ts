import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type CreatureItemData = {
  fire: { value: unknown };
  water: { value: unknown };
  earth: { value: unknown };
  wood: { value: unknown };
  metal: { value: unknown };
};

export type CreatureDataSource = ABFItemBaseDataSource<ABFItems.CREATURE, CreatureItemData>;

export type CreatureChange = {
  name: string;
  data: CreatureItemData;
};

export type CreatureChanges = ItemChanges<CreatureChange>;

export const CreatureItemConfig: ABFItemConfig<CreatureDataSource, CreatureChanges> = {
  type: ABFItems.CREATURE,
  isInternal: true,
  fieldPath: ['domine', 'creatures'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.creatures as CreatureChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-creature',
    containerSelector: '#creatures-context-menu-container',
    rowSelector: '.creature-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.creature.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.CREATURE,
      data: {
        earth: {
          value: false
        },
        fire: {
          value: false
        },
        metal: {
          value: false
        },
        water: {
          value: false
        },
        wood: {
          value: false
        }
      }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.CREATURE,
        name,
        data
      });
    }
  },
  onAttach: (data, item) => {
    const items = data.domine.creatures as CreatureDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.domine.creatures as CreatureDataSource[]) = [item];
    }
  }
};
