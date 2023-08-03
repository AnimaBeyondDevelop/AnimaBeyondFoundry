import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").SpecialSkillItemConfig} */
export const SpecialSkillItemConfig = ABFItemConfigFactory({
  type: ABFItems.SPECIAL_SKILL,
  isInternal: true,
  fieldPath: ['domine', 'specialSkills'],
  selectors: {
    addItemButtonSelector: 'add-special-skill',
    containerSelector: '#special-skills-context-menu-container',
    rowSelector: '.special-skill-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.specialSkill.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.SPECIAL_SKILL
    });
  }
});
