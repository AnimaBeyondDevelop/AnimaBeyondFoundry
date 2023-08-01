import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").PsychicDisciplineItemConfig} */
export const PsychicDisciplineItemConfig = ABFItemConfigFactory({
  type: ABFItems.PSYCHIC_DISCIPLINE,
  isInternal: false,
  fieldPath: ['psychic', 'psychicDisciplines'],
  selectors: {
    addItemButtonSelector: 'add-psychic-discipline',
    containerSelector: '#psychic-disciplines-context-menu-container',
    rowSelector: '.psychic-discipline-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.psychicDiscipline.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.PSYCHIC_DISCIPLINE
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.PSYCHIC_DISCIPLINE, name });
    }
  }
});
