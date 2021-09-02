import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openDialog } from '../../utils/openDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export type PsychicPowerItemData = {
  level: { value: string };
  effects: string[];
  actionType: { value: string };
  hasMaintenance: { value: unknown };
  bonus: { value: string };
};

export type PsychicPowerDataSource = ABFItemBaseDataSource<ABFItems.PSYCHIC_POWER, PsychicPowerItemData>;

export type PsychicPowerChanges = ItemChanges<PsychicPowerItemData>;

export const PsychicPowerItemConfig: ABFItemConfig<PsychicPowerDataSource, PsychicPowerChanges> = {
  type: ABFItems.PSYCHIC_POWER,
  isInternal: false,
  fieldPath: ['psychic', 'psychicPowers'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.psychicPowers as PsychicPowerChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-psychic-power',
    containerSelector: '#psychic-powers-context-menu-container',
    rowSelector: '.psychic-power-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openDialog<string>({
      content: i18n.localize('dialogs.items.psychicPower.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.PSYCHIC_POWER,
      data: {
        level: { value: 0 },
        effects: new Array(10).fill({ value: '' }),
        actionType: { value: '' },
        hasMaintenance: { value: false },
        bonus: { value: 0 }
      }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      const { effects: effectsObject } = data;

      const effects = [];

      for (const key of Object.keys(effectsObject)) {
        effects[key] = { value: effectsObject[key] };
      }

      await actor.updateItem({
        id,
        name,
        data: {
          ...data,
          effects
        }
      });
    }
  },
  onAttach: (data, item) => {
    const items = data.psychic.psychicPowers as PsychicPowerDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.psychic.psychicPowers as PsychicPowerDataSource[]) = [item];
    }
  }
};
