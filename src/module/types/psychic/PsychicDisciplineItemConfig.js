import { ABFItems } from '../../items/ABFItems';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * Initial data for a new act type. Used to infer the type of the data inside `actVia.system`
 * @readonly
 */
export const INITIAL_PSYCHIC_DISCIPLINE_DATA = {
  imbalance: { value: false }
};

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
    const results = await openComplexInputDialog(actor, 'newPsychicDiscipline');
    const name = results['new.psychicDiscipline.name'];
    const imbalance = results['new.psychicDiscipline.imbalance'];

    await actor.createItem({
      name,
      type: ABFItems.PSYCHIC_DISCIPLINE,
      system: { imbalance: { value: imbalance } }
    });
  }
});
