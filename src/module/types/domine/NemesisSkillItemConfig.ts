import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type NemesisSkillItemData = Record<string, never>;

export type NemesisSkillDataSource = ABFItemBaseDataSource<ABFItems.NEMESIS_SKILL, NemesisSkillItemData>;

export type NemesisSkillChanges = ItemChanges<NemesisSkillItemData>;

export const NemesisSkillItemConfig: ABFItemConfigMinimal<NemesisSkillDataSource, NemesisSkillChanges> = {
  type: ABFItems.NEMESIS_SKILL,
  isInternal: true,
  fieldPath: ['domine', 'nemesisSkills'],
  getFromDynamicChanges: changes => {
    return changes.system.dynamic.nemesisSkills as NemesisSkillChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-nemesis-skill',
    containerSelector: '#nemesis-skills-context-menu-container',
    rowSelector: '.nemesis-skill-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.nemesisSkill.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.NEMESIS_SKILL
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.NEMESIS_SKILL, name });
    }
  },
};
