import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export enum PsychicPowerActionTypes {
  ACTIVE = 'active',
  PASSIVE = 'passive'
}

export type PsychicPowerItemData = {
  level: { value: number };
  effects: {
    20: { value: string };
    40: { value: string };
    80: { value: string };
    120: { value: string };
    140: { value: string };
    180: { value: string };
    240: { value: string };
    280: { value: string };
    320: { value: string };
    440: { value: string };
  };
  actionType: { value: PsychicPowerActionTypes };
  hasMaintenance: { value: boolean };
  bonus: { value: number };
};

export type PsychicPowerDataSource = ABFItemBaseDataSource<ABFItems.PSYCHIC_POWER, PsychicPowerItemData>;

export type PsychicPowerChanges = ItemChanges<PsychicPowerItemData>;

export const PsychicPowerItemConfig: ABFItemConfig<PsychicPowerDataSource, PsychicPowerChanges> = {
  type: ABFItems.PSYCHIC_POWER,
  isInternal: false,
  hasSheet: true,
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

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.psychicPower.content')
    });

    const data: PsychicPowerItemData = {
      level: { value: 0 },
      effects: {
        20: { value: '' },
        40: { value: '' },
        80: { value: '' },
        120: { value: '' },
        140: { value: '' },
        180: { value: '' },
        240: { value: '' },
        280: { value: '' },
        320: { value: '' },
        440: { value: '' }
      },
      actionType: { value: PsychicPowerActionTypes.ACTIVE },
      hasMaintenance: { value: false },
      bonus: { value: 0 }
    };

    await actor.createItem({
      name,
      type: ABFItems.PSYCHIC_POWER,
      data
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
