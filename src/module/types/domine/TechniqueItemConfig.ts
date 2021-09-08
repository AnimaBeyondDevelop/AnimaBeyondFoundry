import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export type TechniqueItemData = {
  description: { value: string };
  level: { value: number };
  strength: { value: number };
  agility: { value: number };
  dexterity: { value: number };
  constitution: { value: number };
  willPower: { value: number };
  power: { value: number };
  martialKnowledge: { value: number };
};

export type TechniqueDataSource = ABFItemBaseDataSource<ABFItems.TECHNIQUE, TechniqueItemData>;

export type TechniqueChanges = ItemChanges<TechniqueItemData>;

export const TechniqueItemConfig: ABFItemConfig<TechniqueDataSource, TechniqueChanges> = {
  type: ABFItems.TECHNIQUE,
  isInternal: false,
  fieldPath: ['domine', 'techniques'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.techniques as TechniqueChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-technique',
    containerSelector: '#techniques-context-menu-container',
    rowSelector: '.technique-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.technique.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.TECHNIQUE,
      data: {
        description: { value: '' },
        level: { value: 0 },
        strength: { value: 0 },
        agility: { value: 0 },
        dexterity: { value: 0 },
        constitution: { value: 0 },
        willPower: { value: 0 },
        power: { value: 0 },
        martialKnowledge: { value: 0 }
      }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateItem({
        id,
        name,
        data
      });
    }
  },
  onAttach: (data, item) => {
    const items = data.domine.techniques as TechniqueDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.domine.techniques as TechniqueDataSource[]) = [item];
    }
  }
};
