import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';

export type InnatePsychicPowerItemData = {
  effect: { value: string };
  value: { value: number };
};

export type InnatePsychicPowerDataSource = ABFItemBaseDataSource<
  ABFItems.INNATE_PSYCHIC_POWER,
  InnatePsychicPowerItemData
>;

export type InnatePsychicPowerChanges = ItemChanges<InnatePsychicPowerItemData>;

export const InnatePsychicPowerItemConfig: ABFItemConfigMinimal<InnatePsychicPowerDataSource, InnatePsychicPowerChanges> = {
  type: ABFItems.INNATE_PSYCHIC_POWER,
  isInternal: true,
  fieldPath: ['psychic', 'innatePsychicPowers'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.innatePsychicPowers as InnatePsychicPowerChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-innate-psychic-power',
    containerSelector: '#innate-psychic-powers-context-menu-container',
    rowSelector: '.innate-psychic-power-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.innatePsychicPower.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.INNATE_PSYCHIC_POWER,
      system: {
        effect: { value: '' },
        value: { value: 0 }
      }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.INNATE_PSYCHIC_POWER,
        name,
        system: data
      });
    }
  },
  onAttach: (actor, item) => {
    const items = actor.getInnatePsychicPowers();

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      actor.system.psychic.innatePsychicPowers = [item];
    }
  }
};
