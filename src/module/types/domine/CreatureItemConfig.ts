import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
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
  system: CreatureItemData;
};

export type CreatureChanges = ItemChanges<CreatureChange>;

export const CreatureItemConfig: ABFItemConfigMinimal<CreatureDataSource> = {
  type: ABFItems.CREATURE,
  isInternal: true,
  fieldPath: ['domine', 'creatures'],
  selectors: {
    addItemButtonSelector: 'add-creature',
    containerSelector: '#creatures-context-menu-container',
    rowSelector: '.creature-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.creature.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.CREATURE,
      system: {
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
      const { name, system } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.CREATURE,
        name,
        system
      });
    }
  },
};
