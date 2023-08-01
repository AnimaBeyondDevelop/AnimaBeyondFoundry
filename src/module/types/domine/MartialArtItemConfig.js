import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").MartialArtItemConfig} */
export const MartialArtItemConfig = ABFItemConfigFactory({
  type: ABFItems.MARTIAL_ART,
  isInternal: true,
  fieldPath: ['domine', 'martialArts'],
  selectors: {
    addItemButtonSelector: 'add-martial-art',
    containerSelector: '#martial-arts-context-menu-container',
    rowSelector: '.martial-art-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.martialArt.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.MARTIAL_ART,
      system: {
        grade: { value: '' }
      }
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.MARTIAL_ART,
        name,
        system
      });
    }
  },
});
