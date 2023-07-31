import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type PsychicDisciplineItemData = Record<string, never>;

export type PsychicDisciplineDataSource = ABFItemBaseDataSource<ABFItems.PSYCHIC_DISCIPLINE, PsychicDisciplineItemData>;

export type PsychicDisciplineChanges = ItemChanges<PsychicDisciplineItemData>;

export const PsychicDisciplineItemConfig: ABFItemConfigMinimal<PsychicDisciplineDataSource> = {
  type: ABFItems.PSYCHIC_DISCIPLINE,
  isInternal: false,
  fieldPath: ['psychic', 'psychicDisciplines'],
  selectors: {
    addItemButtonSelector: 'add-psychic-discipline',
    containerSelector: '#psychic-disciplines-context-menu-container',
    rowSelector: '.psychic-discipline-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
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
  onAttach: (actor, item) => {
    const items = actor.getPsychicDisciplines();

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      actor.system.psychic.psychicDisciplines = [item];
    }
  }
};
