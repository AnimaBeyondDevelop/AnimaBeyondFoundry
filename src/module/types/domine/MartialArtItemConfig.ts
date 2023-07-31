import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';

export type MartialArtItemData = {
  grade: { value: string };
};

export type MartialArtDataSource = ABFItemBaseDataSource<ABFItems.MARTIAL_ART, MartialArtItemData>;

export type MartialArtChanges = ItemChanges<MartialArtItemData>;

export const MartialArtItemConfig: ABFItemConfigMinimal<MartialArtDataSource> = {
  type: ABFItems.MARTIAL_ART,
  isInternal: true,
  fieldPath: ['domine', 'martialArts'],
  selectors: {
    addItemButtonSelector: 'add-martial-art',
    containerSelector: '#martial-arts-context-menu-container',
    rowSelector: '.martial-art-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

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
  onUpdate: async (actor, changes): Promise<void> => {
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
};
