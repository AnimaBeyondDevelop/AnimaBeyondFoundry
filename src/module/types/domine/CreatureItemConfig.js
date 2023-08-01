import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").CreatureItemConfig} */
export const CreatureItemConfig = ABFItemConfigFactory({
  type: ABFItems.CREATURE,
  isInternal: true,
  fieldPath: ['domine', 'creatures'],
  selectors: {
    addItemButtonSelector: 'add-creature',
    containerSelector: '#creatures-context-menu-container',
    rowSelector: '.creature-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

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
  onUpdate: async (actor, changes) => {
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
});
