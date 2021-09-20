import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type NemesisSkillItemData = Record<string, never>;

export type NemesisSkillDataSource = ABFItemBaseDataSource<ABFItems.NEMESIS_SKILL, NemesisSkillItemData>;

export type NemesisSkillChanges = ItemChanges<NemesisSkillItemData>;

export const NemesisSkillItemConfig: ABFItemConfig<NemesisSkillDataSource, NemesisSkillChanges> = {
  type: ABFItems.NEMESIS_SKILL,
  isInternal: true,
  fieldPath: ['domine', 'nemesisSkills'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.nemesisSkills as NemesisSkillChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-nemesis-skill',
    containerSelector: '#nemesis-skills-context-menu-container',
    rowSelector: '.nemesis-skill-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
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
  onAttach: (data, item) => {
    const items = data.domine.nemesisSkills as NemesisSkillDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.domine.nemesisSkills as NemesisSkillDataSource[]) = [item];
    }
  }
};
