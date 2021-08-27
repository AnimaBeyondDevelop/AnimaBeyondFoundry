import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../actor/utils/prepareSheet/prepareItems/ABFItems';
import { openDialog } from '../../utils/openDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export type MartialArtItemData = {
  grade: { value: string };
};

export type MartialArtDataSource = ABFItemBaseDataSource<ABFItems.MARTIAL_ART, MartialArtItemData>;

export type MartialArtChanges = ItemChanges<MartialArtItemData>;

export const MartialArtItemConfig: ABFItemConfig<MartialArtDataSource, MartialArtChanges> = {
  type: ABFItems.MARTIAL_ART,
  isInternal: true,
  fieldPath: ['domine', 'martialArts'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.martialArts as MartialArtChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-martial-art',
    containerSelector: '#martial-arts-context-menu-container',
    rowSelector: '.martial-art-row',
    rowIdData: 'martialArtId'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openDialog<string>({
      content: i18n.localize('dialogs.items.martialArt.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.MARTIAL_ART,
      data: {
        grade: { value: '' }
      }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.MARTIAL_ART,
        name,
        data
      });
    }
  },
  onAttach: (data, item) => {
    const items = data.domine.martialArts as MartialArtDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.domine.martialArts as MartialArtDataSource[]) = [item];
    }
  }
};
