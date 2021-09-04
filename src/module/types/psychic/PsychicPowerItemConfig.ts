import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openDialog } from '../../utils/openDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export enum PsychicPowerActionTypes {
  ACTIVE = 'active',
  PASSIVE = 'passive'
}

export type PsychicPowerItemData = {
  level: { value: number };
  effects: string[];
  actionType: { value: PsychicPowerActionTypes };
  hasMaintenance: { value: boolean };
  bonus: { value: number };
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

    const data: PsychicPowerItemData = {
      level: { value: 0 },
      effects: new Array(10).fill({ value: '' }),
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
