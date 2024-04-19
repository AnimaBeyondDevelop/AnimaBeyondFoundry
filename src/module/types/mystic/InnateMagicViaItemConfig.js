import { ABFItems } from '../../items/ABFItems';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * Initial data for a new innateMagic via. Used to infer the type of the data inside `innateMagicVia.system`
 * @readonly
 */
export const INITIAL_INNATE_MAGIC_VIA_DATA = {
  base: { value: 0 },
  final: { value: 0 }
};

/** @type {import("../Items").InnateMagicViaItemConfig} */
export const InnateMagicViaItemConfig = ABFItemConfigFactory({
  type: ABFItems.INNATE_MAGIC_VIA,
  isInternal: true,
  fieldPath: ['mystic', 'innateMagic', 'via'],
  selectors: {
    containerSelector: '#innate-magic-vias-context-menu-container',
    rowSelector: '.innate-magic-via-row'
  },
});
