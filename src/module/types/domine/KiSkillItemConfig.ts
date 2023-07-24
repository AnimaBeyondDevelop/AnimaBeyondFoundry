import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type KiSkillItemData = Record<string, never>;

export type KiSkillDataSource = ABFItemBaseDataSource<ABFItems.KI_SKILL, KiSkillItemData>;

export type KiSkillChanges = ItemChanges<KiSkillItemData>;

export const KiSkillItemConfig: ABFItemConfigMinimal<KiSkillDataSource, KiSkillChanges> = {
  type: ABFItems.KI_SKILL,
  isInternal: true,
  fieldPath: ['domine', 'kiSkills'],
  getFromDynamicChanges: changes => {
    return changes.system.dynamic.kiSkills as KiSkillChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-ki-skill',
    containerSelector: '#ki-skills-context-menu-container',
    rowSelector: '.ki-skill-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.kiSkill.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.KI_SKILL
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.KI_SKILL,
        name
      });
    }
  },
};
