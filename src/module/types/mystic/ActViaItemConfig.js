import { ABFItems } from '../../items/ABFItems';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { INITIAL_INNATE_MAGIC_VIA_DATA } from './InnateMagicViaItemConfig';

/**
 * Initial data for a new act type. Used to infer the type of the data inside `actVia.system`
 * @readonly
 */
export const INITIAL_ACT_VIA_DATA = {
  base: { value: 0 },
  final: { value: 0 }
};

/** @type {import("../Items").ActViaItemConfig} */
export const ActViaItemConfig = ABFItemConfigFactory({
  type: ABFItems.ACT_VIA,
  isInternal: true,
  fieldPath: ['mystic', 'act', 'via'],
  selectors: {
    addItemButtonSelector: 'add-act-via',
    containerSelector: '#act-vias-context-menu-container',
    rowSelector: '.act-via-row'
  },
  onCreate: async actor => {
    const results = await openComplexInputDialog(actor, 'newActVia');
    const name = results['new.actVia.name'];

    await actor.createInnerItem({
      name,
      type: ABFItems.ACT_VIA,
      system: INITIAL_ACT_VIA_DATA
    });
    await actor.createInnerItem({
      name,
      type: ABFItems.INNATE_MAGIC_VIA,
      system: INITIAL_INNATE_MAGIC_VIA_DATA
    });
  }
});
