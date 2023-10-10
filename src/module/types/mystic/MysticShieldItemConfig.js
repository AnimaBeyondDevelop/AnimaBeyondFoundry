import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { SpellGrades } from './SpellItemConfig';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * Initial data for a new psychic power. Used to infer the type of the data inside `power.system`
 * @readonly
 */
export const INITIAL_MYSTIC_SHIELD_DATA = {
    grade: { value: SpellGrades.BASE },
    damageBarrier: { value: 0 },
    shieldPoints: { value: 0 }
};

/** @type {import("../Items").MysticShieldItemConfig} */
export const MysticShieldItemConfig = ABFItemConfigFactory({
  type: ABFItems.MYSTIC_SHIELD,
  isInternal: false,
  fieldPath: ['mystic', 'mysticShields'],
  selectors: {
    addItemButtonSelector: 'add-mystic-shield',
    containerSelector: '#mystic-shields-context-menu-container',
    rowSelector: '.mystic-shield-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.mysticShield.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.MYSTIC_SHIELD,
      system: INITIAL_MYSTIC_SHIELD_DATA
    });
  }
});
