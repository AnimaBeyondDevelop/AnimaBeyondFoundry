import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type PsychicDisciplineItemData = Record<string, never>;

export type PsychicDisciplineDataSource = ABFItemBaseDataSource<ABFItems.PSYCHIC_DISCIPLINE, PsychicDisciplineItemData>;

export type PsychicDisciplineChanges = ItemChanges<PsychicDisciplineItemData>;

export const PsychicDisciplineItemConfig: ABFItemConfig<PsychicDisciplineDataSource, PsychicDisciplineChanges> = {
  type: ABFItems.PSYCHIC_DISCIPLINE,
  isInternal: false,
  fieldPath: ['psychic', 'psychicDisciplines'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.psychicDisciplines as PsychicDisciplineChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-psychic-discipline',
    containerSelector: '#psychic-disciplines-context-menu-container',
    rowSelector: '.psychic-discipline-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.psychicDiscipline.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.PSYCHIC_DISCIPLINE
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.PSYCHIC_DISCIPLINE, name });
    }
  },
  onAttach: (data, item) => {
    const items = data.psychic.psychicDisciplines as PsychicDisciplineDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.psychic.psychicDisciplines as PsychicDisciplineDataSource[]) = [item];
    }
  }
};
