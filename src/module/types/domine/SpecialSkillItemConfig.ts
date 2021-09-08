import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type SpecialSkillItemData = Record<string, never>;

export type SpecialSkillDataSource = ABFItemBaseDataSource<ABFItems.SPECIAL_SKILL, SpecialSkillItemData>;

export type SpecialSkillChanges = ItemChanges<SpecialSkillItemData>;

export const SpecialSkillItemConfig: ABFItemConfig<SpecialSkillDataSource, SpecialSkillChanges> = {
  type: ABFItems.SPECIAL_SKILL,
  isInternal: true,
  fieldPath: ['domine', 'specialSkills'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.specialSkills as SpecialSkillChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-special-skill',
    containerSelector: '#special-skills-context-menu-container',
    rowSelector: '.special-skill-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.specialSkill.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.SPECIAL_SKILL
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.SPECIAL_SKILL, name });
    }
  },
  onAttach: (data, item) => {
    const items = data.domine.specialSkills as SpecialSkillDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.domine.specialSkills as SpecialSkillDataSource[]) = [item];
    }
  }
};
