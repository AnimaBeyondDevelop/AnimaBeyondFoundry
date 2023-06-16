import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';

export const PsychicPowerActionTypes = {
  ACTIVE: 'active',
  PASSIVE: 'passive'
};

export const PsychicPowerItemConfig = {
  type: ABFItems.PSYCHIC_POWER,
  isInternal: false,
  hasSheet: true,
  fieldPath: ['psychic', 'psychicPowers'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.psychicPowers;
  },
  selectors: {
    addItemButtonSelector: 'add-psychic-power',
    containerSelector: '#psychic-powers-context-menu-container',
    rowSelector: '.psychic-power-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.psychicPower.content')
    });

    const system = {
      description: { value: '' },
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
      system
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateItem({
        id,
        name,
        system: data
      });
    }
  },
  onAttach: async (actor, item) => {
    const items = actor.getPsychicPowers();

    for (const psychicPower of items) {
      psychicPower.system.enrichedDescription = await TextEditor.enrichHTML(
        psychicPower.system.description?.value ?? '',
        { async: true }
      );
    }

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      actor.system.psychic.psychicPowers = [item];
    }
  }
};
