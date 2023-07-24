import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';

export type CombatSpecialSkillItemData = Record<string, never>;

export type CombatSpecialSkillDataSource = ABFItemBaseDataSource<
  ABFItems.COMBAT_SPECIAL_SKILL,
  CombatSpecialSkillItemData
>;

export type CombatSpecialSkillChanges = ItemChanges<CombatSpecialSkillItemData>;

export const CombatSpecialSkillItemConfig: ABFItemConfigMinimal<
  CombatSpecialSkillDataSource,
  CombatSpecialSkillChanges
> = {
  type: ABFItems.COMBAT_SPECIAL_SKILL,
  isInternal: true,
  fieldPath: ['combat', 'combatSpecialSkills'],
  getFromDynamicChanges: changes => {
    return changes.system.dynamic.combatSpecialSkills as CombatSpecialSkillChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-combat-special-skill',
    containerSelector: '#combat-special-skills-context-menu-container',
    rowSelector: '.combat-special-skill-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.combatSpecialSkills.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.COMBAT_SPECIAL_SKILL
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.COMBAT_SPECIAL_SKILL,
        name
      });
    }
  },
};
