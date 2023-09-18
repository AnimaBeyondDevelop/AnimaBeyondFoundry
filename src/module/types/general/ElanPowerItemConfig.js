import { nanoid } from '../../../vendor/nanoid/nanoid';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").ElanPowerItemConfig} */
export const ElanPowerItemConfig = ABFItemConfigFactory({
  type: ABFItems.ELAN_POWER,
  isInternal: true,
  fieldPath: [], // This is not used because this is internal to the elan
  getFromDynamicChanges: changes => {
    return changes.system.dynamic.elan_power;
  },
  selectors: {
    addItemButtonSelector: 'add-elan-power',
    containerSelector: '#elan-context-menu-container',
    rowSelector: '.elan-row .powers'
  },
  onCreate: async (actor, elanId) => {
    if (typeof elanId !== 'string') throw new Error('elanId missing');

    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.elanPower.content')
    });

    const InitialData = { level: { value: 0 } };

    /** @type {import("../Items").ElanPowerDataSource} */
    const power = {
      _id: nanoid(),
      type: ABFItems.ELAN_POWER,
      name,
      ...InitialData,

      system: InitialData
    };

    const elan = actor.getInnerItem(ABFItems.ELAN, elanId);

    if (elan) {
      const { system } = elan;

    /** @type {import("../Items").ElanPowerDataSource[]} */
      const powers = [];

      if (!system.powers) {
        powers.push(power);
      } else {
        powers.push(...[...system.powers, power]);
      }

      await actor.updateInnerItem({
        type: ABFItems.ELAN,
        id: elanId,
        system: {
          ...elan.system,
          powers
        }
      });
    }
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const {
        name,
        system: { elanId, level }
      } = changes[id];

      if (!elanId) throw new Error('elanId missing');

      const elan = actor.getInnerItem(ABFItems.ELAN, elanId);

      if (elan) {
        /** @type {import("../Items").ElanPowerDataSource[]} */
        const powers = elan.system.powers;

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
          ...elan.system,
          powers: elan.system.powers.filter(power => power._id !== elanPowerId)
        }
      });
    }
  }
});
