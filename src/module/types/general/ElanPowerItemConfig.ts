import { nanoid } from '../../../vendor/nanoid/nanoid';
import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';

export type ElanPowerItemData = {
  level: { value: number };
};

export type ElanPowerDataSource = ABFItemBaseDataSource<
  ABFItems.ELAN_POWER,
  ElanPowerItemData
>;

export type ElanPowerChanges = ItemChanges<ElanPowerItemData & { elanId: string }>;

export const ElanPowerItemConfig: ABFItemConfigMinimal<ElanPowerDataSource, ElanPowerChanges> = {
  type: ABFItems.ELAN_POWER,
  isInternal: true,
  fieldPath: [], // This is not used because this is internal to the elan
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.elan_power as ElanPowerChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-elan-power',
    containerSelector: '#elan-context-menu-container',
    rowSelector: '.elan-row .powers'
  },
  onCreate: async (actor, elanId): Promise<void> => {
    if (typeof elanId !== 'string') throw new Error('elanId missing');

    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.elanPower.content')
    });

    const InitialData = { level: { value: 0 } };

    const power: ElanPowerDataSource = {
      _id: nanoid(),
      type: ABFItems.ELAN_POWER,
      name,
      ...InitialData,

      system: InitialData
    };

    const elan = actor.getInnerItem(ABFItems.ELAN, elanId);

    if (elan) {
      const { system } = elan;

      const powers: ElanPowerDataSource[] = [];

      if (!system.powers) {
        powers.push(power);
      } else {
        powers.push(...[...system.powers, power]);
      }

      await actor.updateInnerItem({
        type: ABFItems.ELAN,
        id: elanId,
        system: {
          ...elan.data,
          powers
        }
      });
    }
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const {
        name,
        data: { elanId, level }
      } = changes[id];

      if (!elanId) throw new Error('elanId missing');

      const elan = actor.getInnerItem(ABFItems.ELAN, elanId);

      if (elan) {
        const powers = elan.system.powers as ElanPowerDataSource[];

        const elanPower = powers.find(power => power._id === id);

        if (elanPower) {
          if (elanPower.name === name && elanPower.system.level.value === level.value) {
            continue;
          }

          elanPower.name = name;
          elanPower.system.level.value = level.value;

          const system = {
            ...elan.system,
            powers: [...powers]
          };

          await actor.updateInnerItem(
            {
              type: ABFItems.ELAN,
              id: elanId,
              ...system,

              system
            },
            true
          );
        }
      }
    }
  },
  onDelete: async (actor, target) => {
    const { elanId } = target[0].dataset;

    if (!elanId) {
      throw new Error('Data id missing. Are you sure to set data-elan-id to rows?');
    }

    const { elanPowerId } = target[0].dataset;

    if (!elanPowerId) {
      throw new Error('Data id missing. Are you sure to set data-elan-power-id to rows?');
    }

    const elan = actor.getInnerItem(ABFItems.ELAN, elanId);

    if (elan) {
      await actor.updateInnerItem({
        type: ABFItems.ELAN,
        id: elanId,
        system: {
          ...elan.data,
          powers: elan.data.powers.filter(power => power._id !== elanPowerId)
        }
      });
    }
  }
};
