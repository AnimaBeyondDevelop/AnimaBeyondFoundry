import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").CombatSpecialSkillItemConfig} */
export const CombatSpecialSkillItemConfig = ABFItemConfigFactory({
  type: ABFItems.COMBAT_SPECIAL_SKILL,
  isInternal: true,
  fieldPath: ['combat', 'combatSpecialSkills'],
  selectors: {
    addItemButtonSelector: 'add-combat-special-skill',
    containerSelector: '#combat-special-skills-context-menu-container',
    rowSelector: '.combat-special-skill-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.combatSpecialSkills.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.COMBAT_SPECIAL_SKILL
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.COMBAT_SPECIAL_SKILL,
        name
      });
    }
  },
});
