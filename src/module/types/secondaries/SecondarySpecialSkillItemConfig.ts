import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export type SecondarySpecialSkillItemData = {
  level: { value: number };
};

export type SecondarySpecialSkillDataSource = ABFItemBaseDataSource<
  ABFItems.SECONDARY_SPECIAL_SKILL,
  SecondarySpecialSkillItemData
>;

export type SecondarySpecialSkillChanges = ItemChanges<SecondarySpecialSkillItemData>;

export const SecondarySpecialSkillItemConfig: ABFItemConfig<
  SecondarySpecialSkillDataSource,
  SecondarySpecialSkillChanges
> = {
  type: ABFItems.SECONDARY_SPECIAL_SKILL,
  isInternal: true,
  fieldPath: ['secondaries', 'secondarySpecialSkills'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.secondarySpecialSkills as SecondarySpecialSkillChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-secondary-special-skill',
    containerSelector: '#secondary-special-skills-context-menu-container',
    rowSelector: '.secondary-special-skill-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.secondarySkill.content')
    });

    actor.createInnerItem({ type: ABFItems.SECONDARY_SPECIAL_SKILL, name, data: { level: { value: 0 } } });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      actor.updateInnerItem({ type: ABFItems.SECONDARY_SPECIAL_SKILL, id, name, data });
    }
  },
  onAttach: (data, item) => {
    const items = data.secondaries.secondarySpecialSkills as SecondarySpecialSkillDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.secondaries.secondarySpecialSkills as SecondarySpecialSkillDataSource[]) = [item];
    }
  }
};
