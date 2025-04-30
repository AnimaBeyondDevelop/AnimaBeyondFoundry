import { WeaponKnowledgeType } from '@module/data/items/enums/WeaponEnums';

/** @param {WeaponDataSource} weapon */
export const getWeaponKnowledgePenalty = weapon => {
  switch (weapon.system.knowledgeType.value) {
    case WeaponKnowledgeType.SIMILAR:
      return -20;
    case WeaponKnowledgeType.MIXED:
      return -40;
    case WeaponKnowledgeType.DIFFERENT:
      return -60;
    default:
      return 0;
  }
};
